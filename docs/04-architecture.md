# 04 — System Architecture

**Product:** CONTEXTOR  
**Version:** 1.3.1  
**Last Updated:** 30 Nov 2025

---

## 1. Architecture Overview

### System Type

- **Architecture:** Serverless, stateless JAMstack application
- **Deployment:** Cloudflare ecosystem (Pages + Workers)
- **Design Pattern:** API-first, event-driven
- **State Management:** Client-side only (localStorage)

### Core Principles

1. **Stateless:** No database, no server-side sessions
2. **Serverless:** Auto-scaling via Cloudflare Workers
3. **Multi-Provider:** 3 AI providers with smart fallback
4. **Free-First:** 100% free tier infrastructure
5. **Copy-Paste Workflow:** No persistent user data

---

## 2. High-Level Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        USER BROWSER                              │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │         Cloudflare Pages (Frontend)                        │  │
│  │  • Vanilla JavaScript (no frameworks)                      │  │
│  │  • JetBrains Mono typography                               │  │
│  │  • Emoji-driven UI (✍️🎨🎬🎵)                               │  │
│  │  • localStorage (output history)                           │  │
│  │  • Provider/Model selection UI                             │  │
│  └─────────────────────┬─────────────────────────────────────┘  │
└───────────────────────┼────────────────────────────────────────┘
                        │ HTTPS/JSON
                        ▼
┌─────────────────────────────────────────────────────────────────┐
│           Cloudflare Workers (Backend API)                       │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │  Worker: /api/generate                                     │  │
│  │  • Route by mode (text/image/video/music)                  │  │
│  │  • Route by subMode (default/modeA/cot/pot/tree/react)     │  │
│  │  • Mode A: clarify → distill logic                         │  │
│  │  • Multi-provider fallback strategy                        │  │
│  │  • Auto-retry with exponential backoff                     │  │
│  │  • Timeout handling (30-45s)                               │  │
│  │  • Input validation & sanitization                         │  │
│  └─────────────────────┬─────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │  Worker: /api/health                                       │  │
│  │  • Check Gemini, Groq, OpenRouter                          │  │
│  │  • Measure latency                                         │  │
│  │  • Return health status                                    │  │
│  └───────────────────────────────────────────────────────────┘  │
└─────────────────────┬───────────────────┬───────────────────────┘
                      │                   │
        ┌─────────────▼──────┐   ┌────────▼────────┐
        │   Primary Route    │   │  Fallback Route  │
        └─────────────┬──────┘   └────────┬────────┘
                      │                   │
        ┌─────────────▼──────────────────▼─────────────────┐
        │         AI Provider Selection Logic               │
        │  • User-selected provider (Gemini/Groq/OpenRouter)│
        │  • Automatic fallback if primary fails            │
        │  • Retry with exponential backoff                 │
        │  • Circuit breaker pattern (planned)              │
        └─────┬──────────────┬──────────────┬──────────────┘
              │              │              │
      ┌───────▼───────┐ ┌───▼──────┐ ┌────▼──────────┐
      │  Google       │ │  Groq    │ │  OpenRouter   │
      │  Gemini       │ │  API     │ │  API          │
      │               │ │          │ │               │
      │ gemini-2.5    │ │ kimi-k2  │ │ glm-4.5-air   │
      │ -flash        │ │ llama-4  │ │ :free         │
      │               │ │ gpt-oss  │ │               │
      │ 65K tokens    │ │ 8K tokens│ │ 4K tokens     │
      │ 1500 req/day  │ │ 14.4K/day│ │ Free models   │
      └───────────────┘ └──────────┘ └───────────────┘
```

---

## 3. Component Architecture

### 3.1 Frontend (Cloudflare Pages)

**Technology:**
- Vanilla JavaScript (no build step)
- HTML5 + CSS3
- localStorage API
- Clipboard API

**Key Components:**

```javascript
// State Management
const state = {
  currentMode: "text",              // text|image|video|music
  currentSubMode: "default",         // default|modeA|cot|pot|tree|react
  currentOutput: null,               // Generated output
  modeAStage: null,                  // clarify|distill (Mode A only)
  modeAQuestions: [],                // Questions from clarify
  modeAOriginalInput: "",            // Original request
  selectedProvider: "gemini",        // gemini|groq|openrouter
  selectedModel: null,               // Provider-specific model
  healthStatus: null,                // Provider health info
}
```

**Files:**
- `public/index.html` - Main UI structure
- `public/app.js` - Application logic (1200+ lines)
- `public/styles.css` - Styling (800+ lines)

**Key Functions:**
- `handleGenerate()` - Main generation handler
- `handleModeA()` - Mode A flow controller
- `modeAClarify()` - Stage 1: Get questions
- `modeADistill()` - Stage 2: Synthesize context
- `displayQuestions()` - Enhanced prompt formatter
- `parseAnswers()` - Answer extraction logic
- `callAPI()` - Unified API caller
- `fetchWithTimeout()` - Timeout wrapper
- `showError()` - Error display
- `copyToClipboard()` - Copy handler

---

### 3.2 Backend (Cloudflare Workers)

**Technology:**
- Cloudflare Workers runtime
- Service Worker API
- Fetch API
- Environment variables (secrets)

**File:**
- `worker/index.js` - Main worker logic (1100+ lines)

**Key Functions:**

```javascript
// Request Handling
async function handleRequest(request, env)
  └─> validateRequest(body)
      ├─> processTextMode(body, env)
      │   ├─> processModeAClarify(body, env)
      │   ├─> processModeADistill(body, env)
      │   └─> processModeB(body, env)
      ├─> processImageMode(body, env)
      ├─> processVideoMode(body, env)
      └─> processMusicMode(body, env)

// AI Provider Layer
async function callAIWithFallback(systemPrompt, userPrompt, env, options)
  ├─> callGemini(systemPrompt, userPrompt, env, options)
  ├─> callGroq(systemPrompt, userPrompt, env, options)
  └─> callOpenRouter(systemPrompt, userPrompt, env, options)

// Utility Layer
async function fetchWithRetry(fn, maxRetries)
async function fetchWithTimeout(fn, timeout)
async function handleHealthCheck(env)
```

**Environment Variables:**
```bash
GEMINI_API_KEY         # Required
GROQ_API_KEY           # Optional (recommended)
OPENROUTER_API_KEY     # Optional (fallback)
```

---

### 3.3 AI Provider Integration

#### Gemini 2.5 Flash (Primary)

**Endpoint:**
```
https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent
```

**Request Format:**
```json
{
  "contents": [{
    "parts": [{"text": "prompt"}]
  }],
  "generationConfig": {
    "temperature": 0.7,
    "maxOutputTokens": 2048,
    "topP": 0.95,
    "topK": 40
  },
  "safetySettings": [
    {"category": "HARM_CATEGORY_*", "threshold": "BLOCK_NONE"}
  ]
}
```

**Limits:**
- 1,500 requests/day
- 15 requests/minute
- 65,535 tokens output max
- Free tier: Yes

---

#### Groq (Fast Alternative)

**Endpoint:**
```
https://api.groq.com/openai/v1/chat/completions
```

**Request Format:**
```json
{
  "model": "moonshotai/kimi-k2-instruct",
  "messages": [
    {"role": "system", "content": "system prompt"},
    {"role": "user", "content": "user prompt"}
  ],
  "temperature": 0.7,
  "max_tokens": 2048
}
```

**Available Models:**
- `moonshotai/kimi-k2-instruct` (balanced)
- `meta-llama/llama-4-maverick-17b-128e-instruct` (fast)
- `openai/gpt-oss-120b` (comprehensive)

**Limits:**
- 14,400 requests/day
- 8,192 tokens output max
- Ultra-fast inference (<1s)
- Free tier: Yes

---

#### OpenRouter (Fallback)

**Endpoint:**
```
https://openrouter.ai/api/v1/chat/completions
```

**Request Format:**
```json
{
  "model": "z-ai/glm-4.5-air:free",
  "messages": [
    {"role": "system", "content": "system prompt"},
    {"role": "user", "content": "user prompt"}
  ],
  "temperature": 0.7,
  "max_tokens": 2048
}
```

**Default Model:**
- `z-ai/glm-4.5-air:free`

**Limits:**
- Varies by model
- Free models available
- 4,096 tokens typical
- Free tier: Yes

---

## 4. Data Flow Diagrams

### 4.1 Default Text Mode Flow

```
User Input (3000 chars max)
    ↓
Frontend Validation
    ↓
POST /api/generate
    {
      mode: "text",
      subMode: "default",
      input: "...",
      provider: "gemini",
      model: null
    }
    ↓
Worker: processTextMode()
    ↓
Worker: callAIWithFallback()
    ├─> Try Gemini (primary)
    │   ├─ Success → Return
    │   └─ Fail → Retry (3x)
    ├─> Try Groq (fallback)
    │   ├─ Success → Return
    │   └─ Fail → Retry (1x)
    └─> Try OpenRouter (last resort)
        ├─ Success → Return
        └─ Fail → Error
    ↓
Response
    {
      success: true,
      output: "...",
      provider: "gemini",
      model: "gemini-2.5-flash"
    }
    ↓
Frontend Display + Copy Button
```

---

### 4.2 Mode A (Clarify & Distill) Flow

```
┌─────────────────────────────────────────────┐
│ STAGE 1: CLARIFY                             │
└─────────────────────────────────────────────┘

User Input: "Build a YouTube research tool"
    ↓
POST /api/generate
    {
      mode: "text",
      subMode: "modeA",
      stage: "clarify",
      input: "Build a YouTube research tool",
      provider: "gemini"
    }
    ↓
Worker: processModeAClarify()
    ├─ System Prompt: "Generate 10-15 questions..."
    └─ AI generates comprehensive questions
    ↓
Response
    {
      success: true,
      questions: [
        "What is your target audience?",
        "What specific data points...",
        "How will users authenticate...",
        ... (10-15 total)
      ]
    }
    ↓
Frontend: displayQuestions()
    └─ Build enhanced prompt:
       ORIGINAL REQUEST:
       "Build a YouTube research tool"
       
       TASK: Create comprehensive brief...
       
       📋 CLARIFYING QUESTIONS:
       1. What is your target audience?
          Answer: 
       2. What specific data points...
          Answer: 
       ...

┌─────────────────────────────────────────────┐
│ STAGE 2: DISTILL                             │
└─────────────────────────────────────────────┘

User fills answers in input box
    ↓
Frontend: parseAnswers()
    └─ Extract answers using regex + fallback
    ↓
POST /api/generate
    {
      mode: "text",
      subMode: "modeA",
      stage: "distill",
      input: "Build a YouTube research tool",  // Original!
      questions: [...],
      answers: [...],
      provider: "gemini"
    }
    ↓
Worker: processModeADistill()
    ├─ Build context:
    │  ORIGINAL REQUEST: "..."
    │  QUESTIONS & ANSWERS:
    │  Q1: ... A1: ...
    │  Q2: ... A2: ...
    │  ...
    └─ AI synthesizes comprehensive brief
    ↓
Response
    {
      success: true,
      output: "Comprehensive context brief...",
      provider: "gemini"
    }
    ↓
Frontend: Display final brief
```

---

### 4.3 Health Check Flow

```
GET /api/health
    ↓
Worker: handleHealthCheck()
    ├─ Test Gemini
    │  ├─ Send simple prompt
    │  ├─ Measure latency
    │  └─ Return status
    ├─ Test Groq
    │  ├─ Send simple prompt
    │  ├─ Measure latency
    │  └─ Return status
    └─ Test OpenRouter
       ├─ Send simple prompt
       ├─ Measure latency
       └─ Return status
    ↓
Response
    {
      status: "healthy",
      timestamp: "2025-11-30T...",
      providers: {
        gemini: {
          status: "healthy",
          latency: 1234
        },
        groq: {
          status: "healthy",
          latency: 567
        },
        openrouter: {
          status: "healthy",
          latency: 2345
        }
      }
    }
```

---

## 5. Error Handling Strategy

### 5.1 Error Classification

```javascript
// Network Errors
- Timeout (30-45s)
- Connection refused
- DNS failure
→ Action: Retry with backoff, then fallback provider

// API Errors
- 400 Bad Request (invalid input)
- 401 Unauthorized (API key issue)
- 429 Too Many Requests (rate limit)
- 500 Internal Server Error
→ Action: Parse error, show user-friendly message

// AI Provider Errors
- MAX_TOKENS (response truncated)
- SAFETY (content blocked)
- RECITATION (copyright issue)
→ Action: Extract partial response or fallback

// Application Errors
- Invalid mode/subMode
- Missing required fields
- Parse failure (Mode A answers)
→ Action: Show specific guidance
```

### 5.2 Retry Strategy

```javascript
async function fetchWithRetry(fn, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      // Don't retry on these
      if (error.status === 400) throw error; // Bad input
      if (error.status === 429) throw error; // Rate limit
      
      // Exponential backoff
      if (i < maxRetries - 1) {
        await sleep(Math.pow(2, i) * 1000); // 1s, 2s, 4s
      }
    }
  }
  throw new Error("Max retries exceeded");
}
```

### 5.3 Fallback Logic

```javascript
// Priority order
1. User-selected provider
   ├─ Retry 3 times with backoff
   └─ If fails → go to step 2

2. Alternative provider 1
   ├─ Retry 1 time
   └─ If fails → go to step 3

3. Alternative provider 2
   ├─ Retry 1 time
   └─ If fails → show error

// Example: User selects Groq
Groq (3 retries)
  → OpenRouter (1 retry)
    → Gemini (1 retry)
      → Error message
```

---

## 6. Security Architecture

### 6.1 Authentication & Authorization

**No User Authentication:**
- No user accounts
- No login system
- No API keys from users

**API Key Management:**
- Server-side only (Cloudflare secrets)
- Never exposed to frontend
- Rotated periodically

### 6.2 Input Validation

```javascript
function validateRequest(body) {
  // Mode validation
  const validModes = ["text", "image", "video", "music"];
  if (!validModes.includes(mode)) {
    return error("Invalid mode");
  }
  
  // Length validation
  const limits = {
    text: { default: 3000, modeA: 2000, modeB: 2500 },
    image: 3000,
    video: 3000,
    music: 3000
  };
  
  if (input.length > limit) {
    return error("Input too long");
  }
  
  // Sanitization
  input = input.replace(/\0/g, ""); // Remove null bytes
  input = input.replace(/\n{4,}/g, "\n\n\n"); // Limit newlines
  
  return { valid: true };
}
```

### 6.3 CORS Configuration

```javascript
// Allow frontend origin only
const corsHeaders = {
  "Access-Control-Allow-Origin": "https://contextor.pages.dev",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Max-Age": "86400"
};
```

### 6.4 Rate Limiting

**Strategy:**
- Rely on Cloudflare Workers free tier limits
- API provider rate limits handle abuse
- No custom rate limiting needed (stateless)

---

## 7. Performance Optimization

### 7.1 Current Optimizations

**Frontend:**
- No build step (instant deploy)
- Minimal JavaScript (vanilla, no frameworks)
- No external dependencies
- localStorage for history (fast)
- Debounced input validation

**Backend:**
- Cloudflare Workers edge compute
- Auto-scaling (no cold starts)
- Minimal dependencies
- Efficient prompt construction
- Smart timeout values

### 7.2 Caching Strategy (Planned)

```javascript
// Cloudflare KV for response caching
async function callAIWithCaching(systemPrompt, userPrompt, env) {
  const cacheKey = hashInput(systemPrompt + userPrompt);
  
  // Check cache
  const cached = await env.CACHE.get(cacheKey, "json");
  if (cached) return { ...cached, fromCache: true };
  
  // Call AI
  const result = await callAI(systemPrompt, userPrompt, env);
  
  // Store in cache (5min TTL)
  await env.CACHE.put(cacheKey, JSON.stringify(result), {
    expirationTtl: 300
  });
  
  return { ...result, fromCache: false };
}
```

### 7.3 Performance Targets

| Metric | Target | Current (v1.3.1) |
|--------|--------|------------------|
| Text generation | <5s | ✅ 2-4s |
| Image blueprint | <5s | ✅ 3-4s |
| Video blueprint | <6s | ✅ 4-5s |
| Music blueprint | <5s | ✅ 3-4s |
| Mode A clarify | <4s | ✅ 2-3s |
| Mode A distill | <8s | ✅ 5-7s |
| Health check | <5s | ✅ 2-3s |

---

## 8. Monitoring & Observability

### 8.1 Health Check Endpoint

**URL:** `https://contextor-api.workers.dev/api/health`

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2025-11-30T12:34:56.789Z",
  "providers": {
    "gemini": {
      "status": "healthy",
      "latency": 1234
    },
    "groq": {
      "status": "healthy",
      "latency": 567
    },
    "openrouter": {
      "status": "healthy",
      "latency": 2345
    }
  }
}
```

### 8.2 Cloudflare Analytics

**Available Metrics:**
- Request count
- Response time (P50, P95, P99)
- Error rate
- Bandwidth usage
- Geographic distribution

**Dashboard:** Cloudflare Workers Analytics

### 8.3 Console Logging

```javascript
// Structured logging
console.log(`Mode A Clarify - input: ${input.length} chars`);
console.log(`Gemini request - maxTokens: ${maxTokens}`);
console.log(`Fallback triggered: ${preferredProvider} → ${fallbackProvider}`);
console.error(`API error: ${error.status} - ${error.message}`);
```

---

## 9. Deployment Architecture

### 9.1 Deployment Pipeline

```
Local Development
    ├─ npm run dev (Pages)
    └─ npm run dev:worker (Worker)
    ↓
Git Commit
    ↓
GitHub Repository
    ↓
Manual Deployment
    ├─ npm run deploy:pages
    │  └─> Cloudflare Pages
    └─ npm run deploy:worker
       └─> Cloudflare Workers
    ↓
Production Environment
    ├─ Pages: https://contextor.pages.dev
    └─ Worker: https://contextor-api.*.workers.dev
```

### 9.2 Environment Configuration

**Development (.dev.vars):**
```bash
GEMINI_API_KEY=AIza...
GROQ_API_KEY=gsk_...
OPENROUTER_API_KEY=sk-or-v1-...
```

**Production (Wrangler Secrets):**
```bash
wrangler secret put GEMINI_API_KEY
wrangler secret put GROQ_API_KEY
wrangler secret put OPENROUTER_API_KEY
```

### 9.3 Rollback Strategy

**Worker Rollback:**
```bash
wrangler deployments list
wrangler rollback [DEPLOYMENT_ID]
```

**Pages Rollback:**
- Cloudflare Dashboard
- Workers & Pages → contextor → Deployments
- Select previous deployment → Rollback

---

## 10. Scalability Considerations

### 10.1 Current Limits

**Cloudflare Workers (Free Tier):**
- 100,000 requests/day
- 10ms CPU time/request
- 128MB memory
- No cold starts

**Cloudflare Pages (Free Tier):**
- Unlimited requests
- 500 builds/month
- 25MB file size limit

**API Providers:**
- Gemini: 1,500 requests/day
- Groq: 14,400 requests/day
- OpenRouter: Varies by model

### 10.2 Scaling Strategy

**Horizontal Scaling:**
- Cloudflare auto-scales (handled automatically)
- No manual intervention needed

**Vertical Scaling:**
- Not applicable (serverless)

**Cost Scaling:**
- Stay on free tier as long as possible
- Upgrade to paid if needed:
  - Workers Paid: $5/month + $0.50/million requests
  - Gemini Paid: Available if free tier exhausted

### 10.3 Load Distribution

```
User Request
    ↓
Cloudflare Global Network (200+ cities)
    ├─ Nearest edge location serves request
    ├─ Worker executes at edge
    └─ AI provider requests from edge
```

---

## 11. Disaster Recovery

### 11.1 Backup Strategy

**Code:**
- Git repository (GitHub)
- Multiple local clones

**No Data to Backup:**
- Stateless design
- No database
- No user data

### 11.2 Recovery Procedures

**Worker Failure:**
1. Check Cloudflare status page
2. Review recent deployments
3. Rollback to last known good deployment
4. Check API provider status

**API Provider Outage:**
1. Automatic fallback to alternative provider
2. Check provider status pages:
   - Gemini: https://status.cloud.google.com
   - Groq: https://status.groq.com
   - OpenRouter: https://openrouter.ai/status
3. Wait for recovery (auto-retry handles it)

**Pages Deployment Failure:**
1. Check build logs
2. Fix syntax/configuration errors
3. Redeploy

---

## 12. Future Architecture Enhancements

### Phase 1: Caching Layer
- Cloudflare KV for response caching
- 30-50% API call reduction
- 5-minute TTL

### Phase 2: Circuit Breaker
- Prevent cascading failures
- Fast-fail on known outages
- Auto-recovery

### Phase 3: Request Deduplication
- Prevent duplicate concurrent requests
- In-memory request tracking
- Reduce unnecessary API calls

### Phase 4: Streaming Responses
- Server-sent events (SSE)
- Real-time output streaming
- Better UX for long responses

### Phase 5: Analytics
- Custom metrics collection
- User behavior tracking (anonymous)
- A/B testing framework

---

## Appendix: Configuration Files

### wrangler.toml
```toml
name = "contextor-api"
main = "worker/index.js"
compatibility_date = "2024-01-01"

[vars]
ENVIRONMENT = "production"
```

### package.json
```json
{
  "name": "contextor",
  "version": "1.3.1",
  "scripts": {
    "dev": "wrangler pages dev public",
    "dev:worker": "wrangler dev",
    "deploy": "npm run deploy:pages && npm run deploy:worker",
    "deploy:pages": "wrangler pages deploy public",
    "deploy:worker": "wrangler deploy"
  }
}
```

---

**Architecture Status:** ✅ Production-Ready (v1.3.1)  
**Total Infrastructure Cost:** $0/month  
**Auto-Scaling:** Yes (Cloudflare)  
**High Availability:** Yes (Global edge network)