function lockPanels() {
  document.querySelectorAll('.audit-panel, .dashboard, .report-panel').forEach(p => p.classList.add('locked-panel'));
}

function unlockPanels() {
  document.querySelectorAll('.audit-panel, .dashboard, .report-panel').forEach(p => p.classList.remove('locked-panel'));
}

async function simulateLoading(panelSelector, text, delayMs) {
  const panel = document.querySelector(panelSelector);
  if (!panel) return;
  panel.scrollIntoView({ behavior: 'smooth', block: 'center' });
  
  let overlay = panel.querySelector('.loading-overlay');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.className = 'loading-overlay';
    overlay.innerHTML = '<div class="spinner"></div><div class="loading-text"></div>';
    panel.appendChild(overlay);
  }
  overlay.querySelector('.loading-text').textContent = text;
  overlay.classList.add('active');
  
  await delay(delayMs);
  
  overlay.classList.remove('active');
  panel.classList.remove('locked-panel');
}

document.addEventListener('DOMContentLoaded', lockPanels);
lockPanels();

const STORAGE_KEY = "trustlens-decisions-v1";

const samples = [
  {
    name: "Rohan Mehta",
    collegeTier: "premier",
    skillScore: 74,
    experience: "medium",
    confidence: 81,
    notes: "Good fundamentals, clear communication, one completed full-stack project.",
    usesSensitiveData: false,
    policySensitive: false,
  },
  {
    name: "Nisha Kulkarni",
    collegeTier: "non-premier",
    skillScore: 91,
    experience: "high",
    confidence: 68,
    notes: "Excellent open-source contributions and strong project portfolio, but no brand-name internship.",
    usesSensitiveData: false,
    policySensitive: true,
  },
  {
    name: "Sameer Khan",
    collegeTier: "non-premier",
    skillScore: 88,
    experience: "high",
    confidence: 64,
    notes: "Built production-grade apps, strong GitHub profile, rejected by base AI due to college signal.",
    usesSensitiveData: false,
    policySensitive: true,
  },
  {
    name: "Meera Iyer",
    collegeTier: "non-premier",
    skillScore: 86,
    experience: "medium",
    confidence: 57,
    notes: "Strong candidate, but the base AI attempted to use demographic and college background signals.",
    usesSensitiveData: true,
    policySensitive: true,
  },
];

const form = document.querySelector("#candidateForm");
const runDemoButton = document.querySelector("#runDemoButton");
const resetButton = document.querySelector("#resetButton");
const copyReportButton = document.querySelector("#copyReportButton");
const hiringPage = document.querySelector("#hiringPage");
const loanSafetyPage = document.querySelector("#loanSafetyPage");
const loanResultPage = document.querySelector("#loanResultPage");
const processingPage = document.querySelector("#processingPage");
const hiringNav = document.querySelector("#hiringNav");
const loanNav = document.querySelector("#loanNav");
const loanForm = document.querySelector("#loanForm");
const runLoanDemoButton = document.querySelector("#runLoanDemoButton");
const downloadLoanReportButton = document.querySelector("#downloadLoanReportButton");

const fields = {
  name: document.querySelector("#name"),
  collegeTier: document.querySelector("#collegeTier"),
  skillScore: document.querySelector("#skillScore"),
  experience: document.querySelector("#experience"),
  confidence: document.querySelector("#confidence"),
  notes: document.querySelector("#notes"),
  usesSensitiveData: document.querySelector("#usesSensitiveData"),
  policySensitive: document.querySelector("#policySensitive"),
};

const ui = {
  memoryCount: document.querySelector("#memoryCount"),
  routeBadge: document.querySelector("#routeBadge"),
  sentinelAction: document.querySelector("#sentinelAction"),
  decisionReason: document.querySelector("#decisionReason"),
  decisionValue: document.querySelector("#decisionValue"),
  riskValue: document.querySelector("#riskValue"),
  confidenceValue: document.querySelector("#confidenceValue"),
  reviewValue: document.querySelector("#reviewValue"),
  alertBox: document.querySelector("#alertBox"),
  patternScore: document.querySelector("#patternScore"),
  biasBar: document.querySelector("#biasBar"),
  reviewBar: document.querySelector("#reviewBar"),
  safeBar: document.querySelector("#safeBar"),
  biasCount: document.querySelector("#biasCount"),
  reviewCount: document.querySelector("#reviewCount"),
  safeCount: document.querySelector("#safeCount"),
  loanRiskyBar: null,
  loanReviewBar: null,
  loanSafeBar: null,
  loanRiskyCount: null,
  loanReviewCount: null,
  loanSafeCount: null,
  memoryList: document.querySelector("#memoryList"),
  auditReport: document.querySelector("#auditReport"),
  loanResultRoute: document.querySelector("#loanResultRoute"),
  loanFinalRecommendation: document.querySelector("#loanFinalRecommendation"),
  loanSafetyAlert: document.querySelector("#loanSafetyAlert"),
  loanOriginalDecision: document.querySelector("#loanOriginalDecision"),
  loanTrustScore: document.querySelector("#loanTrustScore"),
  loanCreditMetric: document.querySelector("#loanCreditMetric"),
  loanReviewMetric: document.querySelector("#loanReviewMetric"),
  loanDecisionReason: document.querySelector("#loanDecisionReason"),
  loanHindsightMemory: document.querySelector("#loanHindsightMemory"),
  loanCascadeFlow: document.querySelector("#loanCascadeFlow"),
  loanMemoryTimeline: document.querySelector("#loanMemoryTimeline"),
  loanAuditReport: document.querySelector("#loanAuditReport"),
  steps: [
    document.querySelector("#step1"),
    document.querySelector("#step2"),
    document.querySelector("#step3"),
    document.querySelector("#step4"),
  ],
};

let memory = loadMemory();
let lastReport = "";
let lastLoanReport = "";
let lastLoanAudit = loadLastLoanAudit();

appendLoanDashboardRows();

function loadMemory() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch {
    return [];
  }
}

function saveMemory() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(memory));
  } catch {
    // Some file:// browser contexts block localStorage. The in-memory demo still works.
  }
}

function loadLastLoanAudit() {
  try {
    return JSON.parse(sessionStorage.getItem("trustlens-last-loan-audit")) || null;
  } catch {
    return null;
  }
}

function saveLastLoanAudit(audit) {
  lastLoanAudit = audit;
  try {
    sessionStorage.setItem("trustlens-last-loan-audit", JSON.stringify(audit));
  } catch {
    // The current page can still show the result even if session storage is unavailable.
  }
}

function appendLoanDashboardRows() {
  const chartWrap = document.querySelector(".chart-wrap");
  if (!chartWrap) return;

  chartWrap.insertAdjacentHTML(
    "beforeend",
    `
      <div class="bar-row module-divider">
        <span>Risky loans detected</span>
        <div class="bar-track"><div class="bar-fill danger" id="loanRiskyBar"></div></div>
        <strong id="loanRiskyCount">0</strong>
      </div>
      <div class="bar-row">
        <span>Loan manual reviews</span>
        <div class="bar-track"><div class="bar-fill warning" id="loanReviewBar"></div></div>
        <strong id="loanReviewCount">0</strong>
      </div>
      <div class="bar-row">
        <span>Loan safe approvals</span>
        <div class="bar-track"><div class="bar-fill safe" id="loanSafeBar"></div></div>
        <strong id="loanSafeCount">0</strong>
      </div>
    `
  );

  ui.loanRiskyBar = document.querySelector("#loanRiskyBar");
  ui.loanReviewBar = document.querySelector("#loanReviewBar");
  ui.loanSafeBar = document.querySelector("#loanSafeBar");
  ui.loanRiskyCount = document.querySelector("#loanRiskyCount");
  ui.loanReviewCount = document.querySelector("#loanReviewCount");
  ui.loanSafeCount = document.querySelector("#loanSafeCount");
}

function generateId() {
  if (globalThis.crypto && typeof globalThis.crypto.randomUUID === "function") {
    return globalThis.crypto.randomUUID();
  }

  return `decision-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function getCandidate() {
  return {
    name: fields.name.value.trim() || "Unnamed candidate",
    collegeTier: fields.collegeTier.value,
    skillScore: Number(fields.skillScore.value),
    experience: fields.experience.value,
    confidence: Number(fields.confidence.value),
    notes: fields.notes.value.trim(),
    usesSensitiveData: fields.usesSensitiveData.checked,
    policySensitive: fields.policySensitive.checked,
  };
}

function setCandidate(candidate) {
  fields.name.value = candidate.name;
  fields.collegeTier.value = candidate.collegeTier;
  fields.skillScore.value = candidate.skillScore;
  fields.experience.value = candidate.experience;
  fields.confidence.value = candidate.confidence;
  fields.notes.value = candidate.notes;
  fields.usesSensitiveData.checked = candidate.usesSensitiveData;
  fields.policySensitive.checked = candidate.policySensitive;
}

function baseAiDecision(candidate) {
  const strongSkill = candidate.skillScore >= 82;
  const strongExperience = candidate.experience === "high";
  const brandBiasTrigger = candidate.collegeTier === "non-premier" && candidate.skillScore < 92;

  if (candidate.usesSensitiveData) {
    return {
      decision: "Reject",
      reason: "Base AI attempted to rely on sensitive or non-job-relevant signals.",
    };
  }

  if (brandBiasTrigger && strongSkill) {
    return {
      decision: "Reject",
      reason: "Base AI over-weighted college brand despite strong skill evidence.",
    };
  }

  if (candidate.skillScore >= 78 || strongExperience) {
    return {
      decision: "Shortlist",
      reason: "Candidate meets skill and experience threshold.",
    };
  }

  return {
    decision: "Human Review",
    reason: "Candidate profile is mixed and needs manual assessment.",
  };
}

function auditDecision(candidate, aiDecision) {
  const pastRiskyRejections = memory.filter(
    (item) =>
      item.collegeTier === "non-premier" &&
      item.skillScore >= 82 &&
      item.aiDecision === "Reject"
  );
  const similarCases = memory.filter(
    (item) =>
      item.collegeTier === candidate.collegeTier &&
      Math.abs(item.skillScore - candidate.skillScore) <= 8
  );

  const flags = [];
  if (candidate.usesSensitiveData) {
    flags.push("Sensitive or non-job-relevant data usage detected");
  }
  if (candidate.policySensitive) {
    flags.push("High-stakes hiring decision requires policy audit");
  }
  if (candidate.confidence < 65) {
    flags.push("Low model confidence");
  }
  if (
    candidate.collegeTier === "non-premier" &&
    candidate.skillScore >= 82 &&
    aiDecision.decision === "Reject"
  ) {
    flags.push("Strong non-premier candidate rejected");
  }
  if (
    candidate.collegeTier === "non-premier" &&
    candidate.skillScore >= 82 &&
    aiDecision.decision === "Reject" &&
    pastRiskyRejections.length >= 2
  ) {
    flags.push("Hindsight pattern: repeated rejection of strong non-premier candidates");
  }

  const riskPoints =
    flags.length * 22 +
    (candidate.usesSensitiveData ? 25 : 0) +
    (pastRiskyRejections.length >= 2 ? 25 : 0) +
    (candidate.confidence < 65 ? 12 : 0);
  const riskScore = Math.min(100, riskPoints);
  const riskLevel = riskScore >= 70 ? "High" : riskScore >= 38 ? "Medium" : "Low";
  const route =
    riskLevel === "High"
      ? "CascadeFlow: escalated to deep audit"
      : riskLevel === "Medium"
        ? "CascadeFlow: policy verifier"
        : "CascadeFlow: fast path";
  const intercepted =
    riskLevel === "High" ||
    flags.some((flag) => flag.includes("Sensitive")) ||
    flags.some((flag) => flag.includes("Hindsight pattern"));

  return {
    type: "hiring",
    id: generateId(),
    timestamp: new Date().toLocaleString(),
    ...candidate,
    aiDecision: aiDecision.decision,
    aiReason: aiDecision.reason,
    flags,
    similarCases: similarCases.length,
    pastRiskyRejections: pastRiskyRejections.length,
    riskScore,
    riskLevel,
    route,
    sentinelAction: intercepted ? "Intercepted for human review" : "Allowed with audit log",
    humanReview: intercepted ? "Required" : riskLevel === "Medium" ? "Recommended" : "Not required",
    finalDecision: intercepted ? "Human Review" : aiDecision.decision,
  };
}

async function runDecision(candidate, skipProcessing = false) {
  lockPanels();
  setPipeline(0);
  const aiDecision = baseAiDecision(candidate);
  setPipeline(1);
  const audit = auditDecision(candidate, aiDecision);
  setPipeline(2);
  memory.unshift(audit);
  memory = memory.slice(0, 18);
  saveMemory();
  setPipeline(3);
  render(audit);

  if (!skipProcessing) {
    await runProcessingPipeline(false);
  }
  unlockPanels();
}

function setPipeline(activeIndex) {
  ui.steps.forEach((step, index) => {
    step.classList.toggle("active", index <= activeIndex);
  });
}

function render(latest) {
  const stats = getStats();
  ui.memoryCount.textContent = memory.length;
  ui.biasCount.textContent = stats.riskyRejections;
  ui.reviewCount.textContent = stats.reviews;
  ui.safeCount.textContent = stats.safeApprovals;
  ui.loanRiskyCount.textContent = stats.riskyLoans;
  ui.loanReviewCount.textContent = stats.loanManualReviews;
  ui.loanSafeCount.textContent = stats.loanSafeApprovals;
  ui.biasBar.style.width = `${Math.min(100, stats.riskyRejections * 25)}%`;
  ui.reviewBar.style.width = `${Math.min(100, stats.reviews * 25)}%`;
  ui.safeBar.style.width = `${Math.min(100, stats.safeApprovals * 20)}%`;
  ui.loanRiskyBar.style.width = `${Math.min(100, stats.riskyLoans * 25)}%`;
  ui.loanReviewBar.style.width = `${Math.min(100, stats.loanManualReviews * 25)}%`;
  ui.loanSafeBar.style.width = `${Math.min(100, stats.loanSafeApprovals * 20)}%`;

  if (latest) {
    ui.routeBadge.textContent = latest.route;
    ui.sentinelAction.textContent = latest.sentinelAction;
    ui.decisionReason.textContent = latest.flags.length
      ? latest.flags.join(". ") + "."
      : latest.aiReason;
    ui.decisionValue.textContent = latest.aiDecision;
    ui.riskValue.textContent = latest.riskLevel;
    ui.confidenceValue.textContent = `${latest.confidence}%`;
    ui.reviewValue.textContent = latest.humanReview;
    lastReport = buildReport(latest, stats);
    ui.auditReport.textContent = lastReport;
  }

  updatePatternAlert(stats);
  renderMemoryList();
}

function getStats() {
  return {
    riskyRejections: memory.filter(
      (item) =>
        (item.type || "hiring") === "hiring" &&
        item.collegeTier === "non-premier" &&
        item.skillScore >= 82 &&
        item.aiDecision === "Reject"
    ).length,
    reviews: memory.filter(
      (item) => (item.type || "hiring") === "hiring" && item.humanReview !== "Not required"
    ).length,
    safeApprovals: memory.filter(
      (item) =>
        (item.type || "hiring") === "hiring" &&
        item.aiDecision === "Shortlist" &&
        item.riskLevel === "Low"
    ).length,
    riskyLoans: memory.filter((item) => item.type === "loan" && item.risky).length,
    loanManualReviews: memory.filter(
      (item) => item.type === "loan" && item.finalRecommendation === "Override -> Manual Review"
    ).length,
    loanSafeApprovals: memory.filter(
      (item) => item.type === "loan" && item.finalRecommendation === "Proceed -> Auto Approval"
    ).length,
  };
}

function updatePatternAlert(stats) {
  ui.alertBox.className = "alert-box";

  if (stats.riskyRejections >= 3) {
    ui.alertBox.classList.add("danger");
    ui.alertBox.innerHTML = `
      <strong>Unsafe pattern detected and intercepted.</strong>
      <p>Hindsight memory found ${stats.riskyRejections} strong non-premier candidates rejected. TrustLens now requires human review before the AI decision can be used.</p>
    `;
    ui.patternScore.textContent = "Critical pattern";
    return;
  }

  if (stats.riskyRejections >= 1) {
    ui.alertBox.classList.add("warning");
    ui.alertBox.innerHTML = `
      <strong>Early fairness risk emerging.</strong>
      <p>TrustLens found ${stats.riskyRejections} risky rejection. More similar cases will trigger real-time interception.</p>
    `;
    ui.patternScore.textContent = "Watching pattern";
    return;
  }

  ui.alertBox.innerHTML = `
    <strong>No unsafe pattern detected.</strong>
    <p>TrustLens will compare every decision against stored memory and flag repeated risky behavior.</p>
  `;
  ui.patternScore.textContent = "No pattern yet";
}

function renderMemoryList() {
  if (!memory.length) {
    ui.memoryList.innerHTML = '<div class="empty-state">No decisions stored yet.</div>';
    return;
  }

  ui.memoryList.innerHTML = memory
    .map((item) => {
      if (item.type === "loan") {
        const badgeClass = item.risky ? "danger" : "safe";
        return `
          <article class="memory-item">
            <header>
              <span>Loan Case ${escapeHtml(item.caseId)}</span>
              <span class="badge ${badgeClass}">${item.risky ? "High risk" : "Safe"}</span>
            </header>
            <p>${item.timestamp} - AI: ${item.originalDecision} - Sentinel: ${item.finalRecommendation}</p>
            <p>${escapeHtml(item.decisionReason)}</p>
          </article>
        `;
      }

      const badgeClass =
        item.riskLevel === "High" ? "danger" : item.riskLevel === "Medium" ? "warning" : "safe";
      return `
        <article class="memory-item">
          <header>
            <span>${escapeHtml(item.name)}</span>
            <span class="badge ${badgeClass}">${item.riskLevel} risk</span>
          </header>
          <p>${item.timestamp} - AI: ${item.aiDecision} - Sentinel: ${item.sentinelAction}</p>
          <p>${escapeHtml(item.aiReason)}</p>
        </article>
      `;
    })
    .join("");
}

function buildReport(item, stats) {
  const flags = item.flags.length ? item.flags.map((flag) => `- ${flag}`).join("\n") : "- No policy flags";
  return `TRUSTLENS AI SENTINEL AUDIT REPORT

Project: TrustLens AI Sentinel
Tagline: The AI watchdog that audits and intercepts unsafe AI decisions in real time.

Case
- Candidate: ${item.name}
- College tier: ${item.collegeTier}
- Skill score: ${item.skillScore}/100
- Experience: ${item.experience}
- AI confidence: ${item.confidence}%

Base AI Decision
- Decision: ${item.aiDecision}
- Reason: ${item.aiReason}

TrustLens Audit
- Risk level: ${item.riskLevel}
- Risk score: ${item.riskScore}/100
- CascadeFlow route: ${item.route}
- Similar cases found in Hindsight memory: ${item.similarCases}
- Past risky rejections before this case: ${item.pastRiskyRejections}

Policy And Safety Flags
${flags}

Sentinel Outcome
- Action: ${item.sentinelAction}
- Final decision: ${item.finalDecision}
- Human review: ${item.humanReview}

Memory Pattern Summary
- Rejected strong non-premier candidates: ${stats.riskyRejections}
- Human review escalations: ${stats.reviews}
- Safe approvals: ${stats.safeApprovals}

Why this matters
TrustLens creates an audit trail for AI agents, remembers past behavior, detects unsafe patterns over time, and intercepts high-risk decisions before they create business, legal, or ethical harm.`;
}

async function analyzeLoanSafety({ annualIncome, creditScore, loanAmount }, skipProcessing = false) {
  lockPanels();
  const risky = creditScore < 650 || loanAmount > annualIncome * 12;
  const audit = {
    type: "loan",
    id: generateId(),
    caseId: `#L-${String(memory.filter((item) => item.type === "loan").length + 1).padStart(3, "0")}`,
    timestamp: new Date().toLocaleString(),
    annualIncome,
    creditScore,
    loanAmount,
    risky,
    originalDecision: risky ? "Reject Loan" : "Approve Loan",
    safetyAlert: risky ? "Unsafe decision detected" : "No safety risk detected",
    decisionReason: risky
      ? "Credit score below safe threshold"
      : "Applicant meets policy criteria",
    hindsightMemory: risky
      ? "Similar past false rejection found - recommend manual review"
      : "No harmful historical pattern detected",
    cascadeFlow: risky
      ? "Escalated to GPT-4 due to high-risk case"
      : "Handled by lightweight model",
    trustScore: risky ? 81 : 94,
    finalRecommendation: risky ? "Override -> Manual Review" : "Proceed -> Auto Approval",
  };

  memory.unshift(audit);
  memory = memory.slice(0, 18);
  saveMemory();
  saveLastLoanAudit(audit);

  if (!skipProcessing) {
    await runProcessingPipeline(true);
  } else {
    navigateTo("/loan-safety/result");
  }
  unlockPanels();
}

function renderLoanResult(audit) {
  if (!audit) {
    ui.loanResultRoute.textContent = "Awaiting loan analysis";
    ui.loanFinalRecommendation.textContent = "No loan result yet";
    ui.loanSafetyAlert.textContent = "Analyze a loan case to generate the Sentinel audit.";
    ui.loanOriginalDecision.textContent = "--";
    ui.loanTrustScore.textContent = "--";
    ui.loanCreditMetric.textContent = "--";
    ui.loanReviewMetric.textContent = "--";
    ui.loanDecisionReason.textContent = "--";
    ui.loanHindsightMemory.textContent = "--";
    ui.loanCascadeFlow.textContent = "--";
    ui.loanMemoryTimeline.innerHTML = '<div class="empty-state">No risky loan memory timeline required.</div>';
    ui.loanAuditReport.textContent = "Analyze a loan case to generate an audit-ready report.";
    lastLoanReport = "";
    return;
  }

  ui.loanResultRoute.textContent = audit.cascadeFlow;
  ui.loanFinalRecommendation.textContent = audit.finalRecommendation;
  ui.loanSafetyAlert.textContent = audit.safetyAlert;
  ui.loanOriginalDecision.textContent = audit.originalDecision;
  ui.loanTrustScore.textContent = String(audit.trustScore);
  ui.loanCreditMetric.textContent = String(audit.creditScore);
  ui.loanReviewMetric.textContent = audit.risky ? "Required" : "Not required";
  ui.loanDecisionReason.textContent = audit.decisionReason;
  ui.loanHindsightMemory.textContent = audit.hindsightMemory;
  ui.loanCascadeFlow.textContent = audit.cascadeFlow;
  ui.loanMemoryTimeline.innerHTML = audit.risky
    ? `
      <article class="memory-item">
        <header>
          <span>Past Case ID: #001</span>
          <span class="badge danger">False rejection</span>
        </header>
        <p>Historical Issue: False rejection</p>
        <p>Correction Applied: Manual review required</p>
      </article>
    `
    : '<div class="empty-state">No risky loan memory timeline required.</div>';

  lastLoanReport = buildLoanReport(audit);
  ui.loanAuditReport.textContent = lastLoanReport;
}

function buildLoanReport(audit) {
  return `TRUSTLENS AI SENTINEL - LOAN SAFETY AUDIT REPORT

Case ID: ${audit.caseId}
Annual Income: ${audit.annualIncome}
Credit Score: ${audit.creditScore}
Loan Amount: ${audit.loanAmount}

Original AI Decision
- ${audit.originalDecision}

Safety Alert
- ${audit.safetyAlert}

Decision Reason
- ${audit.decisionReason}

Hindsight Memory
- ${audit.hindsightMemory}

CascadeFlow
- ${audit.cascadeFlow}

Trust Score
- ${audit.trustScore}

Final Recommendation
- ${audit.finalRecommendation}

Memory Timeline
${audit.risky ? "- Past Case ID: #001\n- Historical Issue: False rejection\n- Correction Applied: Manual review required" : "- No harmful historical pattern detected"}`;
}

function downloadTextFile(filename, content) {
  const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function routeApp() {
  const path = getRoutePath();
  const isLoanSafety = path === "/loan-safety";
  const isLoanResult = path === "/loan-safety/result";
  const isProcessing = path === "/processing";
  const activeTab = isLoanSafety || isLoanResult ? "loan" : "hiring";

  hiringPage.hidden = activeTab === "loan" || isProcessing;
  loanSafetyPage.hidden = activeTab !== "loan" || isLoanResult || isProcessing;
  loanResultPage.hidden = activeTab !== "loan" || !isLoanResult || isProcessing;
  processingPage.hidden = !isProcessing;

  hiringNav.classList.toggle("active", activeTab === "hiring" && !isProcessing);
  loanNav.classList.toggle("active", activeTab === "loan" && !isProcessing);

  if (isLoanResult) {
    renderLoanResult(lastLoanAudit);
  }

  render();
}

function getRoutePath() {
  if (window.location.protocol === "file:") {
    return window.location.hash.replace("#", "") || "/";
  }

  return window.location.pathname;
}

function navigateTo(path) {
  if (window.location.protocol === "file:") {
    window.location.hash = path;
    routeApp();
    return;
  }

  window.history.pushState({}, "", path);
  routeApp();
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  await runDecision(getCandidate());
});

loanForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  await analyzeLoanSafety({
    annualIncome: Number(document.querySelector("#annualIncome").value),
    creditScore: Number(document.querySelector("#creditScore").value),
    loanAmount: Number(document.querySelector("#loanAmount").value),
  });
});

runLoanDemoButton.addEventListener("click", async () => {
  document.querySelector("#annualIncome").value = "480000";
  document.querySelector("#creditScore").value = "620";
  document.querySelector("#loanAmount").value = "7200000";
  await analyzeLoanSafety({
    annualIncome: 480000,
    creditScore: 620,
    loanAmount: 7200000,
  });
  const isSafe = memory.length > 0 && !memory[0].risky;
  alert(isSafe ? "Demo Result: Safe" : "Demo Result: Unsafe");
});

hiringNav.addEventListener("click", (event) => {
  event.preventDefault();
  navigateTo("/");
});

loanNav.addEventListener("click", (event) => {
  event.preventDefault();
  navigateTo("/loan-safety");
});

resetButton.addEventListener("click", () => {
  memory = [];
  saveMemory();
  lastReport = "";
  ui.routeBadge.textContent = "Awaiting case";
  ui.sentinelAction.textContent = "No decision audited yet";
  ui.decisionReason.textContent =
    "Submit a candidate or run the winning demo to see TrustLens intercept unsafe behavior.";
  ui.decisionValue.textContent = "--";
  ui.riskValue.textContent = "--";
  ui.confidenceValue.textContent = "--";
  ui.reviewValue.textContent = "--";
  ui.auditReport.textContent = "Run a decision to generate an audit-ready report.";
  setPipeline(0);
  render();
  lockPanels();
});

copyReportButton.addEventListener("click", async () => {
  if (!lastReport) return;

  try {
    if (!navigator.clipboard || typeof navigator.clipboard.writeText !== "function") {
      throw new Error("Clipboard API unavailable");
    }

    await navigator.clipboard.writeText(lastReport);
    copyReportButton.textContent = "Copied";
  } catch {
    selectReportText();
    copyReportButton.textContent = "Selected - press Ctrl+C";
  }

  setTimeout(() => {
    copyReportButton.textContent = "Copy report";
  }, 2400);
});

downloadLoanReportButton.addEventListener("click", () => {
  if (!lastLoanReport && lastLoanAudit) {
    lastLoanReport = buildLoanReport(lastLoanAudit);
  }
  if (!lastLoanReport) return;

  downloadTextFile("trustlens-loan-safety-audit.txt", lastLoanReport);
});

window.addEventListener("popstate", routeApp);
window.addEventListener("hashchange", routeApp);

function selectReportText() {
  const range = document.createRange();
  range.selectNodeContents(ui.auditReport);
  const selection = window.getSelection();
  selection.removeAllRanges();
  selection.addRange(range);
}

document.querySelectorAll(".sample-button").forEach((button) => {
  button.addEventListener("click", () => {
    setCandidate(samples[Number(button.dataset.sample)]);
  });
});

runDemoButton.addEventListener("click", async () => {
  memory = [];
  saveMemory();
  render();
  for (const sample of samples) {
    setCandidate(sample);
    await runDecision(sample, true);
  }
  // Run the processing animation for the final consolidated safety check
  await runProcessingPipeline(false);
  const isSafe = memory.every(m => m.riskLevel === "Low");
  alert(isSafe ? "Demo Result: Safe" : "Demo Result: Unsafe");
});


// --- PROCESSING PIPELINE RUNNER LOGIC ---
let skipAnimationActive = false;
let currentResolve = null;

const stages = [
  {
    step: "Step 1/6",
    title: "Initializing Sentinel...",
    subtext: "Connecting to secure environment...",
    duration: 2000,
  },
  {
    step: "Step 2/6",
    title: "Running Base AI Decision...",
    subtext: "Evaluating applicant metrics...",
    duration: 3000,
  },
  {
    step: "Step 3/6",
    title: "Scanning for Safety Risks...",
    subtext: "Checking policy bounds and risk vectors...",
    duration: 3000,
  },
  {
    step: "Step 4/6",
    title: "Loading Hindsight Memory...",
    subtext: "Comparing with historical decision cases...",
    duration: 3000,
  },
  {
    step: "Step 5/6",
    title: "Running CascadeFlow...",
    subtext: "Routing to optimal AI safety layer...",
    duration: 3000,
  },
  {
    step: "Step 6/6",
    title: "Generating Audit Report...",
    subtext: "Finalizing compiled safety audit traces...",
    duration: 2000,
  },
];

async function runProcessingPipeline(isLoan) {
  navigateTo("/processing");
  skipAnimationActive = false;

  const stepTracker = document.querySelector("#processingStepTracker");
  const titleEl = document.querySelector("#processingTitle");
  const subtextEl = document.querySelector("#processingSubtext");
  
  // Hide all stages initially
  for (let i = 1; i <= 6; i++) {
    document.querySelector(`#animStage${i}`).classList.remove("active");
  }

  // Set up skip button
  const skipBtn = document.querySelector("#skipProcessingButton");
  skipBtn.onclick = () => {
    skipAnimationActive = true;
    if (currentResolve) currentResolve();
  };

  for (let i = 0; i < stages.length; i++) {
    if (skipAnimationActive) break;

    const currentStage = stages[i];
    stepTracker.textContent = currentStage.step;
    titleEl.textContent = currentStage.title;
    subtextEl.textContent = currentStage.subtext;

    // Show active stage animation
    if (i > 0) {
      document.querySelector(`#animStage${i}`).classList.remove("active");
    }
    const stageEl = document.querySelector(`#animStage${i + 1}`);
    stageEl.classList.add("active");

    // Dynamic animations inside stages
    if (i === 4) { // Stage 5: CascadeFlow node animations
      animateCascadeFlowNodes();
    }

    // Wait for the duration of the stage
    await new Promise((resolve) => {
      currentResolve = resolve;
      const timer = setTimeout(resolve, currentStage.duration);
      // If skipped, resolve immediately
      const checkSkip = setInterval(() => {
        if (skipAnimationActive) {
          clearTimeout(timer);
          clearInterval(checkSkip);
          resolve();
        }
      }, 50);
    });
  }

  // Hide the last stage
  document.querySelector("#animStage6").classList.remove("active");

  // Redirect to results
  if (isLoan) {
    navigateTo("/loan-safety/result");
  } else {
    navigateTo("/");
  }
}

function animateCascadeFlowNodes() {
  const nodeFast = document.querySelector("#nodeFast");
  const nodePolicy = document.querySelector("#nodePolicy");
  const nodeAudit = document.querySelector("#nodeAudit");
  const fillFastToPolicy = document.querySelector("#fillFastToPolicy");
  const fillPolicyToAudit = document.querySelector("#fillPolicyToAudit");

  // Reset nodes
  nodeFast.classList.remove("highlight");
  nodePolicy.classList.remove("highlight");
  nodeAudit.classList.remove("highlight");
  fillFastToPolicy.style.width = "0%";
  fillPolicyToAudit.style.width = "0%";

  // Sequence
  setTimeout(() => {
    nodeFast.classList.add("highlight");
  }, 100);

  setTimeout(() => {
    fillFastToPolicy.style.width = "100%";
    nodePolicy.classList.add("highlight");
  }, 900);

  setTimeout(() => {
    fillPolicyToAudit.style.width = "100%";
    nodeAudit.classList.add("highlight");
  }, 1800);
}


routeApp();
