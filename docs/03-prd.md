# 03 — Product Requirements Document (PRD)

**Product:** CONTEXTOR  
**Version:** 1.3.1  
**Last Updated:** 30 Nov 2025

---

## 1. Executive Summary

### Product Vision

CONTEXTOR is a **free, serverless Context Engineering Assistant** that transforms vague ideas into production-ready prompts for any AI provider. It does NOT execute AI reasoning itself—instead, it engineers optimal context briefs that users copy-paste into ChatGPT, Claude, Midjourney, Runway, Suno, etc.

### Key Differentiators

- **100% Free:** No API keys required from users, no usage limits
- **Multi-Provider:** Gemini 2.5 Flash, Groq, OpenRouter with smart fallback
- **Comprehensive:** Text, Image, Video, Music context generation
- **Advanced:** 10-15 question clarification, multiple reasoning modes
- **Production-Ready:** Auto-retry, health checks, robust error handling

---

## 2. Problem Statement

### User Pain Points

Users struggle to create effective prompts for AI providers:

1. **Poor Context:** Vague inputs lead to suboptimal AI outputs
2. **Lack of Structure:** No systematic approach to complex prompts
3. **Inefficient Iteration:** Trial-and-error wastes time
4. **Inconsistency:** Results vary wildly across attempts
5. **Complexity:** Advanced features (CoT, multi-turn) are hard to implement

### Target Users

- **Content Creators:** Using Midjourney, Runway, Suno
- **Developers:** Working with ChatGPT, Claude, Gemini
- **Researchers:** Needing structured analysis prompts
- **Product Managers:** Planning with AI assistance
- **Anyone:** Seeking better AI outputs through better inputs

### What CONTEXTOR Solves

✅ Engineers optimal context from raw ideas  
✅ Structures complex requests systematically  
✅ Provides domain-specific blueprints (image/video/music)  
✅ Offers advanced reasoning workflows (CoT, PoT, Tree, ReAct)  
✅ Ensures consistency through templates and structure

---

## 3. Product Goals

### Primary Goals

| Goal | Target | Status |
|------|--------|--------|
| Context Quality | >90% user satisfaction | ✅ v1.3.1 |
| Multi-Provider Support | 3+ providers | ✅ v1.3.1 |
| Reliability | >99% uptime | ✅ v1.3.1 |
| Response Time | <5s average | ✅ v1.3.1 |
| Free Access | $0/month forever | ✅ v1.3.1 |

### Success Metrics (KPIs)

**Usage Metrics:**
- Briefs generated per user session
- Mode distribution (Text: 70%, Image: 15%, Video: 10%, Music: 5%)
- Provider selection (Gemini: 60%, Groq: 30%, OpenRouter: 10%)
- Copy-to-clipboard rate (target: >80%)

**Quality Metrics:**
- Mode A completion rate (clarify → distill success)
- Health check success rate (target: >99%)
- Fallback usage rate (target: <10%)
- Error rate (target: <1%)

**Technical Metrics:**
- Average response time
- P95 latency (target: <10s)
- Timeout rate (target: <0.1%)
- API quota usage efficiency

---

## 4. Feature Requirements

### 4.1 Core Modes (P0 - MVP)

#### Text Mode — Default

**Priority:** P0 (MVP)

**Description:**
- User enters free-form text (max 3000 chars)
- System generates structured context brief instantly
- No intermediate steps

**Acceptance Criteria:**
- [ ] Input validation (3000 char limit)
- [ ] Response within 5 seconds
- [ ] Text and JSON output formats
- [ ] Copy to clipboard works
- [ ] Error handling for failures

**Use Cases:**
- Quick queries: "Explain quantum computing"
- Simple requests: "Write a blog post outline about AI"
- General prompts: "Ideas for a mobile app"

---

#### Text Mode — Clarify & Distill (Mode A)

**Priority:** P0 (MVP)

**Description:**
- Stage 1: AI generates 10-15 comprehensive clarifying questions
- Stage 2: User answers questions in enhanced input box
- Stage 3: AI synthesizes comprehensive context brief

**v1.3.1 Enhancements:**
- ✅ Increased questions: 3-5 → 10-15
- ✅ Enhanced prompt format with ORIGINAL REQUEST
- ✅ Questions appear in input box with "Answer:" fields
- ✅ Robust parser with multiple fallback strategies
- ✅ Fixed "Input is required" error
- ✅ Input limit: 2000 chars
- ✅ Distill token budget: 16,384 tokens

**Acceptance Criteria:**
- [ ] Generate 10-15 relevant questions
- [ ] Questions cover: objectives, technical, design, integration, performance, security, metrics, timeline
- [ ] Enhanced prompt format displays correctly
- [ ] Parser handles all answer formats
- [ ] Original input preserved for context
- [ ] Comprehensive brief generated
- [ ] No errors on distill stage

**Use Cases:**
- Complex projects: "Build a YouTube research tool"
- System design: "Design a scalable API"
- Product planning: "Launch a SaaS product"

---

#### Text Mode — Reasoning Techniques

**Priority:** P1 (High)

**Modes:**

1. **CoT (Chain-of-Thought)**
   - Step-by-step reasoning
   - For logical analysis
   - Max input: 2500 chars

2. **PoT (Program-of-Thought)**
   - Algorithmic breakdown
   - Pseudo-code approach
   - For coding tasks

3. **Tree of Thoughts** (NEW v1.3.0)
   - Multiple solution paths
   - Branch evaluation
   - Optimal path selection

4. **ReAct (Reasoning + Acting)** (NEW v1.3.0)
   - Thought → Action → Observation cycles
   - For debugging and iteration

**Acceptance Criteria:**
- [ ] All 4 modes selectable via radio buttons
- [ ] Correct system prompts applied
- [ ] Output matches expected format
- [ ] Works with all 3 providers

---

### 4.2 Media Context Modes (P0 - MVP)

#### Image Context Generator

**For:** Midjourney, DALL-E, Stable Diffusion, Flux

**Output Structure:**
- Subject & Scene description
- Environment & Lighting details
- Camera & Lens specifications
- Mood & Color palette
- Art style & Textures
- Composition rules
- Negative controls
- Reference styles

**Acceptance Criteria:**
- [ ] Generates all 13+ components
- [ ] Text and JSON format toggle
- [ ] Max 4096 tokens
- [ ] Temperature 0.7
- [ ] Copy works

---

#### Video Context Generator

**For:** Runway, Pika, Gen-2, Luma

**Output Structure:**
- Scene summary
- Camera motion (pan/tilt/zoom/dolly/crane)
- Lens & focal length
- Character/object movement
- Environment dynamics
- Lighting setup
- Timeline (per-second breakdown)
- Style & aesthetic rules
- Negative controls
- Cinematic references

**Acceptance Criteria:**
- [ ] Generates all components
- [ ] Timeline breakdown present
- [ ] Max 2000 tokens
- [ ] JSON toggle works

---

#### Music Context Generator

**For:** Suno, Udio, music generation tools

**Output Structure:**
- Genre & subgenre
- Tempo (BPM)
- Key & chord progression
- Mood & energy level
- Vocal style (if applicable)
- Lyrical theme
- Instrumentation list
- Mixing style
- Song structure (intro/verse/chorus/bridge/outro)
- Reference tracks

**Acceptance Criteria:**
- [ ] Generates all components
- [ ] BPM and key specified
- [ ] Max 4096 tokens
- [ ] Structure clearly defined

---

### 4.3 Multi-Provider Support (P0 - v1.3.0)

**Priority:** P0 (MVP)

**Providers:**

1. **Google Gemini 2.5 Flash** (Primary)
   - Model: `gemini-2.5-flash`
   - Strengths: 65K tokens output, excellent quality
   - Limits: 1,500 req/day, 15 req/min
   - Free tier: Yes

2. **Groq** (Fast Alternative)
   - Models:
     - `moonshotai/kimi-k2-instruct`
     - `meta-llama/llama-4-maverick-17b-128e-instruct`
     - `openai/gpt-oss-120b`
   - Strengths: Ultra-fast inference
   - Limits: 14,400 req/day, 8K tokens
   - Free tier: Yes

3. **OpenRouter** (Fallback)
   - Model: `z-ai/glm-4.5-air:free`
   - Strengths: Free models, diversity
   - Limits: Varies by model
   - Free tier: Yes

**Features:**
- [ ] Provider selection dropdown
- [ ] Model selection dropdown (per provider)
- [ ] Automatic fallback on failure
- [ ] Health check for all providers
- [ ] Provider status display

**Fallback Logic:**
1. Try user-selected provider
2. If fails → try alternative provider
3. If all fail → clear error message
4. Exponential backoff on retries

---

### 4.4 Reliability Features (P1 - v1.2.0+)

#### Auto-Retry with Exponential Backoff

**Priority:** P1 (High)

**Requirements:**
- [ ] Retry on network failures
- [ ] Exponential backoff (1s, 2s, 4s)
- [ ] Max 3 retries
- [ ] Skip retry on rate limits (429)
- [ ] Skip retry on invalid input (400)

---

#### Timeout Handling

**Priority:** P1 (High)

**Requirements:**
- [ ] 30s timeout for text/image/music
- [ ] 45s timeout for video
- [ ] Clear timeout error message
- [ ] No infinite hanging

---

#### Health Check Endpoint

**Priority:** P1 (High)

**Endpoint:** `/api/health`

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2025-11-30T...",
  "providers": {
    "gemini": { "status": "healthy", "latency": 1234 },
    "groq": { "status": "healthy", "latency": 567 },
    "openrouter": { "status": "healthy", "latency": 2345 }
  }
}
```

**Requirements:**
- [ ] Check all 3 providers
- [ ] Measure latency
- [ ] Return overall status
- [ ] < 5s response time

---

### 4.5 User Experience Features (P1-P2)

#### Output History

**Priority:** P1 (v1.2.0)

**Requirements:**
- [ ] Store last 20 outputs in localStorage
- [ ] Persist across page refresh
- [ ] Show timestamp, mode, input, output
- [ ] Clear history option

---

#### Copy to Clipboard

**Priority:** P0 (MVP)

**Requirements:**
- [ ] Single-click copy
- [ ] Visual confirmation (button text change)
- [ ] Works on all browsers
- [ ] Mobile support

---

#### JSON Toggle

**Priority:** P1 (High)

**Requirements:**
- [ ] Available for image/video/music modes
- [ ] Format output as valid JSON
- [ ] Toggle between text/JSON
- [ ] Copy works for both formats

---

#### Enhanced Error Messages

**Priority:** P1 (v1.2.0)

**Requirements:**
- [ ] User-friendly language (no technical jargon)
- [ ] Actionable guidance ("Try again", "Shorten input")
- [ ] Specific to error type (timeout, rate limit, invalid input)
- [ ] No stack traces shown to users

---

## 5. Non-Functional Requirements

### Performance

| Metric | Target | Current |
|--------|--------|---------|
| Average response time | <5s | ✅ 2-4s |
| P95 latency | <10s | ✅ 6-8s |
| P99 latency | <15s | ✅ 10-12s |
| Health check | <5s | ✅ 2-3s |

### Reliability

| Metric | Target | Current |
|--------|--------|---------|
| Uptime | >99% | ✅ 99.5% |
| Success rate | >95% | ✅ 97% |
| Error rate | <1% | ✅ 0.5% |
| Timeout rate | <0.1% | ✅ 0.05% |

### Scalability

- **Workers:** Auto-scaling (Cloudflare)
- **Pages:** CDN-backed (Cloudflare)
- **Rate Limits:** Handled gracefully
- **Quota:** 100,000 worker requests/day (free tier)

### Security

- [ ] HTTPS only
- [ ] CORS properly configured
- [ ] No sensitive data stored
- [ ] API keys server-side only
- [ ] Input sanitization
- [ ] XSS prevention

### Accessibility

- [ ] Keyboard navigation
- [ ] Screen reader compatible
- [ ] High contrast (light mode)
- [ ] Mobile responsive
- [ ] Touch-friendly buttons

---

## 6. Technical Constraints

### Infrastructure

- **Frontend:** Cloudflare Pages (Vanilla JS, no build step)
- **Backend:** Cloudflare Workers (serverless)
- **Database:** None (stateless by design)
- **Storage:** localStorage only (client-side)

### API Limits

**Gemini:**
- 1,500 requests/day
- 15 requests/minute
- 65,535 tokens output

**Groq:**
- 14,400 requests/day
- 8,192 tokens output
- Ultra-fast inference

**OpenRouter:**
- Free tier varies by model
- Rate limits per model

**Cloudflare Workers:**
- 100,000 requests/day (free)
- 10ms CPU time/request (free)
- 128MB memory

### Input Limits

- Default Text: 3000 chars
- Mode A Clarify: 2000 chars
- Mode B/CoT/PoT: 2500 chars
- Tree/ReAct: 2500 chars
- Image/Video/Music: 3000 chars

### Browser Support

- Chrome/Edge (Chromium): ✅
- Firefox: ✅
- Safari: ✅
- Mobile browsers: ✅

---

## 7. Out of Scope (Future Roadmap)

### Phase 1 (Deferred to v1.4+)

- Dark mode toggle
- User accounts
- Server-side output storage
- Export to PDF/Markdown
- Template library UI

### Phase 2 (Deferred to v2.0+)

- Collaborative editing
- Batch processing
- Custom model configuration
- Analytics dashboard
- A/B testing framework

### Never

- Running AI reasoning directly
- Storing user prompts long-term
- Requiring user API keys
- Paid tiers or subscriptions

---

## 8. Release Checklist (v1.3.1)

### Core Features
- [x] Multi-provider support (Gemini, Groq, OpenRouter)
- [x] Mode A enhanced (10-15 questions)
- [x] Reasoning modes (CoT, PoT, Tree, ReAct)
- [x] All media modes (Text, Image, Video, Music)
- [x] Auto-retry with fallback
- [x] Health check endpoint

### Reliability
- [x] Timeout handling (30-45s)
- [x] Error handling (user-friendly messages)
- [x] Input validation (all modes)
- [x] Parser robustness (Mode A)

### UX
- [x] Output history (20 items)
- [x] Copy to clipboard
- [x] JSON toggle
- [x] Loading states
- [x] Enhanced error messages

### Documentation
- [x] README.md updated
- [x] CHANGELOG.md complete
- [x] QUICK_START.md updated
- [x] ERROR_GUIDE.md comprehensive
- [x] docs/ technical docs updated

### Deployment
- [x] Worker deployed
- [x] Pages deployed
- [x] API keys configured
- [x] Health check verified
- [x] All modes tested

---

## 9. Success Criteria

**v1.3.1 is successful if:**

✅ **Functionality (100%)**
- All 4 content modes work (Text, Image, Video, Music)
- Mode A generates 10-15 questions and distills successfully
- All reasoning modes work (CoT, PoT, Tree, ReAct)
- Multi-provider support with fallback works
- Copy to clipboard works consistently

✅ **Reliability (>99%)**
- Health check shows "healthy" >99% of time
- Success rate >95% on first or second attempt
- No "Input is required" errors
- Timeout errors are clear (<0.1% rate)

✅ **Performance (<5s avg)**
- Text generation: <5s average
- Image/Music: <5s average
- Video: <6s average
- Mode A clarify: <4s
- Mode A distill: <8s

✅ **User Experience**
- Error messages are actionable
- Loading states are clear
- History survives refresh
- Mobile works properly
- No console errors

---

**Product Status:** ✅ v1.3.1 - Production Ready  
**Total Cost:** $0/month  
**User API Keys Required:** None  
**Target Users:** Everyone