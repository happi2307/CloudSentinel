const elements = {
  tagline: document.getElementById("tagline"),
  jenkinsMeta: document.getElementById("jenkinsMeta"),
  stackList: document.getElementById("stackList"),
  timeline: document.getElementById("timeline"),
  progressBar: document.getElementById("progressBar"),
  progressLabel: document.getElementById("progressLabel"),
  runPipelineBtn: document.getElementById("runPipelineBtn"),
  pipelineStatus: document.getElementById("pipelineStatus"),
  buildHistory: document.getElementById("buildHistory"),
  scanSummary: document.getElementById("scanSummary"),
  findingList: document.getElementById("findingList"),
  infraList: document.getElementById("infraList"),
  architectureList: document.getElementById("architectureList"),
};

let pollingTimer = null;
let pollingIntervalMs = 6000;

const safeText = (value) => {
  const asString = String(value ?? "");
  return asString
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#039;");
};

const formatDuration = (durationMs) => {
  if (!durationMs && durationMs !== 0) {
    return "--";
  }

  if (durationMs < 1000) {
    return `${durationMs}ms`;
  }

  const seconds = Math.round(durationMs / 1000);
  return `${seconds}s`;
};

const formatTime = (timestampMs) => {
  if (!timestampMs) {
    return "--";
  }

  return new Date(timestampMs).toLocaleString();
};

const setPipelineStatus = (status) => {
  elements.pipelineStatus.classList.remove("running", "success", "failed", "aborted");
  if (status === "running") {
    elements.pipelineStatus.textContent = "Build running";
    elements.pipelineStatus.classList.add("running");
    return;
  }

  if (status === "success") {
    elements.pipelineStatus.textContent = "Build succeeded";
    elements.pipelineStatus.classList.add("success");
    return;
  }

  if (status === "failed") {
    elements.pipelineStatus.textContent = "Build failed";
    elements.pipelineStatus.classList.add("failed");
    return;
  }

  if (status === "aborted") {
    elements.pipelineStatus.textContent = "Build aborted";
    elements.pipelineStatus.classList.add("aborted");
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
      const normalizedStatus = String(stage.status || "pending").toLowerCase();
      const duration = formatDuration(stage.durationMs);
      return `
        <article class="timeline-item ${safeText(normalizedStatus)}">
          <div>
            <strong>${safeText(stage.name)}</strong>
            <div>${safeText(stage.description || "")}</div>
          </div>
          <div class="mono">${safeText(normalizedStatus.toUpperCase())} | ${safeText(duration)}</div>
        </article>
      `;
    })
    .join("");
};

const renderBuildHistory = (history = []) => {
  if (!history.length) {
    elements.buildHistory.innerHTML = '<p class="subtitle">No builds found for this Jenkins job yet.</p>';
    return;
  }

  elements.buildHistory.innerHTML = history
    .map((build) => {
      const status = String(build.status || "unknown").toLowerCase();
      const details = `${formatTime(build.timestamp)} | ${formatDuration(build.durationMs)}`;
      const link = build.url
        ? `<a href="${safeText(build.url)}" target="_blank" rel="noreferrer">Open</a>`
        : "";

      return `
        <article class="history-item ${safeText(status)}">
          <div>
            <strong>${safeText(build.displayName || `#${build.number}`)}</strong>
            <div class="mono">${safeText(details)}</div>
          </div>
          <div class="history-meta">
            <span class="history-status">${safeText(status.toUpperCase())}</span>
            ${link}
          </div>
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
  if (run.url) {
    elements.progressLabel.textContent = `${run.progress}% | #${run.buildNumber}`;
  }
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
  elements.jenkinsMeta.textContent = `Jenkins: ${demo.jenkins.configured ? "connected" : "not configured"} | ${demo.jenkins.baseUrl || "N/A"} | Job: ${demo.jenkins.jobName || "N/A"}`;
  renderStack(demo.project.stack);
  renderScan(demo.scanSummary);
  renderInfra(demo.terraformHighlights, demo.architecture);
  renderPipelineState(demo.pipeline.currentRun, demo.pipeline.stages || []);
  renderBuildHistory(demo.pipeline.history || []);

  if (demo.pipeline.message && !demo.jenkins.configured) {
    elements.pipelineStatus.textContent = "Configure Jenkins env";
  }
};

const pollPipeline = async () => {
  try {
    const payload = await getJson("/api/pipeline");
    renderPipelineState(payload.currentRun, payload.stages || []);
    renderBuildHistory(payload.history || []);

    if (payload.currentRun && payload.currentRun.status === "running" && pollingIntervalMs !== 2000) {
      pollingIntervalMs = 2000;
      if (pollingTimer) {
        clearInterval(pollingTimer);
        pollingTimer = setInterval(pollPipeline, pollingIntervalMs);
      }
    }

    if ((!payload.currentRun || payload.currentRun.status !== "running") && pollingIntervalMs !== 6000) {
      pollingIntervalMs = 6000;
      if (pollingTimer) {
        clearInterval(pollingTimer);
        pollingTimer = setInterval(pollPipeline, pollingIntervalMs);
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

    pollingIntervalMs = 2000;
    if (pollingTimer) {
      clearInterval(pollingTimer);
    }
    pollingTimer = setInterval(pollPipeline, pollingIntervalMs);
  } catch (error) {
    console.error(error);
    elements.pipelineStatus.textContent = "Failed to trigger build";
  } finally {
    elements.runPipelineBtn.disabled = false;
  }
};

elements.runPipelineBtn.addEventListener("click", startPipeline);

refreshData().catch((error) => {
  console.error(error);
  elements.tagline.textContent = "Unable to load demo data. Check server logs.";
});

if (!pollingTimer) {
  pollingTimer = setInterval(pollPipeline, pollingIntervalMs);
}
