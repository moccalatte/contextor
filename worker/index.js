// ===========================
// Cloudflare Worker - CONTEXTOR API
// ===========================

export default {
  async fetch(request, env) {
    // Handle CORS preflight
    if (request.method === "OPTIONS") {
      return handleCORS();
    }

    // Route API requests
    const url = new URL(request.url);

    if (url.pathname === "/api/generate" && request.method === "POST") {
      return handleGenerate(request, env);
    }

    // Health check endpoint
    if (url.pathname === "/api/health" && request.method === "GET") {
      return handleHealthCheck(env);
    }

    // Return 404 for other routes
    return new Response("Not Found", { status: 404 });
  },
};

// ===========================
// Token Budgets
// ===========================
const PROVIDER_TOKEN_CAPS = {
  gemini: 65000, // advertised max output tokens
  groq: 8000,
  openrouter: 4000,
};

function resolveMaxTokens(provider, requestedTokens) {
  const cap = PROVIDER_TOKEN_CAPS[provider];
  if (requestedTokens && cap) {
    return Math.min(requestedTokens, cap);
  }
  if (!requestedTokens && cap) {
    return cap;
  }
  return requestedTokens || 2048;
}

// ===========================
// Main Generate Handler
// ===========================
async function handleGenerate(request, env) {
  try {
    // Parse request body
    const body = await request.json();

    // Validate request
    const validation = validateRequest(body);
    if (!validation.valid) {
      return errorResponse("INVALID_REQUEST", validation.error);
    }

    // Route to appropriate processor
    const startTime = Date.now();
    const result = await routeRequest(body, env);

    // Add processing time
    result.metadata = {
      ...result.metadata,
      processingTime: Date.now() - startTime,
    };

    // Return success response
    return new Response(JSON.stringify(result), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders(),
      },
    });
  } catch (error) {
    console.error("Worker error:", error);
    return errorResponse("INTERNAL_ERROR", "An unexpected error occurred");
  }
}

// ===========================
// Input Sanitization
// ===========================
function sanitizeInput(input) {
  if (typeof input !== "string") {
    return "";
  }

  // Trim whitespace
  input = input.trim();

  // Remove null bytes
  input = input.replace(/\0/g, "");

  // Normalize unicode (NFKC form)
  input = input.normalize("NFKC");

  // Remove excessive newlines (max 2 consecutive)
  input = input.replace(/\n{3,}/g, "\n\n");

  // Remove control characters except newlines and tabs
  input = input.replace(/[\x00-\x08\x0B-\x0C\x0E-\x1F\x7F]/g, "");

  // Limit length
  if (input.length > 5000) {
    input = input.substring(0, 5000);
  }

  return input;
}

// ===========================
// Request Validation
// ===========================
function validateRequest(body) {
  const { mode, input, subMode, stage, model, provider } = body;

  // Validate mode
  const validModes = ["text", "image", "video", "music"];
  if (!mode || !validModes.includes(mode)) {
    return {
      valid: false,
      error: "Invalid mode. Must be: text, image, video, or music",
    };
  }

  // Validate input
  if (!input || typeof input !== "string" || input.trim().length === 0) {
    return {
      valid: false,
      error: "Input is required and must be non-empty string",
    };
  }

  // Sanitize input
  body.input = sanitizeInput(input);

  // Validate sanitized input is not empty
  if (body.input.length === 0) {
    return {
      valid: false,
      error: "Input contains no valid characters",
    };
  }

  // Validate Mode A
  if (subMode === "modeA") {
    const validStages = ["clarify", "distill"];
    if (!stage || !validStages.includes(stage)) {
      console.error("Mode A validation failed: invalid stage", {
        subMode,
        stage,
      });
      return {
        valid: false,
        error: "Mode A requires valid stage: clarify or distill",
      };
    }

    if (stage === "distill") {
      if (!body.questions || !body.answers) {
        console.error(
          "Mode A distill validation failed: missing questions/answers",
        );
        return {
          valid: false,
          error: "Distill stage requires questions and answers",
        };
      }
      if (!Array.isArray(body.questions) || !Array.isArray(body.answers)) {
        console.error("Mode A distill validation failed: not arrays");
        return { valid: false, error: "Questions and answers must be arrays" };
      }
      if (body.questions.length !== body.answers.length) {
        console.error("Mode A distill validation failed: length mismatch");
        return {
          valid: false,
          error: "Number of questions and answers must match",
        };
      }

      // Sanitize answers
      body.answers = body.answers.map((answer) => sanitizeInput(answer || ""));
    }
  }

  // Validate Mode B
  const validReasoningModes = ["cot", "pot", "tree", "react"];
  if (validReasoningModes.includes(subMode)) {
    console.log("Reasoning mode detected:", subMode);
  }

  // Validate provider if specified
  if (provider && !["gemini", "openrouter", "groq"].includes(provider)) {
    return {
      valid: false,
      error: "Invalid provider. Must be gemini, openrouter, or groq",
    };
  }

  // Validate model if specified
  if (model && typeof model !== "string") {
    return { valid: false, error: "Model must be a string" };
  }

  return { valid: true };
}

// ===========================
// Request Router
// ===========================
async function routeRequest(body, env) {
  const { mode, subMode, stage } = body;

  console.log("Routing request:", { mode, subMode, stage });

  // Route by mode and subMode
  if (subMode === "modeA") {
    console.log("Routing to Mode A");
    return await processModeA(body, env);
  } else if (subMode === "cot" || subMode === "pot") {
    console.log("Routing to Mode B:", subMode);
    return await processModeB(body, env);
  } else {
    // Default mode or explicit "default" subMode
    console.log("Routing to default mode:", mode);
    switch (mode) {
      case "text":
        return await processTextMode(body, env);
      case "image":
        return await processImageMode(body, env);
      case "video":
        return await processVideoMode(body, env);
      case "music":
        return await processMusicMode(body, env);
      default:
        throw new Error(`Unknown mode: ${mode}`);
    }
  }
}

// ===========================
// Default Text Mode
// ===========================
async function processTextMode(body, env) {
  const { input, provider, model } = body;

  // Input length validation
  if (input.length > 3000) {
    throw new Error(
      "Input too long. Please limit to 3000 characters or break into smaller requests.",
    );
  }

  const systemPrompt = `Transform this into a well-structured, comprehensive context brief.`;

  const userPrompt = input;

  const aiResult = await callAIWithFallback(systemPrompt, userPrompt, env, {
    temperature: 0.7,
    maxTokens: 12000, // allow longer briefs; clamped per provider
    provider: provider,
    model: model,
  });

  return {
    success: true,
    mode: "text",
    output: aiResult.output,
    metadata: {
      provider: aiResult.provider,
      model: aiResult.model,
      fallbackUsed: aiResult.fallbackUsed,
      maxTokens: aiResult.maxTokens || null,
      truncated: !!aiResult.truncated,
    },
  };
}

// ===========================
// Mode A - Clarify & Distill
// ===========================
async function processModeA(body, env) {
  const { stage } = body;

  console.log("Processing Mode A, stage:", stage);

  if (stage === "clarify") {
    return await processModeAClarify(body, env);
  } else if (stage === "distill") {
    return await processModeADistill(body, env);
  } else {
    throw new Error(`Invalid Mode A stage: ${stage}`);
  }
}

async function processModeAClarify(body, env) {
  const { input, provider, model } = body;

  // Input length validation - increased limit
  if (input.length > 2000) {
    throw new Error(
      "Input too long for clarification mode. Please limit to 2000 characters or use a more concise description.",
    );
  }

  console.log(`Mode A Clarify - input length: ${input.length} chars`);

  const systemPrompt = `You are an expert at asking comprehensive clarifying questions. Given the user's input, generate 10-15 detailed, specific questions that will help create a complete context engineering brief.

Cover ALL relevant aspects:
1. Core objectives and goals
2. Target audience and users
3. Technical requirements and stack preferences
4. Features and functionality (be specific!)
5. Design and UX preferences
6. Data handling and storage needs
7. Integration requirements (APIs, third-party services)
8. Performance and scalability expectations
9. Security and privacy considerations
10. Timeline, budget, and resource constraints
11. Success metrics and KPIs
12. Potential challenges and edge cases
13. Future expansion possibilities
14. Deployment and hosting preferences
15. Any domain-specific requirements

Make each question:
- Specific and actionable (not vague)
- Relevant to the input domain
- Progressive (build on each other)
- Detailed enough to extract comprehensive answers

Output ONLY the numbered questions, nothing else. Format:
1. [Question]
2. [Question]
...
15. [Question]`;

  const userPrompt = input;

  let aiResult;
  let questions;

  try {
    aiResult = await callAIWithFallback(systemPrompt, userPrompt, env, {
      temperature: 0.8,
      maxTokens: 6000, // Larger budget to prevent truncated questions
      provider: provider,
      model: model,
    });
    questions = parseQuestions(aiResult.output);

    // Ensure we have at least 10 questions
    if (questions.length < 10) {
      console.warn(
        `Only ${questions.length} questions generated, expected 10-15`,
      );
    }
  } catch (error) {
    console.error(
      "Mode A Clarify failed, using comprehensive generic questions:",
      error.message,
    );

    // Emergency fallback: return comprehensive generic questions
    questions = [
      "What is the main goal or objective of this project?",
      "Who is the target audience or user base?",
      "What are the core features and functionalities you want to include?",
      "What technical stack or technologies do you prefer (if any)?",
      "Are there any specific design or UX requirements?",
      "How will data be handled, stored, and managed?",
      "Do you need integration with any third-party APIs or services?",
      "What are the performance and scalability expectations?",
      "Are there any security or privacy considerations?",
      "What is the timeline and budget for this project?",
      "How will you measure success (KPIs, metrics)?",
      "What potential challenges or edge cases should be considered?",
      "Are there plans for future expansion or additional features?",
      "What are your deployment and hosting preferences?",
      "Any other specific requirements or constraints?",
    ];

    aiResult = {
      provider: "fallback",
      model: "generic",
      fallbackUsed: true,
    };
  }

  return {
    success: true,
    mode: "text",
    subMode: "modeA",
    stage: "clarify",
    questions: questions,
    metadata: {
      provider: aiResult.provider,
      model: aiResult.model,
      fallbackUsed: aiResult.fallbackUsed,
      maxTokens: aiResult.maxTokens || null,
      truncated: !!aiResult.truncated,
    },
  };
}

async function processModeADistill(body, env) {
  const { input, questions, answers, provider, model } = body;

  const systemPrompt = `You are an expert at synthesizing Q&A into comprehensive context engineering briefs. Create a detailed, well-structured brief that integrates all information from the questions and answers. The brief should be production-ready for any AI model.`;

  let contextText = "";

  // Include original input for context
  if (input) {
    contextText += `ORIGINAL REQUEST:\n"${input}"\n\n`;
  }

  contextText += "CLARIFICATION Q&A:\n\n";
  for (let i = 0; i < questions.length; i++) {
    contextText += `Q${i + 1}: ${questions[i]}\n`;
    contextText += `A${i + 1}: ${answers[i] || "(No answer provided)"}\n\n`;
  }

  const userPrompt = `${contextText}

Based on the original request and the Q&A clarification above, synthesize a comprehensive, production-ready context engineering brief.

Requirements:
- Include ALL key information from the answers
- Organize logically with clear sections
- Be specific and actionable
- Remove redundancy
- Do NOT use Q&A format
- Create a cohesive narrative
- Be comprehensive yet concise

Generate the context brief:`;

  const aiResult = await callAIWithFallback(systemPrompt, userPrompt, env, {
    temperature: 0.7,
    maxTokens: 32000, // Large budget for full synthesis, clamped by provider
    provider: provider,
    model: model,
  });

  return {
    success: true,
    mode: "text",
    subMode: "modeA",
    stage: "distill",
    output: aiResult.output,
    metadata: {
      provider: aiResult.provider,
      model: aiResult.model,
      fallbackUsed: aiResult.fallbackUsed,
      maxTokens: aiResult.maxTokens || null,
      truncated: !!aiResult.truncated,
    },
  };
}

// ===========================
// Mode B - CoT / PoT
// ===========================
async function processModeB(body, env) {
  const { input, subMode, provider, model } = body;

  // Input length validation
  if (input.length > 2500) {
    throw new Error(
      "Input too long for reasoning mode. Please limit to 2500 characters.",
    );
  }

  let systemPrompt;

  if (subMode === "cot") {
    systemPrompt = `Break down this problem step-by-step using Chain-of-Thought reasoning.`;
  } else if (subMode === "pot") {
    systemPrompt = `Transform this into algorithmic pseudo-code reasoning (Program-of-Thought).`;
  } else if (subMode === "tree") {
    systemPrompt = `Use Tree of Thoughts reasoning: explore multiple solution paths, evaluate each branch, and select the best approach. Structure your response with: 1) Multiple thought branches 2) Evaluation of each branch 3) Selected optimal path 4) Final solution.`;
  } else if (subMode === "react") {
    systemPrompt = `Use ReAct (Reasoning + Acting) methodology: alternate between reasoning steps and action steps. Format: Thought 1 → Action 1 → Observation 1 → Thought 2 → Action 2 → Observation 2... → Final Answer.`;
  } else {
    systemPrompt = `Break down this problem step-by-step using Chain-of-Thought reasoning.`;
  }

  const userPrompt = input;

  const aiResult = await callAIWithFallback(systemPrompt, userPrompt, env, {
    temperature: 0.8,
    maxTokens: 12000,
    provider: provider,
    model: model,
  });

  return {
    success: true,
    mode: "text",
    subMode: subMode,
    output: aiResult.output,
    metadata: {
      provider: aiResult.provider,
      model: aiResult.model,
      fallbackUsed: aiResult.fallbackUsed,
      maxTokens: aiResult.maxTokens || null,
      truncated: !!aiResult.truncated,
    },
  };
}

// ===========================
// Image Mode
// ===========================
async function processImageMode(body, env) {
  const { input, outputFormat, provider, model } = body;

  const systemPrompt = `Generate detailed image prompt with: Subject, Scene, Environment, Lighting, Camera, Lens, Mood, Palette, Art Style, Textures, Composition, Negative Controls, References.`;

  const userPrompt = input;

  const aiResult = await callAIWithFallback(systemPrompt, userPrompt, env, {
    temperature: 0.7,
    maxTokens: 8000,
  });

  const response = {
    success: true,
    mode: "image",
    output: aiResult.output,
    metadata: {
      provider: aiResult.provider,
      model: aiResult.model,
      fallbackUsed: aiResult.fallbackUsed,
      maxTokens: aiResult.maxTokens || null,
      truncated: !!aiResult.truncated,
    },
  };

  if (outputFormat === "json" || outputFormat === "both") {
    response.outputJSON = parseBlueprintToJSON(aiResult.output);
  }

  return response;
}

// ===========================
// Video Mode
// ===========================
async function processVideoMode(body, env) {
  const { input, outputFormat, provider, model } = body;

  const systemPrompt = `Generate cinematic video breakdown with: Scene Summary, Camera Motion, Lens, Character Movement, Environment, Lighting, Timeline (per second), Style, Aesthetic Rules, Negative Controls, References.`;

  const userPrompt = input;

  const aiResult = await callAIWithFallback(systemPrompt, userPrompt, env, {
    temperature: 0.7,
    maxTokens: 8000,
    provider: provider,
    model: model,
  });

  const response = {
    success: true,
    mode: "video",
    output: aiResult.output,
    metadata: {
      provider: aiResult.provider,
      model: aiResult.model,
      fallbackUsed: aiResult.fallbackUsed,
      maxTokens: aiResult.maxTokens || null,
      truncated: !!aiResult.truncated,
    },
  };

  if (outputFormat === "json" || outputFormat === "both") {
    response.outputJSON = parseBlueprintToJSON(aiResult.output);
  }

  return response;
}

// ===========================
// Music Mode
// ===========================
async function processMusicMode(body, env) {
  const { input, outputFormat, provider, model } = body;

  const systemPrompt = `Generate music blueprint with: Genre, Tempo (BPM), Key, Chord Progression, Mood, Vocal Style, Lyrical Theme, Instrumentation, Mixing Style, Song Structure, Reference Tracks.`;

  const userPrompt = input;

  const aiResult = await callAIWithFallback(systemPrompt, userPrompt, env, {
    temperature: 0.7,
    maxTokens: 8000,
  });

  const response = {
    success: true,
    mode: "music",
    output: aiResult.output,
    metadata: {
      provider: aiResult.provider,
      model: aiResult.model,
      fallbackUsed: aiResult.fallbackUsed,
      maxTokens: aiResult.maxTokens || null,
      truncated: !!aiResult.truncated,
    },
  };

  if (outputFormat === "json" || outputFormat === "both") {
    response.outputJSON = parseBlueprintToJSON(aiResult.output);
  }

  return response;
}

// ===========================
// AI Provider Integration
// ===========================
async function callAIWithFallback(systemPrompt, userPrompt, env, options = {}) {
  let result = null;
  let fallbackUsed = false;

  // Check if user specified a provider and model
  const preferredProvider = options.provider || "gemini";
  const preferredModel = options.model;

  try {
    // Use user-selected provider if specified
    if (preferredProvider === "groq") {
      result = await fetchWithTimeout(async () => {
        return await fetchWithRetry(
          () =>
            callGroq(systemPrompt, userPrompt, env, {
              ...options,
              model: preferredModel,
            }),
          1,
        );
      }, 45000);
    } else if (preferredProvider === "openrouter") {
      result = await fetchWithTimeout(async () => {
        return await fetchWithRetry(
          () =>
            callOpenRouter(systemPrompt, userPrompt, env, {
              ...options,
              model: preferredModel,
            }),
          1,
        );
      }, 45000);
    } else {
      // Default: Gemini with retry (only 1 retry for MAX_TOKENS errors)
      result = await fetchWithTimeout(async () => {
        return await fetchWithRetry(
          () => callGemini(systemPrompt, userPrompt, env, options),
          1, // Reduced from 2 to 1 - MAX_TOKENS won't fix itself with retry
        );
      }, 45000);
    }
  } catch (primaryError) {
    console.error(
      `${preferredProvider} failed, trying fallback:`,
      primaryError.message,
    );

    // If error is about complexity/length, don't fallback - just throw
    if (
      primaryError.message.includes("too complex") ||
      primaryError.message.includes("shorter")
    ) {
      throw primaryError;
    }

    fallbackUsed = true;

    try {
      // Fallback logic: Groq -> OpenRouter -> Gemini (depending on what failed)
      if (preferredProvider === "groq") {
        result = await fetchWithTimeout(
          () =>
            fetchWithRetry(
              () => callOpenRouter(systemPrompt, userPrompt, env, options),
              1,
            ),
          45000,
        );
      } else if (preferredProvider === "openrouter") {
        result = await fetchWithTimeout(
          () =>
            fetchWithRetry(
              () => callGemini(systemPrompt, userPrompt, env, options),
              1,
            ),
          45000,
        );
      } else {
        // Gemini failed, try OpenRouter
        result = await fetchWithTimeout(
          () =>
            fetchWithRetry(
              () => callOpenRouter(systemPrompt, userPrompt, env, options),
              1,
            ),
          45000,
        );
      }
    } catch (fallbackError) {
      console.error("Fallback also failed:", fallbackError.message);

      // Better error message for rate limits
      if (
        fallbackError.message.includes("429") ||
        fallbackError.message.includes("Rate limit")
      ) {
        throw new Error(
          "AI service temporarily unavailable. Please try again in a few minutes.",
        );
      }

      throw new Error("All AI providers failed. Please try again later.");
    }
  }

  return {
    ...result,
    fallbackUsed,
  };
}

async function callOpenRouter(systemPrompt, userPrompt, env, options = {}) {
  const endpoint = "https://openrouter.ai/api/v1/chat/completions";
  const apiKey = env.OPENROUTER_API_KEY;

  // Use specified model or default
  const model = options.model || "z-ai/glm-4.5-air:free";
  const maxTokens = resolveMaxTokens("openrouter", options.maxTokens);

  const requestBody = {
    model: model,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
    temperature: options.temperature || 0.7,
    max_tokens: maxTokens,
  };

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
      "HTTP-Referer": "https://contextor.pages.dev",
      "X-Title": "CONTEXTOR",
    },
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`OpenRouter error: ${response.status} - ${errorText}`);
  }

  const data = await response.json();

  const choice = data.choices?.[0];
  const finishReason = choice?.finish_reason || choice?.finishReason || "stop";
  const outputText = choice?.message?.content;

  if (!outputText) {
    throw new Error("OpenRouter returned empty response");
  }

  const truncated = (finishReason || "").toLowerCase() === "length";
  const output = truncated
    ? `${outputText}\n\n[Note: Response reached OpenRouter token limit. Switch to Gemini for longer output.]`
    : outputText;

  return {
    output,
    provider: "openrouter",
    model: options.model || "glm-4.5-air:free",
    maxTokens,
    truncated,
  };
}

async function callGroq(systemPrompt, userPrompt, env, options = {}) {
  const endpoint = "https://api.groq.com/openai/v1/chat/completions";
  const apiKey = env.GROQ_API_KEY;

  // Default to first model if not specified
  const model = options.model || "moonshotai/kimi-k2-instruct";
  const maxTokens = resolveMaxTokens("groq", options.maxTokens);

  const requestBody = {
    model: model,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
    temperature: options.temperature || 0.7,
    max_tokens: maxTokens,
  };

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Groq error: ${response.status} - ${errorText}`);
  }

  const data = await response.json();

  const choice = data.choices?.[0];
  const finishReason = choice?.finish_reason || choice?.finishReason || "stop";
  const outputText = choice?.message?.content;

  if (!outputText) {
    throw new Error("Groq returned empty response");
  }

  const truncated = (finishReason || "").toLowerCase() === "length";
  const output = truncated
    ? `${outputText}\n\n[Note: Response reached Groq token limit. Switch to Gemini for longer output.]`
    : outputText;

  return {
    output,
    provider: "groq",
    model: model,
    maxTokens,
    truncated,
  };
}

async function callGemini(systemPrompt, userPrompt, env, options = {}) {
  const apiKey = env.GEMINI_API_KEY;
  // Use Gemini 2.5 Flash (verified working via curl test)
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

  const combinedPrompt = `${systemPrompt}\n\n${userPrompt}`;
  const maxOutputTokens = resolveMaxTokens("gemini", options.maxTokens);

  console.log(
    `Gemini request - prompt length: ${combinedPrompt.length} chars, maxTokens: ${maxOutputTokens}`,
  );

  const requestBody = {
    contents: [
      {
        parts: [{ text: combinedPrompt }],
      },
    ],
    generationConfig: {
      temperature: options.temperature || 0.7,
      maxOutputTokens: maxOutputTokens,
      topP: 0.95,
      topK: 40,
    },
    // Safety settings to prevent blocking
    safetySettings: [
      {
        category: "HARM_CATEGORY_HARASSMENT",
        threshold: "BLOCK_ONLY_HIGH",
      },
      {
        category: "HARM_CATEGORY_HATE_SPEECH",
        threshold: "BLOCK_ONLY_HIGH",
      },
      {
        category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
        threshold: "BLOCK_ONLY_HIGH",
      },
      {
        category: "HARM_CATEGORY_DANGEROUS_CONTENT",
        threshold: "BLOCK_ONLY_HIGH",
      },
    ],
  };

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Gemini HTTP error: ${response.status} - ${errorText}`);
  }

  const data = await response.json();

  // Comprehensive response validation
  if (!data) {
    throw new Error("Gemini returned empty response");
  }

  // Check for safety blocking or other issues
  if (!data.candidates || data.candidates.length === 0) {
    console.error("Gemini response:", JSON.stringify(data));

    // Check for prompt feedback (safety blocking)
    if (data.promptFeedback && data.promptFeedback.blockReason) {
      throw new Error(`Gemini blocked: ${data.promptFeedback.blockReason}`);
    }

    throw new Error(
      "Gemini returned no candidates (possibly content filtered)",
    );
  }

  const candidate = data.candidates[0];

  // Check finish reason BEFORE validating content
  const finishReason = candidate.finishReason || "STOP";

  if (finishReason === "SAFETY") {
    throw new Error("Gemini blocked content due to safety filters");
  }

  if (finishReason === "RECITATION") {
    throw new Error("Gemini blocked due to recitation concerns");
  }

  // Handle MAX_TOKENS - CRITICAL FIX: Sometimes content.parts is missing
  if (finishReason === "MAX_TOKENS") {
    console.warn(
      "Gemini hit MAX_TOKENS, attempting to extract partial response",
    );
    console.error("Gemini candidate:", JSON.stringify(candidate));

    // Try to get partial text if available
    let partialText = "";
    if (
      candidate.content &&
      candidate.content.parts &&
      candidate.content.parts.length > 0 &&
      candidate.content.parts[0] &&
      candidate.content.parts[0].text
    ) {
      partialText = candidate.content.parts[0].text;
    }

    if (partialText && partialText.trim().length > 0) {
      // Return partial text with warning
      console.warn(
        "Returning partial text due to MAX_TOKENS:",
        partialText.length,
        "characters",
      );
      return {
        output:
          partialText +
          "\n\n[Note: Response was truncated due to length limits. Please try with a shorter input or more specific request.]",
        provider: "gemini",
        model: "gemini-2.5-flash",
        truncated: true,
        maxTokens: maxOutputTokens,
      };
    } else {
      // CRITICAL: MAX_TOKENS with no content means prompt is too long
      // Don't retry - reduce prompt length instead
      console.error("MAX_TOKENS with no output - prompt likely too long");
      throw new Error(
        "Request too complex. Please try a shorter or more specific input.",
      );
    }
  }

  // Validate content structure for normal responses
  if (
    !candidate.content ||
    !candidate.content.parts ||
    candidate.content.parts.length === 0
  ) {
    console.error("Gemini candidate:", JSON.stringify(candidate));
    throw new Error("Gemini response missing content or parts");
  }

  const outputText = candidate.content.parts[0].text;

  if (!outputText || outputText.trim().length === 0) {
    throw new Error("Gemini returned empty text");
  }

  // Warn if stopped for other reasons
  if (finishReason !== "STOP") {
    console.warn("Gemini finish reason (unusual):", finishReason);
  }

  return {
    output: outputText,
    provider: "gemini",
    model: "gemini-2.5-flash",
    maxTokens: maxOutputTokens,
    truncated: false,
  };
}

// ===========================
// Retry Logic & Timeout Handling
// ===========================
async function fetchWithRetry(fn, maxRetries = 2) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === maxRetries - 1) throw error;

      // Exponential backoff: 1s, 2s
      const delay = Math.pow(2, i) * 1000;
      await new Promise((resolve) => setTimeout(resolve, delay));

      console.log(`Retry ${i + 1}/${maxRetries} after ${delay}ms`);
    }
  }
}

async function fetchWithTimeout(fn, timeoutMs = 45000) {
  const timeoutPromise = new Promise((_, reject) => {
    setTimeout(() => reject(new Error("Request timeout")), timeoutMs);
  });

  return Promise.race([fn(), timeoutPromise]);
}

// ===========================
// Health Check Handler
// ===========================
async function handleHealthCheck(env) {
  const health = {
    status: "healthy",
    timestamp: new Date().toISOString(),
    providers: {
      gemini: { status: "unknown", latency: null },
      openrouter: { status: "unknown", latency: null },
      groq: { status: "unknown", latency: null },
    },
  };

  // Test Gemini
  try {
    const start = Date.now();
    await callGemini("You are a health check bot.", "Say OK", env, {
      maxTokens: 100, // Increased from 10 to avoid MAX_TOKENS
    });
    health.providers.gemini = {
      status: "healthy",
      latency: Date.now() - start,
    };
  } catch (error) {
    // If error is MAX_TOKENS, it means API is working (just token limit hit)
    if (error.message.includes("MAX_TOKENS")) {
      health.providers.gemini = {
        status: "healthy",
        latency: Date.now() - start,
        note: "API working (MAX_TOKENS in health check)",
      };
    } else {
      health.providers.gemini = {
        status: "unhealthy",
        error: error.message,
      };
    }
  }

  // Test OpenRouter
  try {
    const start = Date.now();
    await callOpenRouter("You are a health check bot.", "Say OK", env, {
      maxTokens: 100, // Increased from 10
    });
    health.providers.openrouter = {
      status: "healthy",
      latency: Date.now() - start,
    };
  } catch (error) {
    // Rate limit is expected for free tier, don't mark as unhealthy
    if (error.message.includes("Rate limit") || error.message.includes("429")) {
      health.providers.openrouter = {
        status: "healthy",
        latency: null,
        note: "Rate limited (expected for free tier)",
      };
    } else {
      health.providers.openrouter = {
        status: "unhealthy",
        error: error.message,
      };
    }
  }

  // Test Groq
  try {
    const start = Date.now();
    await callGroq("You are a health check bot.", "Say OK", env, {
      maxTokens: 100,
    });
    health.providers.groq = {
      status: "healthy",
      latency: Date.now() - start,
    };
  } catch (error) {
    // Rate limit is expected for free tier, don't mark as unhealthy
    if (error.message.includes("Rate limit") || error.message.includes("429")) {
      health.providers.groq = {
        status: "healthy",
        latency: null,
        note: "Rate limited (expected for free tier)",
      };
    } else {
      health.providers.groq = {
        status: "unhealthy",
        error: error.message,
      };
    }
  }

  // Overall status - at least one provider must be healthy
  const allUnhealthy =
    health.providers.gemini.status === "unhealthy" &&
    health.providers.openrouter.status === "unhealthy" &&
    health.providers.groq.status === "unhealthy";

  if (allUnhealthy) {
    health.status = "critical";
  } else if (
    health.providers.gemini.status === "unhealthy" &&
    health.providers.openrouter.status === "unhealthy"
  ) {
    health.status = "degraded";
  } else if (health.providers.gemini.status === "unhealthy") {
    health.status = "degraded";
  }

  return new Response(JSON.stringify(health, null, 2), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      ...corsHeaders(),
    },
  });
}

// ===========================
// Helper Functions
// ===========================
function parseQuestions(text) {
  const lines = text.split("\n").filter((line) => line.trim().length > 0);
  const questions = [];

  for (const line of lines) {
    const match = line.match(/^\d+[\.\)]\s*(.+)$/);
    if (match) {
      questions.push(match[1].trim());
    }
  }

  return questions.length > 0 ? questions : [text];
}

function parseBlueprintToJSON(blueprintText) {
  const lines = blueprintText.split("\n");
  const json = {};

  for (const line of lines) {
    const match = line.match(/^([^:]+):\s*(.+)$/);
    if (match) {
      const key = match[1]
        .trim()
        .toLowerCase()
        .replace(/\s+/g, "_")
        .replace(/[()]/g, "");
      const value = match[2].trim();
      json[key] = value;
    }
  }

  return json;
}

// ===========================
// CORS & Error Handling
// ===========================
function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Max-Age": "86400",
  };
}

function handleCORS() {
  return new Response(null, {
    status: 204,
    headers: corsHeaders(),
  });
}

function errorResponse(code, message, details = null) {
  return new Response(
    JSON.stringify({
      success: false,
      error: {
        code,
        message,
        details,
      },
    }),
    {
      status: code === "INVALID_REQUEST" ? 400 : 500,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders(),
      },
    },
  );
}
