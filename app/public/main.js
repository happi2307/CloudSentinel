const elements = {
  tagline: document.getElementById("tagline"),
  stackList: document.getElementById("stackList"),
  timeline: document.getElementById("timeline"),
  progressBar: document.getElementById("progressBar"),
  progressLabel: document.getElementById("progressLabel"),
  runPipelineBtn: document.getElementById("runPipelineBtn"),
  pipelineStatus: document.getElementById("pipelineStatus"),
  scanSummary: document.getElementById("scanSummary"),
  findingList: document.getElementById("findingList"),
  infraList: document.getElementById("infraList"),
  architectureList: document.getElementById("architectureList"),
};

let pollingTimer = null;

const setPipelineStatus = (status) => {
  elements.pipelineStatus.classList.remove("running", "success");
  if (status === "running") {
    elements.pipelineStatus.textContent = "Pipeline running";
    elements.pipelineStatus.classList.add("running");
    return;
  }

  if (status === "success") {
    elements.pipelineStatus.textContent = "Pipeline completed";
    elements.pipelineStatus.classList.add("success");
    return;
  }

  elements.pipelineStatus.textContent = "Idle";
};

const renderStack = (stack = []) => {
  elements.stackList.innerHTML = stack.map((item) => `<span class="chip">${item}</span>`).join("");
};

const renderTimeline = (stages = []) => {
  elements.timeline.innerHTML = stages
    .map((stage) => {
      const duration = stage.durationMs ? `${stage.durationMs}ms` : "--";
      return `
        <article class="timeline-item ${stage.status}">
          <div>
            <strong>${stage.name}</strong>
            <div>${stage.description}</div>
          </div>
          <div class="mono">${stage.status.toUpperCase()} | ${duration}</div>
        </article>
      `;
    })
    .join("");
};

const renderScan = (scanSummary) => {
  elements.scanSummary.innerHTML = `
    <span class="metric">Policies: ${scanSummary.totalPolicies}</span>
    <span class="metric">Passed: ${scanSummary.passed}</span>
    <span class="metric fail">Failed: ${scanSummary.failed}</span>
  `;

  elements.findingList.innerHTML = scanSummary.highRiskFindings
    .map((finding) => `<li>${finding}</li>`)
    .join("");
};

const renderInfra = (highlights = [], architecture = {}) => {
  elements.infraList.innerHTML = highlights.map((line) => `<li>${line}</li>`).join("");

  elements.architectureList.innerHTML = Object.entries(architecture)
    .map(([key, value]) => `<div class="keyval"><span>${key}</span><span>${value}</span></div>`)
    .join("");
};

const renderPipelineState = (run, stageTemplates) => {
  if (!run) {
    renderTimeline(
      stageTemplates.map((stage) => ({
        ...stage,
        status: "pending",
        durationMs: null,
      }))
    );
    elements.progressBar.style.width = "0%";
    elements.progressLabel.textContent = "0%";
    setPipelineStatus("idle");
    return;
  }

  renderTimeline(run.stages);
  elements.progressBar.style.width = `${run.progress}%`;
  elements.progressLabel.textContent = `${run.progress}%`;
  setPipelineStatus(run.status);
};

const getJson = async (url, options) => {
  const response = await fetch(url, options);
  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`);
  }
  return response.json();
};

const refreshData = async () => {
  const demo = await getJson("/api/demo");
  elements.tagline.textContent = demo.project.tagline;
  renderStack(demo.project.stack);
  renderScan(demo.scanSummary);
  renderInfra(demo.terraformHighlights, demo.architecture);
  renderPipelineState(demo.pipeline.currentRun, demo.pipeline.stages);
};

const pollPipeline = async () => {
  try {
    const payload = await getJson("/api/pipeline");
    renderPipelineState(payload.currentRun, payload.stages);

    if (!payload.currentRun || payload.currentRun.status !== "running") {
      if (pollingTimer) {
        clearInterval(pollingTimer);
        pollingTimer = null;
      }
    }
  } catch (error) {
    console.error(error);
  }
};

const startPipeline = async () => {
  elements.runPipelineBtn.disabled = true;
  try {
    await getJson("/api/pipeline/run", { method: "POST" });
    await pollPipeline();

    if (!pollingTimer) {
      pollingTimer = setInterval(pollPipeline, 1000);
    }
  } catch (error) {
    console.error(error);
  } finally {
    elements.runPipelineBtn.disabled = false;
  }
};

elements.runPipelineBtn.addEventListener("click", startPipeline);

refreshData().catch((error) => {
  console.error(error);
  elements.tagline.textContent = "Unable to load demo data. Check server logs.";
});
