# Project Context & Specification

**Product:** CONTEXTOR  
**Version:** 1.3.1  
**Last Updated:** 30 Nov 2025

---

## 1. Overview

CONTEXTOR is a web-based **Context Engineering Assistant** that generates **context-engineered briefs** for various AI providers.

**Key Principle:** CONTEXTOR does NOT run AI reasoning itself — it engineers optimal context (briefs) that users copy-paste into any AI provider (ChatGPT, Claude, Gemini, Midjourney, Runway, Suno, etc.).

### Core Capabilities

- **Text Context Engineering** - For LLMs (ChatGPT, Claude, Gemini)
- **Image Blueprint Generation** - For image AI (Midjourney, DALL-E, Stable Diffusion)
- **Video Scene Breakdown** - For video AI (Runway, Pika, Gen-2)
- **Music Structure Design** - For music AI (Suno, Udio)

---

## 2. Current Architecture (v1.3.1)

### Tech Stack

- **Frontend:** Cloudflare Pages (Vanilla JS, no frameworks)
- **Backend:** Cloudflare Workers (serverless)
- **AI Providers:** 
  - Primary: Google Gemini 2.5 Flash (65K tokens output)
  - Fast: Groq (ultra-fast inference, 8K tokens)
  - Fallback: OpenRouter (free models)

### Multi-Provider Strategy

**Provider Priority:**
1. User-selected provider (Gemini, Groq, or OpenRouter)
2. Automatic fallback if primary fails
3. Smart retry with exponential backoff

**Current Models:**
- **Gemini:** `gemini-2.5-flash` (only option, excellent quality)
- **Groq:** 
  - `moonshotai/kimi-k2-instruct`
  - `meta-llama/llama-4-maverick-17b-128e-instruct`
  - `openai/gpt-oss-120b`
- **OpenRouter:** `z-ai/glm-4.5-air:free` (default)

---

## 3. Core Modes (v1.3.1)

### 3.1 Default Text Mode — Instant Context

**Use Case:** Quick queries, simple requests

**Flow:**
1. User enters free-form input (max 3000 chars)
2. System generates structured context brief
3. User copies output to their AI provider

**Output Formats:**
- Text (default)
- JSON (optional toggle)

**Example:**
```
Input: "Explain quantum computing to beginners"
Output: Comprehensive context-engineered brief ready for ChatGPT/Claude
```

---

### 3.2 Mode A — Clarify & Distill (ENHANCED v1.3.1)

**Use Case:** Complex projects, unclear scope, large tasks

**Major Updates in v1.3.1:**
- ✅ Generates 10-15 comprehensive questions (up from 3-5)
- ✅ Enhanced prompt format with ORIGINAL REQUEST context
- ✅ Questions appear directly in input box with "Answer:" fields
- ✅ Robust parser with multiple fallback strategies
- ✅ Fixed "Input is required" error on distill stage
- ✅ Increased input limit: 2000 chars
- ✅ Increased distill token budget: 16,384 tokens

#### Stage 1 — Clarification

1. User provides raw input (e.g., "Build a YouTube video research tool")
2. AI generates 10-15 comprehensive clarifying questions covering:
   - Core objectives & target audience
   - Technical requirements & features
   - Design preferences & data handling
   - Integration needs & performance goals
   - Security, metrics, timeline
   - Domain-specific requirements

#### Stage 2 — Answer Questions

3. Questions appear IN the input box with enhanced format:
   ```
   ORIGINAL REQUEST:
   "[user's original input]"
   
   TASK: Create comprehensive context engineering brief
   
   📋 CLARIFYING QUESTIONS - Please provide detailed answers:
   
   1. Question...
      Answer: 
   
   2. Question...
      Answer: 
   ```
4. User fills answers next to "Answer:" for each question

#### Stage 3 — Distillation

5. System sends: original input + questions + answers to AI
6. AI synthesizes comprehensive context brief
7. User copies final brief to their AI provider

**Best For:**
- Research projects
- System design
- Product planning
- Complex coding tasks
- Strategic planning

---

### 3.3 Reasoning Techniques (Text Mode Only)

#### CoT (Chain-of-Thought)

**Use Case:** Logical analysis, step-by-step reasoning

**System Prompt:**
```
Use step-by-step Chain-of-Thought reasoning. 
Break down the problem, show your logic at each step, 
and build towards a comprehensive conclusion.
```

**Output Style:** Sequential reasoning with clear steps

---

#### PoT (Program-of-Thought)

**Use Case:** Coding tasks, algorithm design

**System Prompt:**
```
Use Program-of-Thought reasoning with pseudo-code 
and algorithmic thinking. Break down into logical 
program structures, data flows, and control logic.
```

**Output Style:** Algorithmic breakdown with pseudo-code

---

#### Tree of Thoughts (NEW in v1.3.0)

**Use Case:** Multiple solution paths, exploring alternatives

**System Prompt:**
```
Use Tree of Thoughts reasoning: explore multiple solution paths, 
evaluate each branch, and select the best approach. Structure:
1) Multiple thought branches
2) Evaluation of each branch
3) Selected optimal path
4) Final solution
```

**Output Style:** Branch exploration with evaluation and selection

---

#### ReAct (Reasoning + Acting) (NEW in v1.3.0)

**Use Case:** Debugging, iterative problem-solving

**System Prompt:**
```
Use ReAct (Reasoning + Acting) methodology: 
alternate between reasoning steps and action steps.
Format: Thought 1 → Action 1 → Observation 1 → 
Thought 2 → Action 2 → Observation 2... → Final Answer
```

**Output Style:** Iterative thought-action-observation cycles

---

## 4. Media Context Modes

### 4.1 Image Context Generator

**For:** Midjourney, DALL-E, Stable Diffusion, Flux

**Output Structure:**
- Subject & Scene
- Environment & Lighting
- Camera & Lens specs
- Mood & Color palette
- Art style & Textures
- Composition rules
- Negative controls
- Reference styles

**Max Tokens:** 4096  
**Temperature:** 0.7

---

### 4.2 Video Context Generator

**For:** Runway, Pika, Gen-2, Luma

**Output Structure:**
- Scene summary
- Camera motion & Lens
- Character movement
- Environment details
- Lighting setup
- Timeline (per second breakdown)
- Style & Aesthetic rules
- Negative controls
- Reference cinematography

**Max Tokens:** 2000  
**Temperature:** 0.7

---

### 4.3 Music Context Generator

**For:** Suno, Udio, music generation tools

**Output Structure:**
- Genre & Subgenre
- Tempo (BPM)
- Key & Chord progression
- Mood & Energy level
- Vocal style (if applicable)
- Lyrical theme
- Instrumentation
- Mixing style
- Song structure (intro/verse/chorus/bridge/outro)
- Reference tracks

**Max Tokens:** 4096  
**Temperature:** 0.7

---

## 5. Key Features (v1.3.1)

### Multi-Provider Support
- ✅ Gemini 2.5 Flash (primary, 65K tokens)
- ✅ Groq (ultra-fast, 8K tokens)
- ✅ OpenRouter (fallback, free models)
- ✅ Automatic fallback on failure
- ✅ Provider/model selection UI

### Mode A Enhancements
- ✅ 10-15 comprehensive questions
- ✅ Enhanced prompt format
- ✅ Robust answer parsing
- ✅ Original context preservation
- ✅ 2000 char input limit
- ✅ 16K token distill budget

### Reasoning Modes
- ✅ CoT (Chain-of-Thought)
- ✅ PoT (Program-of-Thought)
- ✅ Tree of Thoughts
- ✅ ReAct (Reasoning + Acting)

### Reliability
- ✅ Auto-retry with exponential backoff
- ✅ 30-45s timeout handling
- ✅ Health check endpoint (`/api/health`)
- ✅ Circuit breaker pattern (planned)
- ✅ Request deduplication (planned)

### User Experience
- ✅ Output history (20 items, localStorage)
- ✅ Copy to clipboard
- ✅ JSON/Text toggle
- ✅ Enhanced error messages
- ✅ Loading progress indicators
- ✅ Mobile responsive

---

## 6. Constraints & Limitations

### Free Tier Limits

**Cloudflare:**
- Workers: 100,000 requests/day
- Pages: Unlimited

**Gemini:**
- 1,500 requests/day
- 65,535 tokens output
- 15 requests/minute

**Groq:**
- 14,400 requests/day
- 8,192 tokens output
- Ultra-fast inference

**OpenRouter:**
- Free models available
- Rate limits vary by model

### Input Limits (v1.3.1)

- Default Text: 3000 chars
- Mode A Clarify: 2000 chars
- Mode B (CoT/PoT): 2500 chars
- Tree/ReAct: 2500 chars
- Image/Video/Music: 3000 chars

### Design Constraints

- ✅ Stateless (no database)
- ✅ No user accounts
- ✅ No persistent storage (localStorage only)
- ✅ Light mode only (dark mode planned)
- ✅ Copy-paste workflow only

---

## 7. Success Metrics

### Usage Metrics
- Briefs generated per session
- Mode distribution (Text/Image/Video/Music)
- SubMode usage (Default/ModeA/CoT/PoT/Tree/ReAct)
- Provider selection distribution
- Copy-to-clipboard rate

### Quality Metrics
- Health check success rate (target: >99%)
- Response time (target: <5s average)
- Fallback usage rate (lower is better)
- Mode A completion rate (clarify → distill)

### Technical Metrics
- Worker invocations/day
- Error rate (target: <1%)
- Timeout rate (target: <0.1%)
- API quota usage

---

## 8. Future Roadmap

### Phase 1: Performance (Planned)
- Request caching (Cloudflare KV)
- Circuit breaker pattern
- Request deduplication
- Streaming responses

### Phase 2: Features (Planned)
- Dark mode
- User accounts (optional)
- Template library
- Batch processing
- Export formats (MD, PDF)

### Phase 3: AI Expansion (Planned)
- Anthropic Claude provider
- More Groq models
- Custom model support
- Provider comparison A/B testing

---

**Focus:** Context engineering, not basic prompting.  
**Philosophy:** Free, fast, and production-ready.  
**Status:** v1.3.1 - Stable and actively maintained