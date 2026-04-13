const express = require("express");
const path = require("path");

const app = express();
const port = process.env.PORT || 8081;

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

const stageTemplates = [
  {
    name: "Checkout Code",
    description: "Jenkins pulls the latest commit from source control.",
  },
  {
    name: "Security Scan",
    description: "Checkov scans IaC and repository configuration for risks.",
  },
  {
    name: "Build App",
    description: "Node.js dependencies are installed in the app workspace.",
  },
  {
    name: "Docker Build",
    description: "A versioned container image is built from the Dockerfile.",
  },
  {
    name: "Docker Push",
    description: "Image is pushed to Docker Hub using Jenkins credentials.",
  },
  {
    name: "Deploy to EC2",
    description: "Target host pulls and restarts the cloudsentinel container.",
  },
];

const projectSnapshot = {
  project: {
    name: "CloudSentinel",
    tagline: "End-to-end DevSecOps CI/CD demonstration project",
    stack: ["Node.js", "Jenkins", "Docker", "Terraform", "AWS EC2", "Checkov"],
  },
  architecture: {
    sourceControl: "GitHub repository",
    ciCd: "Jenkins pipeline from SCM",
    security: "Checkov shift-left scanning",
    artifact: "Docker Hub image happi2307/devsecops-app",
    deployment: "EC2 container rollout on port 8081",
    infrastructure: "Terraform-managed Jenkins host",
  },
  scanSummary: {
    tool: "Checkov",
    totalPolicies: 58,
    passed: 56,
    failed: 2,
    highRiskFindings: [
      "Jenkins UI CIDR is broad; restrict allowed_jenkins_cidr for production",
      "SSH ingress should be tightly pinned to trusted admin IPs",
    ],
  },
  terraformHighlights: [
    "Provisioned Ubuntu 24.04 Jenkins host with Docker and Java",
    "IAM instance profile includes AmazonSSMManagedInstanceCore",
    "Encrypted gp3 root volume with IMDSv2 enforcement",
    "Elastic IP attached to keep Jenkins endpoint stable",
  ],
};

const buildLiveRun = () => ({
  id: `run-${Date.now()}`,
  startedAt: new Date().toISOString(),
  status: "running",
  progress: 0,
  stages: stageTemplates.map((stage) => ({
    ...stage,
    status: "pending",
    durationMs: null,
    updatedAt: null,
  })),
});

let currentRun = null;
let runTimer = null;

const serializeRun = () => {
  if (!currentRun) {
    return null;
  }

  return {
    ...currentRun,
    stages: currentRun.stages.map((stage) => ({ ...stage })),
  };
};

const completeRunStep = () => {
  if (!currentRun || currentRun.status !== "running") {
    return;
  }

  const runningIndex = currentRun.stages.findIndex((stage) => stage.status === "running");

  if (runningIndex >= 0) {
    currentRun.stages[runningIndex].status = "success";
    currentRun.stages[runningIndex].durationMs = 800 + Math.floor(Math.random() * 1200);
    currentRun.stages[runningIndex].updatedAt = new Date().toISOString();
  }

  const nextStage = currentRun.stages.find((stage) => stage.status === "pending");

  if (nextStage) {
    nextStage.status = "running";
    nextStage.updatedAt = new Date().toISOString();
    const completedStages = currentRun.stages.filter((stage) => stage.status === "success").length;
    currentRun.progress = Math.round((completedStages / currentRun.stages.length) * 100);
    return;
  }

  currentRun.status = "success";
  currentRun.progress = 100;
  currentRun.completedAt = new Date().toISOString();

  if (runTimer) {
    clearInterval(runTimer);
    runTimer = null;
  }
};

const startRun = () => {
  if (currentRun && currentRun.status === "running") {
    return currentRun;
  }

  currentRun = buildLiveRun();
  currentRun.stages[0].status = "running";
  currentRun.stages[0].updatedAt = new Date().toISOString();

  if (runTimer) {
    clearInterval(runTimer);
  }

  runTimer = setInterval(completeRunStep, 2200);
  return currentRun;
};

app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    service: "cloudsentinel-webapp",
    time: new Date().toISOString(),
  });
});

app.get("/api/project", (req, res) => {
  res.json(projectSnapshot);
});

app.get("/api/pipeline", (req, res) => {
  res.json({
    stages: stageTemplates,
    currentRun: serializeRun(),
  });
});

app.post("/api/pipeline/run", (req, res) => {
  const run = startRun();
  res.status(202).json({
    message: "Pipeline simulation started.",
    run,
  });
});

app.get("/api/demo", (req, res) => {
  res.json({
    ...projectSnapshot,
    pipeline: {
      stages: stageTemplates,
      currentRun: serializeRun(),
    },
  });
});

app.listen(port, () => {
  console.log(`CloudSentinel demo server running on port ${port}`);
});
