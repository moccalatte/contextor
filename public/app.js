// ===========================
// Global State
// ===========================
const state = {
  currentMode: "text",
  currentSubMode: "default",
  currentOutput: null,
  currentOutputJSON: null,
  healthStatus: null,
  loadingStartTime: null,
  modeAStage: null, // 'clarify' or 'distill'
  modeAQuestions: [], // Store questions from clarify stage
  modeAOriginalInput: "", // Store original input for enhanced prompt
  selectedProvider: "gemini", // 'gemini', 'openrouter', 'groq'
  selectedModel: null, // Model name (provider-specific)
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

  // Provider & Model Selection
  providerSelect: document.getElementById("providerSelect"),
  modelSelect: document.getElementById("modelSelect"),
  modelRow: document.getElementById("modelRow"),
};

// ===========================
// Model Configuration
// ===========================
const modelConfig = {
  gemini: {
    name: "Gemini",
    models: [
      { value: "gemini-2.5-flash", label: "Gemini 2.5 Flash (65K tokens)" },
    ],
  },
  groq: {
    name: "Groq",
    models: [
      { value: "moonshotai/kimi-k2-instruct", label: "Kimi K2 Instruct" },
      {
        value: "meta-llama/llama-4-maverick-17b-128e-instruct",
        label: "Llama 4 Maverick 17B",
      },
      { value: "openai/gpt-oss-120b", label: "GPT OSS 120B" },
    ],
  },
  openrouter: {
    name: "OpenRouter",
    models: [{ value: "z-ai/glm-4.5-air:free", label: "GLM 4.5 Air (Free)" }],
  },
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

    // Reset Mode A state when switching submodes
    if (state.modeAStage) {
      resetModeA();
    }
  });
});

// Provider selector
elements.providerSelect.addEventListener("change", (e) => {
  state.selectedProvider = e.target.value;
  updateModelDropdown(e.target.value);
});

// Model selector
elements.modelSelect.addEventListener("change", (e) => {
  state.selectedModel = e.target.value;
});

// Generate button
elements.generateBtn.addEventListener("click", handleGenerate);

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

// Initialize model dropdown
updateModelDropdown(state.selectedProvider);

// ===========================
// Provider & Model Management
// ===========================
function updateModelDropdown(provider) {
  const config = modelConfig[provider];
  if (!config) return;

  // Clear existing options
  elements.modelSelect.innerHTML = "";

  // Add new options
  config.models.forEach((model) => {
    const option = document.createElement("option");
    option.value = model.value;
    option.textContent = model.label;
    elements.modelSelect.appendChild(option);
  });

  // Set first model as default
  state.selectedModel = config.models[0].value;
  elements.modelSelect.value = state.selectedModel;
}

// ===========================
// Mode Switching
// ===========================
function switchMode(mode) {
  state.currentMode = mode;

  // Reset Mode A state when switching modes
  if (state.modeAStage) {
    resetModeA();
  }

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
}

function resetModeA() {
  state.modeAStage = null;
  state.modeAQuestions = [];
  state.modeAOriginalInput = "";
  elements.questionsPanel.classList.add("hidden");
  elements.generateBtnText.textContent = "✨ Generate";
  elements.inputField.placeholder = placeholders[state.currentMode];
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

  // Mode A has special 2-stage flow
  if (state.currentMode === "text" && state.currentSubMode === "modeA") {
    await handleModeA(input);
  } else {
    await generateContext(input);
  }
}

// ===========================
// Generate Context (All Modes)
// ===========================
async function generateContext(input) {
  showLoading();
  disableGenerate();

  try {
    const requestBody = {
      mode: state.currentMode,
      input: input,
      provider: state.selectedProvider,
      model: state.selectedModel,
    };

    // Add subMode for Mode B
    if (
      state.currentMode === "text" &&
      (state.currentSubMode === "cot" || state.currentSubMode === "pot")
    ) {
      requestBody.subMode = state.currentSubMode;
    }

    // Add output format for blueprints
    if (state.currentMode !== "text") {
      requestBody.outputFormat = "both"; // Get both text and JSON
    }

    console.log("Sending request:", requestBody); // Debug log

    const response = await fetchWithTimeout(
      fetch("https://contextor-api.takeakubox.workers.dev/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      }),
      45000,
    );

    // Check HTTP status
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({
        error: { message: `HTTP ${response.status}: ${response.statusText}` },
      }));
      throw new Error(
        errorData.error?.message || `Server error: ${response.status}`,
      );
    }

    const data = await response.json();

    if (!data.success) {
      throw new Error(data.error?.message || "Failed to generate context");
    }

    // Validate output exists
    if (!data.output) {
      throw new Error("No output received from server");
    }

    displayOutput(data);
    saveToHistory(data);

    hideLoading();
    enableGenerate();
  } catch (error) {
    console.error("Generate context error:", error);
    hideLoading();
    showError(getErrorMessage(error));
    enableGenerate();
  }
}

// ===========================
// Mode A Handler (Clarify → Distill)
// ===========================
async function handleModeA(input) {
  // Stage 1: Clarify - Get questions
  if (!state.modeAStage) {
    await modeAClarify(input);
  }
  // Stage 2: Distill - Process answers
  else if (state.modeAStage === "clarify") {
    await modeADistill(input);
  }
}

async function modeAClarify(input) {
  showLoading("Generating clarifying questions...");

  // Store original input for later
  state.modeAOriginalInput = input;

  try {
    const requestBody = {
      mode: "text",
      subMode: "modeA",
      stage: "clarify",
      input: input,
      provider: state.selectedProvider,
      model: state.selectedModel,
    };

    console.log("Mode A Clarify request:", requestBody);

    const response = await fetchWithTimeout(
      fetch("https://contextor-api.takeakubox.workers.dev/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      }),
      45000,
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({
        error: { message: `HTTP ${response.status}: ${response.statusText}` },
      }));
      throw new Error(
        errorData.error?.message || `Server error: ${response.status}`,
      );
    }

    const data = await response.json();

    if (!data.success || !data.questions) {
      throw new Error(data.error?.message || "Failed to generate questions");
    }

    // Store questions and show them
    state.modeAQuestions = data.questions;
    state.modeAStage = "clarify";

    displayQuestions(data.questions);

    hideLoading();
    enableGenerate();
  } catch (error) {
    console.error("Mode A Clarify error:", error);
    hideLoading();
    showError(getErrorMessage(error));
    enableGenerate();
  }
}

async function modeADistill(answersText) {
  if (!state.modeAQuestions || state.modeAQuestions.length === 0) {
    showError("No questions found. Please start over.");
    return;
  }

  if (!answersText.trim()) {
    showError("Please provide answers to the questions.");
    return;
  }

  showLoading("Distilling context from your answers...");
  disableGenerate();

  try {
    // Parse answers
    console.log("Original input text length:", answersText.length);
    console.log("Expected answers count:", state.modeAQuestions.length);

    const answers = parseAnswers(answersText, state.modeAQuestions.length);

    console.log("Parsed answers count:", answers.length);
    console.log("Parsed answers:", answers);

    const requestBody = {
      mode: "text",
      subMode: "modeA",
      stage: "distill",
      input: state.modeAOriginalInput, // Send original input for context
      questions: state.modeAQuestions,
      answers: answers,
      provider: state.selectedProvider,
      model: state.selectedModel,
    };

    console.log("Mode A Distill request:", requestBody);

    const response = await fetchWithTimeout(
      fetch("https://contextor-api.takeakubox.workers.dev/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      }),
      45000,
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({
        error: { message: `HTTP ${response.status}: ${response.statusText}` },
      }));
      throw new Error(
        errorData.error?.message || `Server error: ${response.status}`,
      );
    }

    const data = await response.json();

    if (!data.success || !data.output) {
      throw new Error(data.error?.message || "Failed to distill context");
    }

    // Reset Mode A state
    state.modeAStage = null;
    state.modeAQuestions = [];

    // Hide questions panel
    elements.questionsPanel.classList.add("hidden");

    // Show final output
    displayOutput(data);
    saveToHistory(data);

    hideLoading();
    enableGenerate();
  } catch (error) {
    console.error("Mode A Distill error:", error);
    hideLoading();
    showError(getErrorMessage(error));
    enableGenerate();
  }
}

function displayQuestions(questions) {
  // Build enhanced prompt with original input + questions
  let enhancedPrompt = "";

  // Add original input context
  if (state.modeAOriginalInput) {
    enhancedPrompt += `ORIGINAL REQUEST:\n"${state.modeAOriginalInput}"\n\n`;
    enhancedPrompt += `TASK: Create comprehensive context engineering brief for the above request.\n\n`;
  }

  enhancedPrompt +=
    "📋 CLARIFYING QUESTIONS - Please provide detailed answers:\n\n";

  questions.forEach((q, i) => {
    enhancedPrompt += `${i + 1}. ${q}\n   Answer: \n\n`;
  });

  enhancedPrompt +=
    "\n💡 TIP: Fill in your answers next to 'Answer:' for each question above.";

  // Set the enhanced prompt in the input field
  elements.inputField.value = enhancedPrompt;

  // Focus on the input field and position cursor after first "Answer:"
  elements.inputField.focus();
  const firstAnswerPos = enhancedPrompt.indexOf("Answer:") + 8;
  elements.inputField.setSelectionRange(firstAnswerPos, firstAnswerPos);

  // Hide questions panel (we're showing everything in input box now)
  elements.questionsPanel.classList.add("hidden");

  // Change button text and placeholder
  elements.generateBtnText.textContent = "💫 Distill Context";
  elements.inputField.placeholder =
    "Provide detailed answers to each question...";

  // Questions are now shown directly in input box, no separate panel needed
  elements.questionsPanel.classList.add("fade-in");
}

function parseAnswers(text, expectedCount) {
  // Remove header sections first
  let cleanText = text;

  // Remove ORIGINAL REQUEST section if present
  cleanText = cleanText.replace(/ORIGINAL REQUEST:[\s\S]*?(?=\n\n|📋)/gi, "");

  // Remove TASK section if present
  cleanText = cleanText.replace(/TASK:[\s\S]*?(?=\n\n|📋)/gi, "");

  // Remove the 📋 header
  cleanText = cleanText.replace(/📋 CLARIFYING QUESTIONS.*?\n\n/gi, "");

  // Remove the 💡 TIP footer
  cleanText = cleanText.replace(/💡 TIP:.*$/gi, "");

  // Primary method: extract answers from "Answer: xxx" pattern
  const answerPattern = /Answer:\s*(.+?)(?=\n\s*\d+\.|Answer:|$)/gis;
  const matches = [...cleanText.matchAll(answerPattern)];

  if (matches.length > 0) {
    const answers = matches
      .map((match) => match[1].trim())
      .filter((a) => a.length > 0 && !a.match(/^(ORIGINAL|TASK|📋|💡)/));

    if (answers.length >= expectedCount * 0.7) {
      // Got at least 70% of expected answers
      while (answers.length < expectedCount) {
        answers.push("");
      }
      return answers.slice(0, expectedCount);
    }
  }

  // Fallback 1: Try numbered format "1. answer\n2. answer\n..."
  // But skip the question numbers themselves
  const lines = cleanText.split("\n");
  const answers = [];
  let currentAnswer = "";
  let inAnswer = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    // Skip empty lines and headers
    if (!line || line.match(/^(ORIGINAL|TASK|📋|💡)/)) {
      continue;
    }

    // Check if this is a question line (number followed by text)
    if (line.match(/^\d+\./)) {
      // Save previous answer if exists
      if (inAnswer && currentAnswer) {
        answers.push(currentAnswer.trim());
        currentAnswer = "";
      }
      inAnswer = false;
      continue;
    }

    // Check if this is an answer line
    if (line.startsWith("Answer:") || inAnswer) {
      inAnswer = true;
      const answerText = line.replace(/^Answer:\s*/, "");
      currentAnswer += (currentAnswer ? " " : "") + answerText;
    }
  }

  // Add last answer
  if (currentAnswer) {
    answers.push(currentAnswer.trim());
  }

  // Final fallback: just extract non-question text
  if (answers.length < expectedCount * 0.5) {
    const fallbackAnswers = lines
      .filter((line) => {
        const trimmed = line.trim();
        return (
          trimmed &&
          !trimmed.match(/^\d+\./) &&
          !trimmed.startsWith("Answer:") &&
          !trimmed.match(/^(ORIGINAL|TASK|📋|💡)/)
        );
      })
      .map((line) => line.trim())
      .filter((line) => line.length > 3);

    if (fallbackAnswers.length > answers.length) {
      while (fallbackAnswers.length < expectedCount) {
        fallbackAnswers.push("");
      }
      return fallbackAnswers.slice(0, expectedCount);
    }
  }

  // Pad with empty strings if needed
  while (answers.length < expectedCount) {
    answers.push("");
  }

  return answers.slice(0, expectedCount);
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

  // Also hide questions panel if switching away
  if (!state.modeAStage) {
    elements.questionsPanel.classList.add("hidden");
  }
}

function disableGenerate() {
  elements.generateBtn.disabled = true;
}

function enableGenerate() {
  elements.generateBtn.disabled = false;
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
