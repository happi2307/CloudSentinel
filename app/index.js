const express = require("express");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env") });

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

const jenkinsConfig = {
  baseUrl: process.env.JENKINS_BASE_URL || "",
  jobName: process.env.JENKINS_JOB_NAME || "",
  username: process.env.JENKINS_USERNAME || "",
  apiToken: process.env.JENKINS_API_TOKEN || "",
  historyLimit: Number(process.env.JENKINS_HISTORY_LIMIT || 8),
};

const isJenkinsConfigured = () => Boolean(jenkinsConfig.baseUrl && jenkinsConfig.jobName);

const buildJenkinsAuthHeader = () => {
  if (!jenkinsConfig.username || !jenkinsConfig.apiToken) {
    return null;
  }

  const encoded = Buffer.from(`${jenkinsConfig.username}:${jenkinsConfig.apiToken}`).toString("base64");
  return `Basic ${encoded}`;
};

const formatJenkinsJobPath = () => {
  const segments = jenkinsConfig.jobName
    .split("/")
    .map((segment) => segment.trim())
    .filter(Boolean)
    .map((segment) => `job/${encodeURIComponent(segment)}`);

  return `/${segments.join("/")}`;
};

const buildJenkinsUrl = (routePath) => {
  const normalizedBase = jenkinsConfig.baseUrl.replace(/\/+$/, "");
  return `${normalizedBase}${routePath}`;
};

const parseJsonSafe = async (response) => {
  const bodyText = await response.text();
  if (!bodyText) {
    return null;
  }

  try {
    return JSON.parse(bodyText);
  } catch (error) {
    return null;
  }
};

const requestJenkins = async (routePath, options = {}) => {
  const authHeader = buildJenkinsAuthHeader();
  const headers = {
    Accept: "application/json",
    ...(options.headers || {}),
  };

  if (authHeader) {
    headers.Authorization = authHeader;
  }

  const response = await fetch(buildJenkinsUrl(routePath), {
    method: options.method || "GET",
    headers,
    body: options.body,
  });

  if (!response.ok) {
    const bodyText = await response.text();
    const trimmed = bodyText.length > 240 ? `${bodyText.slice(0, 240)}...` : bodyText;
    const details = trimmed || response.statusText;
    throw new Error(`Jenkins request failed (${response.status}): ${details}`);
  }

  return {
    response,
    data: await parseJsonSafe(response),
  };
};

const normalizeBuildStatus = (result, building) => {
  if (building) {
    return "running";
  }

  if (!result) {
    return "unknown";
  }

  const normalized = String(result).toUpperCase();
  if (normalized === "SUCCESS") {
    return "success";
  }
  if (normalized === "FAILURE") {
    return "failed";
  }
  if (normalized === "ABORTED") {
    return "aborted";
  }

  return "unknown";
};

const normalizeStageStatus = (status) => {
  const normalized = String(status || "").toUpperCase();

  if (["SUCCESS", "PASSED"].includes(normalized)) {
    return "success";
  }
  if (["IN_PROGRESS", "PAUSED_PENDING", "RUNNING"].includes(normalized)) {
    return "running";
  }
  if (["FAILED", "FAILURE", "ERROR"].includes(normalized)) {
    return "failed";
  }
  if (["ABORTED", "NOT_EXECUTED", "SKIPPED"].includes(normalized)) {
    return "aborted";
  }

  return "pending";
};

const inferProgress = (stages) => {
  if (!stages.length) {
    return 0;
  }

  const doneCount = stages.filter((stage) => ["success", "failed", "aborted"].includes(stage.status)).length;
  return Math.round((doneCount / stages.length) * 100);
};

const fetchPipelineStageData = async (buildNumber) => {
  try {
    const wfApiPath = `${formatJenkinsJobPath()}/${buildNumber}/wfapi/describe`;
    const { data } = await requestJenkins(wfApiPath);
    if (!data || !Array.isArray(data.stages)) {
      return stageTemplates.map((stage) => ({ ...stage, status: "pending", durationMs: null }));
    }

    return data.stages.map((stage) => ({
      name: stage.name,
      description: `Jenkins stage status: ${String(stage.status || "UNKNOWN").toUpperCase()}`,
      status: normalizeStageStatus(stage.status),
      durationMs: typeof stage.durationMillis === "number" ? stage.durationMillis : null,
    }));
  } catch (error) {
    return stageTemplates.map((stage) => ({ ...stage, status: "pending", durationMs: null }));
  }
};

const fetchJenkinsSnapshot = async () => {
  if (!isJenkinsConfigured()) {
    return {
      configured: false,
      message: "Set JENKINS_BASE_URL and JENKINS_JOB_NAME to enable live pipeline data.",
      history: [],
      currentRun: null,
      stages: stageTemplates,
    };
  }

  const tree = "builds[number,url,result,timestamp,duration,building,displayName,id]";
  const routePath = `${formatJenkinsJobPath()}/api/json?tree=${encodeURIComponent(tree)}`;
  const { data } = await requestJenkins(routePath);
  const builds = Array.isArray(data?.builds) ? data.builds.slice(0, jenkinsConfig.historyLimit) : [];

  const history = builds.map((build) => ({
    number: build.number,
    displayName: build.displayName || `#${build.number}`,
    result: build.result,
    status: normalizeBuildStatus(build.result, build.building),
    building: Boolean(build.building),
    timestamp: build.timestamp,
    durationMs: build.duration,
    url: build.url,
  }));

  const latestBuild = history[0] || null;
  const stages = latestBuild ? await fetchPipelineStageData(latestBuild.number) : stageTemplates;
  const currentRun = latestBuild
    ? {
        id: `jenkins-${latestBuild.number}`,
        buildNumber: latestBuild.number,
        status: latestBuild.status,
        progress: inferProgress(stages),
        startedAt: latestBuild.timestamp ? new Date(latestBuild.timestamp).toISOString() : null,
        completedAt:
          latestBuild.durationMs && latestBuild.timestamp
            ? new Date(latestBuild.timestamp + latestBuild.durationMs).toISOString()
            : null,
        durationMs: latestBuild.durationMs,
        stages,
        url: latestBuild.url,
      }
    : null;

  return {
    configured: true,
    message: "Live Jenkins data loaded.",
    history,
    currentRun,
    stages,
  };
};

const fetchJenkinsCrumb = async () => {
  try {
    const { data } = await requestJenkins("/crumbIssuer/api/json");
    if (!data?.crumb || !data?.crumbRequestField) {
      return null;
    }

    return data;
  } catch (error) {
    return null;
  }
};

const triggerJenkinsBuild = async () => {
  if (!isJenkinsConfigured()) {
    throw new Error("Jenkins is not configured.");
  }

  const crumbData = await fetchJenkinsCrumb();
  const headers = {};
  if (crumbData) {
    headers[crumbData.crumbRequestField] = crumbData.crumb;
  }

  const triggerPath = `${formatJenkinsJobPath()}/build`;
  const { response } = await requestJenkins(triggerPath, {
    method: "POST",
    headers,
  });

  return {
    queueLocation: response.headers.get("location"),
  };
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

app.get("/api/pipeline", async (req, res) => {
  try {
    const snapshot = await fetchJenkinsSnapshot();
    res.json(snapshot);
  } catch (error) {
    res.status(502).json({
      configured: isJenkinsConfigured(),
      message: error.message,
      history: [],
      currentRun: null,
      stages: stageTemplates,
    });
  }
});

app.post("/api/pipeline/run", async (req, res) => {
  try {
    const triggerData = await triggerJenkinsBuild();
    res.status(202).json({
      message: "Jenkins build triggered.",
      queueLocation: triggerData.queueLocation,
    });
  } catch (error) {
    res.status(502).json({
      message: error.message,
    });
  }
});

app.get("/api/demo", async (req, res) => {
  try {
    const snapshot = await fetchJenkinsSnapshot();
    res.json({
      ...projectSnapshot,
      jenkins: {
        configured: snapshot.configured,
        baseUrl: jenkinsConfig.baseUrl || null,
        jobName: jenkinsConfig.jobName || null,
        message: snapshot.message,
      },
      pipeline: snapshot,
    });
  } catch (error) {
    res.status(502).json({
      ...projectSnapshot,
      jenkins: {
        configured: isJenkinsConfigured(),
        baseUrl: jenkinsConfig.baseUrl || null,
        jobName: jenkinsConfig.jobName || null,
        message: error.message,
      },
      pipeline: {
        configured: isJenkinsConfigured(),
        message: error.message,
        history: [],
        currentRun: null,
        stages: stageTemplates,
      },
    });
  }
});

app.listen(port, () => {
  console.log(`CloudSentinel demo server running on port ${port}`);
});
