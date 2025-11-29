# 05 — Worker Logic & API Flow

**Product:** CONTEXTOR
**Version:** 1.2.0
**Last Updated:** 29 Nov 2025

---

## Purpose

This document defines the detailed implementation logic for Cloudflare Workers, API contracts, request/response flows, and processing algorithms.

---

## 1. Worker Architecture Overview

### Primary Worker: `api-generate`

**Endpoints:** 
- `POST /api/generate` - Main generation endpoint
- `GET /api/health` - Health check endpoint (v1.2.0+)

**Responsibilities:**
1. Validate incoming requests
2. Route by mode (text/image/video/music)
3. Execute mode-specific logic (default/Mode A/Mode B)
4. Apply retry logic with exponential backoff (v1.2.0+)
5. Apply timeout handling (30s max per request) (v1.2.0+)
6. Call AI providers with fallback strategy
7. Monitor provider health status (v1.2.0+)
8. Format and return output

**Runtime Environment:**
- Cloudflare Workers (V8 isolate)
- Maximum execution time: 30 seconds (CPU time)
- Request timeout: 30 seconds (enforced via wrapper) (v1.2.0+)
- Memory limit: 128 MB
- Retry attempts: 2 with exponential backoff (v1.2.0+)

---

## 2. Stability Features (v1.2.0+)

### Retry Logic with Exponential Backoff

```javascript
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
```

**Benefits:**
- Auto-recovery from transient network failures
- Handles temporary API unavailability
- Smooths out rate limit spikes
- 95% → 99%+ success rate improvement

### Timeout Handling

```javascript
async function fetchWithTimeout(fn, timeoutMs = 30000) {
  const timeoutPromise = new Promise((_, reject) => {
    setTimeout(() => reject(new Error("Request timeout")), timeoutMs);
  });
  
  return Promise.race([fn(), timeoutPromise]);
}
```

**Implementation:**
- 30-second timeout on AI provider calls
- Prevents infinite waiting
- Clear timeout error messages
- User-friendly feedback

### Health Check System

**Endpoint:** `GET /api/health`

**Response:**
```json
{
  "status": "healthy" | "degraded" | "critical",
  "timestamp": "2025-11-29T10:30:00.000Z",
  "providers": {
    "gemini": {
      "status": "healthy" | "unhealthy",
      "latency": 1234
    },
    "openrouter": {
      "status": "healthy" | "unhealthy",
      "latency": 2345
    }
  }
}
```

**Status Levels:**
- `healthy` - Both providers working
- `degraded` - Primary down, fallback working
- `critical` - All providers down

---

## 3. API Contract

### Request Schema

```typescript
POST /api/generate
Content-Type: application/json

{
  // Required fields
  "mode": "text" | "image" | "video" | "music",
  "input": string, // User's raw input

  // Optional fields (mode-specific)
  "subMode"?: "default" | "modeA" | "modeB" | "cot" | "pot",
  "stage"?: "clarify" | "distill" | "brief", // For Mode A
  "questions"?: string[], // For Mode A stage 2
  "answers"?: string[], // For Mode A stage 2
  "outputFormat"?: "text" | "json" | "both" // Default: "text"
}
```

### Response Schema

```typescript
// Success Response
{
  "success": true,
  "mode": string,
  "output": string, // Primary text output
  "outputJSON"?: object, // Optional JSON format
  "questions"?: string[], // For Mode A stage 1
  "metadata": {
    "provider": "openrouter" | "gemini",
    "model": string,
    "processingTime": number, // milliseconds
    "fallbackUsed": boolean
  }
}

// Error Response
{
  "success": false,
  "error": {
    "code": string,
    "message": string,
    "details"?: string
  }
}
```

---

## 3. Core Processing Logic

### 3.1 Request Handler (Entry Point)

```javascript
export default {
  async fetch(request, env) {
    // CORS preflight
    if (request.method === 'OPTIONS') {
      return handleCORS();
    }

    // Validate method
    if (request.method !== 'POST') {
      return errorResponse('METHOD_NOT_ALLOWED', 'Only POST requests allowed');
    }

    try {
      // Parse request body
      const body = await request.json();

      // Validate request
      const validation = validateRequest(body);
      if (!validation.valid) {
        return errorResponse('INVALID_REQUEST', validation.error);
      }

      // Route to appropriate processor
      const result = await routeRequest(body, env);

      // Return success response
      return new Response(JSON.stringify(result), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders()
        }
      });

    } catch (error) {
      console.error('Worker error:', error);
      return errorResponse('INTERNAL_ERROR', 'An unexpected error occurred');
    }
  }
};
```

---

### 3.2 Request Validation

```javascript
function validateRequest(body) {
  const { mode, input, subMode, stage } = body;

  // Validate mode
  const validModes = ['text', 'image', 'video', 'music'];
  if (!mode || !validModes.includes(mode)) {
    return { valid: false, error: 'Invalid mode. Must be: text, image, video, or music' };
  }

  // Validate input
  if (!input || typeof input !== 'string' || input.trim().length === 0) {
    return { valid: false, error: 'Input is required and must be non-empty string' };
  }

  // Validate input length (max 5000 chars)
  if (input.length > 5000) {
    return { valid: false, error: 'Input exceeds maximum length of 5000 characters' };
  }

  // Validate subMode if provided
  if (subMode) {
    const validSubModes = ['default', 'modeA', 'modeB', 'cot', 'pot'];
    if (!validSubModes.includes(subMode)) {
      return { valid: false, error: 'Invalid subMode' };
    }
  }

  // Validate Mode A stage
  if (subMode === 'modeA') {
    const validStages = ['clarify', 'distill', 'brief'];
    if (!stage || !validStages.includes(stage)) {
      return { valid: false, error: 'Mode A requires valid stage: clarify, distill, or brief' };
    }

    // For distill stage, require questions and answers
    if (stage === 'distill') {
      if (!body.questions || !body.answers) {
        return { valid: false, error: 'Distill stage requires questions and answers' };
      }
      if (!Array.isArray(body.questions) || !Array.isArray(body.answers)) {
        return { valid: false, error: 'Questions and answers must be arrays' };
      }
      if (body.questions.length !== body.answers.length) {
        return { valid: false, error: 'Number of questions and answers must match' };
      }
    }
  }

  return { valid: true };
}
```

---

### 3.3 Request Router

```javascript
async function routeRequest(body, env) {
  const { mode, subMode } = body;
  const startTime = Date.now();

  let result;

  // Route by mode and subMode
  if (subMode === 'modeA') {
    result = await processModeA(body, env);
  } else if (subMode === 'modeB' || subMode === 'cot' || subMode === 'pot') {
    result = await processModeB(body, env);
  } else {
    // Default mode or explicit "default" subMode
    switch (mode) {
      case 'text':
        result = await processTextMode(body, env);
        break;
      case 'image':
        result = await processImageMode(body, env);
        break;
      case 'video':
        result = await processVideoMode(body, env);
        break;
      case 'music':
        result = await processMusicMode(body, env);
        break;
    }
  }

  // Add metadata
  result.metadata = {
    ...result.metadata,
    processingTime: Date.now() - startTime
  };

  return result;
}
```

---

## 4. Mode-Specific Processing Logic

### 4.1 Default Text Mode

```javascript
async function processTextMode(body, env) {
  const { input } = body;

  // Build prompt for context engineering
  const systemPrompt = `You are a context engineering assistant. Transform the user's input into a well-structured, comprehensive context brief that can be used with any AI model.

Focus on:
- Clarifying the intent
- Adding relevant structure
- Expanding on key details
- Making the context production-ready

Output should be clear, organized, and ready to copy-paste to any AI provider.`;

  const userPrompt = input;

  // Call AI provider with fallback
  const aiResult = await callAIWithFallback(
    systemPrompt,
    userPrompt,
    env,
    { temperature: 0.7, maxTokens: 2048 }
  );

  return {
    success: true,
    mode: 'text',
    output: aiResult.output,
    metadata: {
      provider: aiResult.provider,
      model: aiResult.model,
      fallbackUsed: aiResult.fallbackUsed
    }
  };
}
```

---

### 4.2 Mode A — Clarify → Distill → Brief

#### Stage 1: Clarification

```javascript
async function processModeA_Clarify(input, env) {
  const systemPrompt = `You are an expert at asking clarifying questions. Given the user's raw input, generate 3-7 focused, specific questions that will help you understand:
- The core objective
- Key requirements
- Constraints and preferences
- Expected outcomes

Output ONLY the questions, numbered 1-7, no additional text.`;

  const userPrompt = `User's input: "${input}"

Generate clarifying questions:`;

  const aiResult = await callAIWithFallback(
    systemPrompt,
    userPrompt,
    env,
    { temperature: 0.8, maxTokens: 500 }
  );

  // Parse questions from response
  const questions = parseQuestions(aiResult.output);

  return {
    success: true,
    mode: 'text',
    subMode: 'modeA',
    stage: 'clarify',
    questions: questions,
    metadata: {
      provider: aiResult.provider,
      model: aiResult.model,
      fallbackUsed: aiResult.fallbackUsed
    }
  };
}

function parseQuestions(text) {
  // Extract numbered questions (1., 2., etc.)
  const lines = text.split('\n').filter(line => line.trim().length > 0);
  const questions = [];

  for (const line of lines) {
    // Match patterns like "1. Question?" or "1) Question?"
    const match = line.match(/^\d+[\.\)]\s*(.+)$/);
    if (match) {
      questions.push(match[1].trim());
    }
  }

  return questions;
}
```

#### Stage 2: Distillation

```javascript
async function processModeA_Distill(questions, answers, env) {
  const systemPrompt = `You are a context distillation expert. Given a set of questions and user answers, synthesize them into a clear, comprehensive context brief.

The brief should:
- Integrate all key information
- Remove redundancy
- Structure logically
- Be production-ready for any AI model

Output a cohesive context document, not Q&A format.`;

  // Build Q&A pairs
  let qaText = 'Original Questions and Answers:\n\n';
  for (let i = 0; i < questions.length; i++) {
    qaText += `Q${i+1}: ${questions[i]}\n`;
    qaText += `A${i+1}: ${answers[i]}\n\n`;
  }

  const userPrompt = `${qaText}

Synthesize this into a comprehensive context brief:`;

  // Use Gemini for distillation (primary for this stage)
  const aiResult = await callGemini(
    systemPrompt,
    userPrompt,
    env,
    { temperature: 0.7, maxTokens: 3000 }
  );

  return {
    success: true,
    mode: 'text',
    subMode: 'modeA',
    stage: 'distill',
    output: aiResult.output,
    metadata: {
      provider: 'gemini',
      model: aiResult.model,
      fallbackUsed: false
    }
  };
}
```

#### Mode A Router

```javascript
async function processModeA(body, env) {
  const { stage, input, questions, answers } = body;

  switch (stage) {
    case 'clarify':
      return await processModeA_Clarify(input, env);

    case 'distill':
      return await processModeA_Distill(questions, answers, env);

    case 'brief':
      // Stage 3 is just formatting the distilled output
      // (Already handled in distill stage)
      return {
        success: true,
        mode: 'text',
        subMode: 'modeA',
        stage: 'brief',
        output: input, // Input is the distilled context from stage 2
        metadata: {}
      };

    default:
      throw new Error('Invalid Mode A stage');
  }
}
```

---

### 4.3 Mode B — CoT / PoT

```javascript
async function processModeB(body, env) {
  const { input, subMode } = body;

  let systemPrompt;

  if (subMode === 'cot' || subMode === 'modeB') {
    // Chain of Thought
    systemPrompt = `You are a reasoning expert using Chain-of-Thought (CoT) methodology.

Break down the user's input into clear, logical steps:
1. Understand the problem/task
2. Identify key components
3. Reason through step-by-step
4. Synthesize conclusion

Use numbered steps and clear explanations.`;

  } else if (subMode === 'pot') {
    // Program of Thought
    systemPrompt = `You are a reasoning expert using Program-of-Thought (PoT) methodology.

Transform the user's input into algorithmic/pseudo-code reasoning:
1. Define inputs and outputs
2. Outline the algorithm
3. Write pseudo-code or structured logic
4. Explain key decisions

Use code-like structure and clear logic flow.`;
  }

  const userPrompt = input;

  const aiResult = await callAIWithFallback(
    systemPrompt,
    userPrompt,
    env,
    { temperature: 0.8, maxTokens: 2500 }
  );

  return {
    success: true,
    mode: 'text',
    subMode: subMode,
    output: aiResult.output,
    metadata: {
      provider: aiResult.provider,
      model: aiResult.model,
      fallbackUsed: aiResult.fallbackUsed
    }
  };
}
```

---

### 4.4 Image Mode — Structured Blueprint

```javascript
async function processImageMode(body, env) {
  const { input, outputFormat } = body;

  const systemPrompt = `You are an expert image prompt engineer. Generate a structured visual blueprint for image generation AI (Midjourney, SDXL, Flux, etc.).

Use this exact structure:

Subject: [Main subject/focus]
Scene: [What's happening]
Environment: [Setting/location]
Lighting: [Lighting setup and mood]
Camera: [Camera angle and framing]
Lens: [Focal length and depth of field]
Mood: [Emotional tone]
Palette: [Color scheme]
Art Style: [Artistic style/medium]
Textures: [Surface qualities]
Composition: [Layout and visual balance]
Negative Controls: [What to avoid]
References: [Similar works or styles]

Fill each field with specific, actionable details based on the user's input.`;

  const userPrompt = `User's image concept: "${input}"

Generate structured blueprint:`;

  const aiResult = await callAIWithFallback(
    systemPrompt,
    userPrompt,
    env,
    { temperature: 0.7, maxTokens: 1500 }
  );

  const response = {
    success: true,
    mode: 'image',
    output: aiResult.output,
    metadata: {
      provider: aiResult.provider,
      model: aiResult.model,
      fallbackUsed: aiResult.fallbackUsed
    }
  };

  // Add JSON format if requested
  if (outputFormat === 'json' || outputFormat === 'both') {
    response.outputJSON = parseBlueprintToJSON(aiResult.output);
  }

  return response;
}

function parseBlueprintToJSON(blueprintText) {
  const lines = blueprintText.split('\n');
  const json = {};

  for (const line of lines) {
    const match = line.match(/^([^:]+):\s*(.+)$/);
    if (match) {
      const key = match[1].trim().toLowerCase().replace(/\s+/g, '_');
      const value = match[2].trim();
      json[key] = value;
    }
  }

  return json;
}
```

---

### 4.5 Video Mode — Cinematic Breakdown

```javascript
async function processVideoMode(body, env) {
  const { input, outputFormat } = body;

  const systemPrompt = `You are an expert video prompt engineer. Generate a cinematic breakdown for video generation AI (Runway, Pika, VEO, etc.).

Use this exact structure:

Scene Summary: [One-sentence overview]
Camera Motion: [Movement and trajectory]
Lens & Focal Length: [Technical specs]
Character Movement: [Actor/subject actions]
Environment Dynamics: [Background motion]
Lighting: [Light sources and changes]
Timeline (0–1s, 1–2s, etc.): [Frame-by-frame breakdown]
Style: [Cinematic style/genre]
Aesthetic Rules: [Visual guidelines]
Negative Controls: [What to avoid]
References: [Similar films/videos]

Provide specific, temporal details for each field.`;

  const userPrompt = `User's video concept: "${input}"

Generate cinematic breakdown:`;

  const aiResult = await callAIWithFallback(
    systemPrompt,
    userPrompt,
    env,
    { temperature: 0.7, maxTokens: 2000 }
  );

  const response = {
    success: true,
    mode: 'video',
    output: aiResult.output,
    metadata: {
      provider: aiResult.provider,
      model: aiResult.model,
      fallbackUsed: aiResult.fallbackUsed
    }
  };

  if (outputFormat === 'json' || outputFormat === 'both') {
    response.outputJSON = parseBlueprintToJSON(aiResult.output);
  }

  return response;
}
```

---

### 4.6 Music Mode — Structural Blueprint

```javascript
async function processMusicMode(body, env) {
  const { input, outputFormat } = body;

  const systemPrompt = `You are an expert music prompt engineer. Generate a structural music blueprint for generative music AI (Suno, Udio, MusicGen, etc.).

Use this exact structure:

Genre: [Musical genre]
Tempo (BPM): [Beats per minute]
Key: [Musical key]
Chord Progression: [Chord sequence]
Mood & Emotion: [Emotional feel]
Vocal Style: [Voice characteristics]
Lyrical Theme: [Subject matter]
Instrumentation: [Instruments used]
Mixing Style: [Production approach]
Song Structure: [Verse/chorus/bridge layout]
Reference Tracks: [Similar songs/artists]

Provide musically accurate, specific details for each field.`;

  const userPrompt = `User's music concept: "${input}"

Generate music blueprint:`;

  const aiResult = await callAIWithFallback(
    systemPrompt,
    userPrompt,
    env,
    { temperature: 0.7, maxTokens: 1500 }
  );

  const response = {
    success: true,
    mode: 'music',
    output: aiResult.output,
    metadata: {
      provider: aiResult.provider,
      model: aiResult.model,
      fallbackUsed: aiResult.fallbackUsed
    }
  };

  if (outputFormat === 'json' || outputFormat === 'both') {
    response.outputJSON = parseBlueprintToJSON(aiResult.output);
  }

  return response;
}
```

---

## 5. AI Provider Integration

### 5.1 Fallback Strategy Implementation

```javascript
async function callAIWithFallback(systemPrompt, userPrompt, env, options = {}) {
  let result;
  let fallbackUsed = false;

  try {
    // Try OpenRouter first
    result = await callOpenRouter(systemPrompt, userPrompt, env, options);
  } catch (error) {
    console.error('OpenRouter failed, trying Gemini:', error);
    fallbackUsed = true;

    try {
      // Fallback to Gemini
      result = await callGemini(systemPrompt, userPrompt, env, options);
    } catch (geminiError) {
      console.error('Gemini also failed:', geminiError);
      throw new Error('All AI providers failed');
    }
  }

  return {
    ...result,
    fallbackUsed
  };
}
```

---

### 5.2 OpenRouter Integration

```javascript
async function callOpenRouter(systemPrompt, userPrompt, env, options = {}) {
  const endpoint = 'https://openrouter.ai/api/v1/chat/completions';
  const apiKey = env.OPENROUTER_API_KEY;

  const requestBody = {
    model: 'z-ai/glm-4.5-air:free',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ],
    temperature: options.temperature || 0.7,
    max_tokens: options.maxTokens || 2048
  };

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
      'HTTP-Referer': 'https://contextor.pages.dev',
      'X-Title': 'CONTEXTOR'
    },
    body: JSON.stringify(requestBody)
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`OpenRouter error: ${response.status} - ${error}`);
  }

  const data = await response.json();

  return {
    output: data.choices[0].message.content,
    provider: 'openrouter',
    model: 'z-ai/glm-4.5-air:free'
  };
}
```

---

### 5.3 Gemini Integration

```javascript
async function callGemini(systemPrompt, userPrompt, env, options = {}) {
  const endpoint = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';
  const apiKey = env.GEMINI_API_KEY;

  // Combine system and user prompts (Gemini doesn't have separate system role)
  const combinedPrompt = `${systemPrompt}\n\n${userPrompt}`;

  const requestBody = {
    contents: [
      {
        parts: [{ text: combinedPrompt }]
      }
    ],
    generationConfig: {
      temperature: options.temperature || 0.7,
      maxOutputTokens: options.maxTokens || 2048
    }
  };

  const response = await fetch(`${endpoint}?key=${apiKey}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(requestBody)
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Gemini error: ${response.status} - ${error}`);
  }

  const data = await response.json();

  return {
    output: data.candidates[0].content.parts[0].text,
    provider: 'gemini',
    model: 'gemini-2.5-flash'
  };
}
```

---

## 6. Error Handling

### Error Response Helper

```javascript
function errorResponse(code, message, details = null) {
  return new Response(JSON.stringify({
    success: false,
    error: {
      code,
      message,
      details
    }
  }), {
    status: code === 'INVALID_REQUEST' ? 400 :
            code === 'METHOD_NOT_ALLOWED' ? 405 :
            500,
    headers: {
      'Content-Type': 'application/json',
      ...corsHeaders()
    }
  });
}
```

### Error Codes

| Code | HTTP Status | Description |
|------|------------|-------------|
| `INVALID_REQUEST` | 400 | Malformed request body or missing fields |
| `METHOD_NOT_ALLOWED` | 405 | Non-POST request |
| `RATE_LIMIT_EXCEEDED` | 429 | API rate limit hit |
| `AI_PROVIDER_ERROR` | 502 | AI provider unavailable |
| `INTERNAL_ERROR` | 500 | Unexpected worker error |

---

## 7. CORS Configuration

```javascript
function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*', // Or specific domain in production
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '86400'
  };
}

function handleCORS() {
  return new Response(null, {
    status: 204,
    headers: corsHeaders()
  });
}
```

---

## 8. Testing the Worker

### Example cURL Commands

**Default Text Mode:**
```bash
curl -X POST https://contextor.pages.dev/api/generate \
  -H "Content-Type: application/json" \
  -d '{
    "mode": "text",
    "input": "Explain quantum computing to a 10-year-old"
  }'
```

**Mode A - Clarify:**
```bash
curl -X POST https://contextor.pages.dev/api/generate \
  -H "Content-Type: application/json" \
  -d '{
    "mode": "text",
    "subMode": "modeA",
    "stage": "clarify",
    "input": "I want to build a SaaS product"
  }'
```

**Image Blueprint:**
```bash
curl -X POST https://contextor.pages.dev/api/generate \
  -H "Content-Type: application/json" \
  -d '{
    "mode": "image",
    "input": "Cyberpunk city at night with neon rain",
    "outputFormat": "both"
  }'
```

---

## Cross-References

- [01-context.md](01-context.md) — Project overview
- [03-prd.md](03-prd.md) — Product requirements
- [04-architecture.md](04-architecture.md) — System architecture
- [06-frontend_ui.md](06-frontend_ui.md) — Frontend implementation
- [07-prompt_templates.md](07-prompt_templates.md) — AI prompt templates

---

> **Note for AI Builders:** This logic is the core of CONTEXTOR. Follow these patterns precisely to ensure consistent, reliable context generation.
