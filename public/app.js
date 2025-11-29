// ===========================
// Global State
// ===========================
const state = {
  currentMode: "text",
  currentSubMode: "default",
  currentReasoning: "cot",
  modeAStage: null, // 'clarify', 'distill', 'brief'
  modeAQuestions: [],
  currentOutput: null,
  currentOutputJSON: null,
  healthStatus: null,
  loadingStartTime: null,
};

// ===========================
// Output History Manager
// ===========================
class OutputHistory {
  constructor(maxItems = 20) {
    this.maxItems = maxItems;
    this.storageKey = "contextor_history";
  }

  save(entry) {
    const history = this.getAll();
    history.unshift({
      id: Date.now(),
      timestamp: new Date().toISOString(),
      ...entry,
    });

    // Keep only max items
    if (history.length > this.maxItems) {
      history.splice(this.maxItems);
    }

    localStorage.setItem(this.storageKey, JSON.stringify(history));
  }

  getAll() {
    try {
      const data = localStorage.getItem(this.storageKey);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error("Failed to load history:", error);
      return [];
    }
  }

  clear() {
    localStorage.removeItem(this.storageKey);
  }
}

const history = new OutputHistory();

// ===========================
// DOM Elements
// ===========================
const elements = {
  // Buttons
  modeBtns: document.querySelectorAll(".mode-btn"),
  generateBtn: document.getElementById("generateBtn"),
  generateBtnText: document.getElementById("generateBtnText"),
  copyBtn: document.getElementById("copyBtn"),
  settingsBtn: document.getElementById("settingsBtn"),
  closeModal: document.getElementById("closeModal"),

  // Input
  inputField: document.getElementById("inputField"),
  subModeSelector: document.getElementById("subModeSelector"),
  reasoningSelector: document.getElementById("reasoningSelector"),

  // Panels
  questionsPanel: document.getElementById("questionsPanel"),
  questionsList: document.getElementById("questionsList"),
  questionsForm: document.getElementById("questionsForm"),
  loadingState: document.getElementById("loadingState"),
  loadingText: document.getElementById("loadingText"),
  outputPanel: document.getElementById("outputPanel"),
  errorMessage: document.getElementById("errorMessage"),
  errorText: document.getElementById("errorText"),
  settingsModal: document.getElementById("settingsModal"),

  // Output
  outputText: document.getElementById("outputText"),
  copyFeedback: document.getElementById("copyFeedback"),
  outputMetadata: document.getElementById("outputMetadata"),
};

// ===========================
// Mode Placeholders
// ===========================
const placeholders = {
  text: "Enter your text context request...",
  image: "Describe the image you want to generate...",
  video: "Describe the video scene...",
  music: "Describe the music you want to create...",
};

// ===========================
// Event Listeners
// ===========================

// Mode selector
elements.modeBtns.forEach((btn) => {
  btn.addEventListener("click", () => {
    const mode = btn.dataset.mode;
    switchMode(mode);
  });
});

// Sub-mode selector
document.querySelectorAll('input[name="submode"]').forEach((radio) => {
  radio.addEventListener("change", (e) => {
    state.currentSubMode = e.target.value;

    // Show/hide reasoning selector for Mode B
    if (state.currentSubMode === "modeB") {
      elements.reasoningSelector.classList.remove("hidden");
    } else {
      elements.reasoningSelector.classList.add("hidden");
    }

    // Reset Mode A state when switching away
    if (state.currentSubMode !== "modeA") {
      resetModeA();
    }
  });
});

// Reasoning selector
document.querySelectorAll('input[name="reasoning"]').forEach((radio) => {
  radio.addEventListener("change", (e) => {
    state.currentReasoning = e.target.value;
  });
});

// Generate button
elements.generateBtn.addEventListener("click", handleGenerate);

// Questions form (Mode A)
elements.questionsForm.addEventListener("submit", (e) => {
  e.preventDefault();
  handleModeADistill();
});

// Copy button
elements.copyBtn.addEventListener("click", handleCopy);

// Format toggle
document.querySelectorAll('input[name="format"]').forEach((radio) => {
  radio.addEventListener("change", (e) => {
    toggleOutputFormat(e.target.value);
  });
});

// Settings modal
elements.settingsBtn.addEventListener("click", () => {
  elements.settingsModal.classList.remove("hidden");
});

elements.closeModal.addEventListener("click", () => {
  elements.settingsModal.classList.add("hidden");
});

elements.settingsModal.addEventListener("click", (e) => {
  if (e.target === elements.settingsModal) {
    elements.settingsModal.classList.add("hidden");
  }
});

// ===========================
// Mode Switching
// ===========================
function switchMode(mode) {
  state.currentMode = mode;

  // Update active button
  elements.modeBtns.forEach((btn) => {
    if (btn.dataset.mode === mode) {
      btn.classList.add("active");
    } else {
      btn.classList.remove("active");
    }
  });

  // Update placeholder
  elements.inputField.placeholder = placeholders[mode];

  // Show/hide sub-mode selector (only for text mode)
  if (mode === "text") {
    elements.subModeSelector.classList.remove("hidden");
  } else {
    elements.subModeSelector.classList.add("hidden");
    elements.reasoningSelector.classList.add("hidden");
    state.currentSubMode = "default";
  }

  // Hide JSON toggle for non-blueprint modes
  const jsonToggle = document.querySelector(".json-toggle");
  if (mode === "text") {
    jsonToggle.classList.add("hidden");
  } else {
    jsonToggle.classList.remove("hidden");
  }

  // Clear output and errors
  hideOutput();
  hideError();
  resetModeA();
}

// ===========================
// Generate Handler
// ===========================
async function handleGenerate() {
  const input = elements.inputField.value.trim();

  if (!input) {
    showError("Please enter some input to generate context.");
    return;
  }

  hideError();
  hideOutput();

  // Determine the flow based on mode and submode
  if (state.currentMode === "text" && state.currentSubMode === "modeA") {
    await handleModeAClarify(input);
  } else {
    await generateContext(input);
  }
}

// ===========================
// Mode A - Clarify Stage
// ===========================
async function handleModeAClarify(input) {
  showLoading("Generating clarifying questions...");
  disableGenerate();

  try {
    const response = await fetchWithTimeout(
      fetch("https://contextor-api.takeakubox.workers.dev/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: "text",
          subMode: "modeA",
          stage: "clarify",
          input: input,
        }),
      }),
      45000,
    );

    const data = await response.json();

    if (!data.success) {
      throw new Error(data.error?.message || "Failed to generate questions");
    }

    // Display questions
    state.modeAQuestions = data.questions;
    state.modeAStage = "clarify";
    displayQuestions(data.questions);

    hideLoading();
  } catch (error) {
    hideLoading();
    showError(getErrorMessage(error));
    enableGenerate();
  }
}

// ===========================
// Display Questions
// ===========================
function displayQuestions(questions) {
  elements.questionsList.innerHTML = "";

  questions.forEach((question, index) => {
    const questionItem = document.createElement("div");
    questionItem.className = "question-item";

    const label = document.createElement("label");
    label.className = "question-label";
    label.textContent = `${index + 1}. ${question}`;

    const textarea = document.createElement("textarea");
    textarea.className = "answer-input";
    textarea.rows = 3;
    textarea.required = true;
    textarea.dataset.questionIndex = index;

    questionItem.appendChild(label);
    questionItem.appendChild(textarea);
    elements.questionsList.appendChild(questionItem);
  });

  elements.questionsPanel.classList.remove("hidden");
  elements.generateBtn.classList.add("hidden");
}

// ===========================
// Mode A - Distill Stage
// ===========================
async function handleModeADistill() {
  // Collect answers
  const answerInputs = elements.questionsList.querySelectorAll(".answer-input");
  const answers = Array.from(answerInputs).map((input) => input.value.trim());

  // Validate all answers are filled
  if (answers.some((answer) => !answer)) {
    showError("Please answer all questions.");
    return;
  }

  showLoading("Distilling context from your answers...");

  try {
    const response = await fetchWithTimeout(
      fetch("https://contextor-api.takeakubox.workers.dev/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: "text",
          subMode: "modeA",
          stage: "distill",
          questions: state.modeAQuestions,
          answers: answers,
        }),
      }),
      45000,
    );

    const data = await response.json();

    if (!data.success) {
      throw new Error(data.error?.message || "Failed to distill context");
    }

    // Display output
    displayOutput(data);

    // Save to history
    saveToHistory(data);

    // Reset Mode A
    resetModeA();
    hideLoading();
    enableGenerate();
  } catch (error) {
    hideLoading();
    showError(getErrorMessage(error));
  }
}

// ===========================
// Generate Context (All Modes)
// ===========================
async function generateContext(input) {
  showLoading("Generating comprehensive context...");
  disableGenerate();

  try {
    const requestBody = {
      mode: state.currentMode,
      input: input,
    };

    // Add subMode for text mode
    if (state.currentMode === "text") {
      if (state.currentSubMode === "modeB") {
        requestBody.subMode = state.currentReasoning; // 'cot' or 'pot'
      } else {
        requestBody.subMode = state.currentSubMode; // 'default'
      }
    }

    // Add output format for blueprints
    if (state.currentMode !== "text") {
      requestBody.outputFormat = "both"; // Get both text and JSON
    }

    const response = await fetchWithTimeout(
      fetch("https://contextor-api.takeakubox.workers.dev/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      }),
      45000,
    );

    const data = await response.json();

    if (!data.success) {
      throw new Error(data.error?.message || "Failed to generate context");
    }

    displayOutput(data);
    saveToHistory(data);

    hideLoading();
    enableGenerate();
  } catch (error) {
    hideLoading();
    showError(getErrorMessage(error));
    enableGenerate();
  }
}

// ===========================
// Display Output
// ===========================
function displayOutput(data) {
  state.currentOutput = data.output;
  state.currentOutputJSON = data.outputJSON || null;

  elements.outputText.textContent = data.output;
  elements.outputPanel.classList.remove("hidden");
  elements.outputPanel.classList.add("fade-in");

  // Display metadata
  if (data.metadata) {
    const metadataText =
      `Provider: ${data.metadata.provider} | ` +
      `Model: ${data.metadata.model} | ` +
      `Time: ${data.metadata.processingTime}ms` +
      (data.metadata.fallbackUsed ? " | Fallback used" : "");
    elements.outputMetadata.textContent = metadataText;
  }

  // Reset format to text
  document.querySelector('input[name="format"][value="text"]').checked = true;
}

// ===========================
// Toggle Output Format
// ===========================
function toggleOutputFormat(format) {
  if (format === "json" && state.currentOutputJSON) {
    elements.outputText.textContent = JSON.stringify(
      state.currentOutputJSON,
      null,
      2,
    );
  } else {
    elements.outputText.textContent = state.currentOutput;
  }
}

// ===========================
// Copy to Clipboard
// ===========================
async function handleCopy() {
  const textToCopy = elements.outputText.textContent;

  try {
    await navigator.clipboard.writeText(textToCopy);

    // Show success feedback
    elements.copyFeedback.textContent = "✓ Copied!";
    elements.copyFeedback.classList.add("show");

    setTimeout(() => {
      elements.copyFeedback.classList.remove("show");
    }, 2000);
  } catch (err) {
    console.error("Copy failed:", err);
    elements.copyFeedback.textContent = "✗ Copy failed";
    elements.copyFeedback.classList.add("show");

    setTimeout(() => {
      elements.copyFeedback.classList.remove("show");
    }, 2000);
  }
}

// ===========================
// UI State Helpers
// ===========================
function showLoading(message = "Generating context...") {
  state.loadingStartTime = Date.now();
  elements.loadingText.textContent = message;
  elements.loadingState.classList.remove("hidden");
  elements.loadingState.classList.add("fade-in");

  // Show extended loading message after 15 seconds
  setTimeout(() => {
    if (state.loadingStartTime) {
      elements.loadingText.textContent =
        message + " (generating comprehensive response, please wait...)";
    }
  }, 15000);
}

function hideLoading() {
  state.loadingStartTime = null;
  elements.loadingState.classList.add("hidden");
}

function showError(message) {
  elements.errorText.textContent = message;
  elements.errorMessage.classList.remove("hidden");
  elements.errorMessage.classList.add("fade-in");
}

function hideError() {
  elements.errorMessage.classList.add("hidden");
}

function hideOutput() {
  elements.outputPanel.classList.add("hidden");
}

function disableGenerate() {
  elements.generateBtn.disabled = true;
}

function enableGenerate() {
  elements.generateBtn.disabled = false;
}

function resetModeA() {
  state.modeAStage = null;
  state.modeAQuestions = [];
  elements.questionsPanel.classList.add("hidden");
  elements.generateBtn.classList.remove("hidden");
}

// ===========================
// Helper Functions
// ===========================
function saveToHistory(data) {
  try {
    history.save({
      mode: state.currentMode,
      subMode: state.currentSubMode,
      output: data.output,
      outputJSON: data.outputJSON || null,
      metadata: data.metadata,
    });
  } catch (error) {
    console.error("Failed to save to history:", error);
  }
}

function getErrorMessage(error) {
  if (error.message.includes("timeout")) {
    return "Request timed out. The AI is taking longer than expected. Please try again or simplify your request.";
  } else if (error.message.includes("Failed to fetch")) {
    return "Network error. Please check your internet connection and try again.";
  } else if (error.message.includes("All AI providers failed")) {
    return "All AI providers are currently unavailable. Please try again in a few moments.";
  } else if (error.message.includes("blocked")) {
    return "Content was blocked by safety filters. Please rephrase your request and try again.";
  } else if (
    error.message.includes("quota") ||
    error.message.includes("rate limit")
  ) {
    return "Rate limit exceeded. Please wait a moment and try again.";
  }
  return error.message || "An unexpected error occurred. Please try again.";
}

async function fetchWithTimeout(promise, timeoutMs = 45000) {
  const timeoutPromise = new Promise((_, reject) => {
    setTimeout(() => reject(new Error("Request timeout")), timeoutMs);
  });

  return Promise.race([promise, timeoutPromise]);
}

async function checkHealth() {
  try {
    const response = await fetch(
      "https://contextor-api.takeakubox.workers.dev/api/health",
    );
    const health = await response.json();
    state.healthStatus = health;

    // Update UI indicator if needed
    console.log("Health status:", health.status);
  } catch (error) {
    console.error("Health check failed:", error);
  }
}

// ===========================
// Keyboard Shortcuts
// ===========================
document.addEventListener("keydown", (e) => {
  // Cmd/Ctrl + Enter to generate
  if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
    if (
      !elements.generateBtn.disabled &&
      !elements.generateBtn.classList.contains("hidden")
    ) {
      handleGenerate();
    }
  }

  // Escape to close modal
  if (e.key === "Escape") {
    elements.settingsModal.classList.add("hidden");
  }
});

// ===========================
// Initialization
// ===========================
console.log("CONTEXTOR initialized");
console.log("Tip: Press Cmd/Ctrl + Enter to generate");

// Check health on load
checkHealth();

// Check health every 5 minutes
setInterval(checkHealth, 5 * 60 * 1000);

// Show history count
const historyCount = history.getAll().length;
if (historyCount > 0) {
  console.log(`📚 ${historyCount} outputs in history`);
}
