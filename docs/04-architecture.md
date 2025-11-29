# 04 — System Architecture

**Product:** CONTEXTOR
**Version:** 1.0
**Last Updated:** 29 Nov 2025

---

## Purpose

This document defines the system architecture, infrastructure components, and technical design patterns for CONTEXTOR.

---

## 1. Architecture Overview

### System Type

- **Architecture:** Serverless, stateless web application
- **Deployment:** Cloudflare ecosystem (Pages + Workers + AI Gateway)
- **Design Pattern:** JAMstack (JavaScript, APIs, Markup)

### Core Principles

1. **Stateless:** No database, no session storage
2. **Serverless:** Auto-scaling via Cloudflare Workers
3. **API-First:** All AI operations via external APIs
4. **Copy-Paste Workflow:** No persistent user data
5. **Free-Tier Focus:** No paid infrastructure dependencies

---

## 2. System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                         USER BROWSER                         │
│  ┌─────────────────────────────────────────────────────┐   │
│  │           Cloudflare Pages (Frontend)                │   │
│  │  - React/Vue/Vanilla JS                              │   │
│  │  - JetBrains Mono typography                         │   │
│  │  - Emoji-driven UI (✍️🎨🎬🎵)                         │   │
│  │  - Light mode only                                   │   │
│  └──────────────────┬──────────────────────────────────┘   │
└────────────────────┼──────────────────────────────────────┘
                      │ HTTPS
                      ▼
┌─────────────────────────────────────────────────────────────┐
│              Cloudflare Workers (Backend)                    │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Worker: /api/generate                               │   │
│  │  - Route requests by mode (text/image/video/music)   │   │
│  │  - Handle Mode A/B logic                             │   │
│  │  - Execute fallback strategy                         │   │
│  │  - Format output (text/JSON)                         │   │
│  └──────────────────┬──────────────────────────────────┘   │
└────────────────────┼──────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│           Cloudflare AI Gateway (API Router)                 │
│  - Caching layer                                             │
│  - Rate limiting                                             │
│  - Unified API interface                                     │
│  - Analytics and monitoring                                  │
└──────────────┬─────────────────────┬────────────────────────┘
               │                     │
       ┌───────▼────────┐   ┌───────▼────────┐
       │  Google Gemini │   │   OpenRouter   │
       │  (Primary AI)  │   │  (Fallback AI) │
       │                │   │                │
       │ Gemini 2.5     │   │ glm-4.5-air    │
       │ Flash          │   │ :free          │
       └────────────────┘   └────────────────┘
```

---

## 3. Component Architecture

### 3.1 Frontend (Cloudflare Pages)

**Technology Stack:**
- HTML5, CSS3, JavaScript (ES6+)
- Framework: React / Vue / Vanilla JS (TBD during implementation)
- Typography: JetBrains Mono (monospace)
- Styling: Minimal CSS, no frameworks

**Responsibilities:**
- Render emoji-driven UI
- Capture user input
- Display generated context briefs
- Handle copy-to-clipboard
- Send API requests to Workers
- Display loading states and errors

**Key Features:**
- Single-page application (SPA)
- Mode switching (Text ✍️, Image 🎨, Video 🎬, Music 🎵)
- Output panel with text/JSON toggle
- Copy button (📋)
- Settings panel (⚙️)

**Hosting:**
- Cloudflare Pages
- Automatic HTTPS
- CDN distribution
- Instant deployment from Git

---

### 3.2 Backend (Cloudflare Workers)

**Technology Stack:**
- JavaScript/TypeScript
- Cloudflare Workers runtime
- Serverless functions

**Primary Worker: `/api/generate`**

**Responsibilities:**
- Receive user input + mode selection
- Route to appropriate processing logic
- Call AI providers via AI Gateway
- Apply fallback logic on errors
- Format and return output

**Worker Endpoints:**

```
POST /api/generate
Body: {
  "mode": "text" | "image" | "video" | "music",
  "subMode": "default" | "modeA" | "modeB" | "cot" | "pot",
  "input": "user input text",
  "stage": "clarify" | "distill" | "brief" (for Mode A),
  "answers": ["answer1", "answer2"] (for Mode A stage 2)
}

Response: {
  "success": true,
  "output": "generated context brief",
  "outputJSON": { ... } (optional),
  "questions": ["q1", "q2"] (for Mode A stage 1)
}
```

**Processing Logic:**

1. **Default Text Mode:**
   - Input → OpenRouter → Context brief

2. **Mode A (Clarify → Distill):**
   - Stage 1: Input → OpenRouter → Questions
   - Stage 2: Questions + Answers → Gemini → Distilled context
   - Stage 3: Return brief

3. **Mode B (CoT/PoT):**
   - Input → OpenRouter/Gemini → Reasoning output

4. **Image/Video/Music:**
   - Input → OpenRouter/Gemini → Structured blueprint

**Error Handling:**
- Try OpenRouter first
- On failure → fallback to Gemini
- On Gemini failure → return user-friendly error
- Log errors (optional: send to Cloudflare Analytics)

---

### 3.3 AI Gateway (Cloudflare AI Gateway)

**Purpose:**
- Unified interface for multiple AI providers
- Caching to reduce API calls
- Rate limiting and request throttling
- Analytics and usage tracking

**Configuration:**

```yaml
Gateway: contextor-ai-gateway
Endpoints:
  - openrouter:
      url: https://openrouter.ai/api/v1/chat/completions
      model: z-ai/glm-4.5-air:free
      cache_ttl: 300 (5 minutes for identical requests)

  - gemini:
      url: https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent
      cache_ttl: 300
```

**Benefits:**
- Single point of failure mitigation
- Reduced latency via caching
- Centralized API key management
- Request/response logging

---

### 3.4 External AI Providers

#### OpenRouter (Primary)

**Model:** `z-ai/glm-4.5-air:free`

**Use Cases:**
- Clarification questions (Mode A stage 1)
- Default text mode
- Mode B reasoning
- Image/video/music blueprint generation

**API Format:**
```json
POST https://openrouter.ai/api/v1/chat/completions
{
  "model": "z-ai/glm-4.5-air:free",
  "messages": [
    {"role": "system", "content": "System prompt"},
    {"role": "user", "content": "User input"}
  ]
}
```

**Rate Limits:**
- Free tier: TBD (check OpenRouter documentation)
- Fallback strategy applies if limits exceeded

---

#### Google Gemini (Fallback)

**Model:** Gemini 2.5 Flash

**Use Cases:**
- Distillation (Mode A stage 2)
- Fallback for all modes if OpenRouter fails
- Alternative reasoning mode

**API Format:**
```json
POST https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent
{
  "contents": [
    {"role": "user", "parts": [{"text": "User input"}]}
  ],
  "generationConfig": {
    "temperature": 0.7,
    "maxOutputTokens": 2048
  }
}
```

**Rate Limits:**
- Free tier: 1500 requests/day, 15 RPM
- Sufficient for MVP usage

---

## 4. Data Flow Architecture

### 4.1 Default Text Mode Flow

```
User Input
    ↓
Frontend (Cloudflare Pages)
    ↓
POST /api/generate (Worker)
    ↓
Cloudflare AI Gateway
    ↓
OpenRouter API
    ↓
[If fails → Gemini API]
    ↓
Worker processes response
    ↓
Frontend displays output
    ↓
User copies to clipboard
```

---

### 4.2 Mode A (Clarify → Distill) Flow

**Stage 1: Clarification**

```
User Input ("I need to build a web app")
    ↓
POST /api/generate (stage: "clarify")
    ↓
Worker → AI Gateway → OpenRouter
    ↓
OpenRouter generates questions:
  1. What is the purpose of the app?
  2. Who are the target users?
  3. What features are essential?
    ↓
Frontend displays questions
    ↓
User answers questions
```

**Stage 2: Distillation**

```
Questions + Answers
    ↓
POST /api/generate (stage: "distill")
    ↓
Worker → AI Gateway → Gemini
    ↓
Gemini distills context:
  "E-commerce web app for small businesses,
   targeting shop owners, key features:
   product catalog, shopping cart, payment..."
    ↓
Frontend displays distilled context
```

**Stage 3: Context Brief**

```
Distilled context
    ↓
Worker formats as brief
    ↓
Frontend displays final output
    ↓
User copies to AI provider
```

---

### 4.3 Mode B (CoT/PoT) Flow

```
User Input + Mode Selection (CoT or PoT)
    ↓
POST /api/generate (subMode: "cot" or "pot")
    ↓
Worker → AI Gateway → OpenRouter/Gemini
    ↓
AI generates reasoning:
  - CoT: Step 1, Step 2, Step 3...
  - PoT: Pseudo-code algorithm
    ↓
Frontend displays reasoning output
    ↓
User copies to clipboard
```

---

### 4.4 Image/Video/Music Blueprint Flow

```
User Input ("Cyberpunk cityscape at night")
    ↓
POST /api/generate (mode: "image")
    ↓
Worker → AI Gateway → OpenRouter/Gemini
    ↓
AI generates structured blueprint:
  Subject: Futuristic cityscape
  Scene: Neon-lit streets, flying cars
  Lighting: Neon blue and purple...
    ↓
Worker formats as text + JSON
    ↓
Frontend displays blueprint
    ↓
User copies to Midjourney/Runway/Suno
```

---

## 5. Fallback & Error Handling Architecture

### Fallback Strategy

```
┌─────────────────────────────────────────┐
│  Primary: Gemini 2.5 Flash              │
└──────────────┬──────────────────────────┘
               │
         [API Call]
               │
        ┌──────▼──────┐
        │  Success?   │
        └──┬───────┬──┘
           │       │
         Yes       No
           │       │
           │   ┌───▼────────────────────────────┐
           │   │ Fallback: OpenRouter GLM-4.5   │
           │   └───┬────────────────────────────┘
           │       │
           │   [API Call]
           │       │
           │   ┌───▼──────┐
           │   │ Success? │
           │   └───┬───┬──┘
           │       │   │
           │      Yes  No
           │       │   │
           │       │   └───► Error Message
           │       │
           └───────┴───► Return Output
```

### Error Types & Responses

| Error | Cause | User Message |
|-------|-------|--------------|
| `RATE_LIMIT_EXCEEDED` | API quota hit | "Too many requests. Please try again in a moment." |
| `API_TIMEOUT` | Slow response | "Request timed out. Please try again." |
| `INVALID_INPUT` | Empty or malformed input | "Please provide valid input." |
| `MODEL_UNAVAILABLE` | AI provider down | "Service temporarily unavailable. Try again shortly." |
| `UNKNOWN_ERROR` | Unexpected failure | "Something went wrong. Please try again." |

---

## 6. Security Architecture

### API Key Management

- **Storage:** Cloudflare Workers secrets (environment variables)
- **Access:** Only Workers can access keys (not exposed to frontend)
- **Rotation:** Manual rotation via Cloudflare dashboard

### Data Privacy

- **No Storage:** User inputs/outputs are never stored
- **No Logging:** User data not logged (optional: anonymized analytics)
- **HTTPS Only:** All communication encrypted via Cloudflare

### CORS Configuration

```javascript
// Worker CORS headers
headers: {
  'Access-Control-Allow-Origin': 'https://contextor.pages.dev',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type'
}
```

---

## 7. Performance Architecture

### Caching Strategy

| Layer | Cache Duration | Purpose |
|-------|---------------|----------|
| **Cloudflare CDN** | Static assets: 1 year | Serve HTML/CSS/JS instantly |
| **AI Gateway** | Identical requests: 5 min | Reduce redundant AI calls |
| **Browser** | No cache for API responses | Ensure fresh context generation |

### Optimization Techniques

1. **Code Splitting:** Load only active mode's JS
2. **Lazy Loading:** Load emoji assets on demand
3. **Minification:** Compress CSS/JS for production
4. **Edge Compute:** Workers run close to users globally

### Performance Targets

- **Time to Interactive (TTI):** < 2 seconds
- **First Contentful Paint (FCP):** < 1 second
- **API Response Time:** < 4 seconds (95th percentile)

---

## 8. Scalability Architecture

### Horizontal Scaling

- **Cloudflare Workers:** Auto-scale to millions of requests
- **No Database Bottleneck:** Stateless design eliminates scaling issues
- **Global Edge Network:** Workers deployed across 300+ cities

### Vertical Scaling

- **Not Applicable:** Serverless architecture handles scaling automatically

### Load Testing Assumptions

- **Expected Load (MVP):** 1,000 requests/day
- **Peak Capacity:** 10,000 requests/day
- **Scaling Headroom:** 100x capacity available

---

## 9. Deployment Architecture

### CI/CD Pipeline

```
Git Repository (GitHub/GitLab)
    ↓
Push to main branch
    ↓
Cloudflare Pages Auto-Deploy
    ↓
Build frontend (npm run build)
    ↓
Deploy to production URL
    ↓
Cloudflare Workers Deploy (via Wrangler)
    ↓
Production Live
```

### Environment Configuration

| Environment | URL | Purpose |
|-------------|-----|---------|
| **Production** | `https://contextor.pages.dev` | Live users |
| **Preview** | `https://[branch].contextor.pages.dev` | PR previews |
| **Local** | `http://localhost:8788` | Development |

### Secrets Management

```bash
# Set API keys via Wrangler CLI
wrangler secret put OPENROUTER_API_KEY
wrangler secret put GEMINI_API_KEY
```

---

## 10. Monitoring & Observability

### Metrics to Track

1. **Request Volume:** Total API calls per mode
2. **Error Rate:** Percentage of failed requests
3. **Latency:** P50, P95, P99 response times
4. **Fallback Rate:** How often Gemini fallback is used
5. **Mode Usage:** Distribution across text/image/video/music

### Monitoring Tools

- **Cloudflare Analytics:** Built-in dashboard
- **Custom Logging:** Optional structured logs to external service
- **Error Tracking:** Sentry or similar (optional)

---

## 11. Technology Stack Summary

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Frontend** | React/Vue/Vanilla JS | UI rendering |
| **Styling** | CSS3, JetBrains Mono | Minimal design |
| **Backend** | Cloudflare Workers | Serverless API |
| **AI Gateway** | Cloudflare AI Gateway | API routing, caching |
| **Primary AI** | Google Gemini 2.5 Flash | Context generation (all modes) |
| **Fallback AI** | OpenRouter (glm-4.5-air) | Backup if Gemini fails |
| **Hosting** | Cloudflare Pages | Static site hosting |
| **Domain** | Cloudflare DNS | Domain management |
| **CDN** | Cloudflare CDN | Global content delivery |
| **Security** | Cloudflare SSL | HTTPS encryption |

---

## 12. Design Patterns & Best Practices

### Architectural Patterns

1. **Serverless Architecture:** No server management, auto-scaling
2. **API Gateway Pattern:** Unified interface for multiple AI providers
3. **Retry Pattern:** Fallback logic for resilience
4. **Stateless Design:** No session or database dependencies

### Code Organization

```
/src
  /components
    - InputPanel.js
    - OutputPanel.js
    - ModeSelector.js
  /utils
    - api.js
    - clipboard.js
  /styles
    - global.css
  App.js
  index.html

/workers
  /api
    - generate.js
  /utils
    - ai-provider.js
    - fallback.js
  wrangler.toml
```

---

## Cross-References

- [01-context.md](01-context.md) — Project overview
- [03-prd.md](03-prd.md) — Product requirements
- [05-worker_logic.md](05-worker_logic.md) — Detailed Worker implementation
- [06-frontend_ui.md](06-frontend_ui.md) — UI design and wireframes
- [07-prompt_templates.md](07-prompt_templates.md) — AI prompt engineering

---

> **Note for AI Builders:** This architecture is designed for MVP simplicity with clear scaling paths. Follow these patterns to maintain consistency and reliability.
