# 03 — Product Requirements Document (PRD)

**Product:** CONTEXTOR
**Version:** 1.0
**Last Updated:** 29 Nov 2025

---

## Purpose

This document captures all functional and non-functional requirements for CONTEXTOR, a web-based Context Engineering Assistant that generates context-engineered briefs for AI providers.

---

## 1. Problem Statement

### The Problem

Users struggle to create effective, structured prompts for various AI providers (Gemini, ChatGPT, Claude, Midjourney, Runway, Suno, etc.). Basic prompting often leads to:

- Suboptimal AI outputs due to poor context
- Lack of structure in complex requests
- Inefficient iteration cycles
- Inconsistent results across different AI models

### Target Users

- Content creators using image/video/music generation tools
- Developers and researchers working with text AI models
- Professionals who need structured context for complex AI tasks
- Anyone seeking to maximize AI output quality through better prompting

### What CONTEXTOR Solves

CONTEXTOR does NOT run AI reasoning itself. Instead, it:

- Engineers optimal context briefs that users copy-paste to any AI provider
- Structures free-form input into production-ready prompts
- Provides specialized blueprints for text, image, video, and music generation
- Focuses on context engineering, not basic prompting

---

## 2. Goals & Success Metrics

### Primary Goals

1. **Context Quality:** Generate highly structured, comprehensive context briefs
2. **Versatility:** Support text, image, video, and music contexts
3. **Accessibility:** Free to use with no API keys required
4. **Simplicity:** Ultra-minimal UI with instant output
5. **Flexibility:** Output compatible with any AI provider

### Success Metrics (KPIs)

- **User Engagement:** Number of briefs generated per session
- **Mode Usage:** Distribution across Default/Mode A/Mode B and media types
- **Output Quality:** User satisfaction with generated briefs (via feedback)
- **Copy Rate:** Percentage of users who copy the output
- **Return Usage:** User retention and repeat usage patterns

---

## 3. Features

### 3.1 Default Text Mode — Instant Context ⚡

**Priority:** P0 (MVP)

**Description:**
- User enters free-form text input
- System immediately generates a context-engineered text brief
- No intermediate steps or questions

**Output Formats:**
- Default: Text
- Optional: JSON

**Use Cases:**
- Quick queries
- Lightweight exploration
- Single-turn context generation

**Acceptance Criteria:**
- [ ] User can input text and receive immediate output
- [ ] Output is context-engineered (not just echoed input)
- [ ] JSON format option available
- [ ] Response time < 3 seconds

---

### 3.2 Mode A — Clarify → Distill → Context Brief 🔍

**Priority:** P0 (MVP)

**Description:**
Three-stage process for large, complex tasks (research, planning, system design, coding, strategy)

#### Stage 1: Clarification
- User provides raw input
- OpenRouter (`z-ai/glm-4.5-air:free`) generates clarifying questions
- User answers the questions

#### Stage 2: Distillation
- Questions + answers sent to Gemini 2.5 Flash (via CF AI Gateway)
- Gemini produces distilled context

#### Stage 3: Context Brief
- Flexible, production-ready brief
- User copy-pastes to their AI provider

**Acceptance Criteria:**
- [ ] User can enter raw input and receive clarifying questions
- [ ] Questions are relevant and comprehensive (3-7 questions typical)
- [ ] User can answer questions in free-form text
- [ ] Distillation produces coherent, structured context
- [ ] Final brief is copy-ready and comprehensive
- [ ] Fallback logic active if OpenRouter fails

---

### 3.3 Mode B — CoT → PoT (Reasoning Mode) 🧠

**Priority:** P0 (MVP)

**Description:**
Dual reasoning approach for analysis, pattern breakdown, coding tasks, strategy

#### Chain-of-Thought (CoT)
- Step-by-step reasoning
- Detailed analysis output

#### Program-of-Thought (PoT)
- Pseudo-code / algorithmic approach
- Logic and coding tasks

**Best Practices:**
- Large tasks → Mode A first, then Mode B
- Small tasks → Mode B standalone

**Acceptance Criteria:**
- [ ] User can select CoT or PoT mode
- [ ] CoT produces step-by-step reasoning
- [ ] PoT produces pseudo-code or algorithmic structure
- [ ] Modes can be combined with Mode A
- [ ] Output suitable for coding and logic tasks

---

### 3.4 Image Context Generator 🎨

**Priority:** P0 (MVP)

**Description:**
Generates structured visual blueprints for image generation AI (Midjourney, SDXL, Flux, Nano Banana, Pika Image, etc.)

**Blueprint Structure:**
```
Subject:
Scene:
Environment:
Lighting:
Camera:
Lens:
Mood:
Palette:
Art Style:
Textures:
Composition:
Negative Controls:
References:
```

**Output Formats:**
- Text (primary)
- JSON (optional)

**Acceptance Criteria:**
- [ ] User can input image concept
- [ ] Output includes all blueprint fields
- [ ] Fields are populated with specific, actionable details
- [ ] JSON format available
- [ ] Compatible with major image generation models

---

### 3.5 Video Context Generator 🎬

**Priority:** P0 (MVP)

**Description:**
Generates cinematic breakdowns for video generation AI (Runway Gen-3, Pika, VEO, Luma Ray, Kling, etc.)

**Blueprint Structure:**
```
Scene Summary:
Camera Motion:
Lens & Focal Length:
Character Movement:
Environment Dynamics:
Lighting:
Timeline (0–1s, 1–2s, ...):
Style:
Aesthetic Rules:
Negative Controls:
References:
```

**Output Formats:**
- Text (primary)
- JSON (optional)

**Acceptance Criteria:**
- [ ] User can input video concept
- [ ] Output includes all blueprint fields with temporal breakdown
- [ ] Timeline provides frame-by-frame guidance
- [ ] JSON format available
- [ ] Compatible with major video generation models

---

### 3.6 Music Context Generator 🎵

**Priority:** P0 (MVP)

**Description:**
Generates structural music blueprints for generative music AI (Suno, Udio, Noisee, MusicGen, etc.)

**Blueprint Structure:**
```
Genre:
Tempo (BPM):
Key:
Chord Progression:
Mood & Emotion:
Vocal Style:
Lyrical Theme:
Instrumentation:
Mixing Style:
Song Structure:
Reference Tracks:
```

**Output Formats:**
- Text (primary)
- JSON (optional)

**Acceptance Criteria:**
- [ ] User can input music concept
- [ ] Output includes all blueprint fields
- [ ] Musical elements are technically accurate
- [ ] JSON format available
- [ ] Compatible with major music generation models

---

### 3.7 Emoji-Driven Navigation System

**Priority:** P0 (MVP)

**Description:**
Simple, intuitive emoji-based UI for mode selection

**Emoji Map:**
- ✍️ Text
- 🎨 Image
- 🎬 Video
- 🎵 Music
- ✨ Compile
- 📋 Copy
- ⚙️ Settings

**Acceptance Criteria:**
- [ ] Emoji buttons are clearly visible and clickable
- [ ] Mode switches instantly on click
- [ ] Active mode is visually indicated
- [ ] Copy button copies output to clipboard
- [ ] Settings accessible via ⚙️

---

### 3.8 Copy-to-Clipboard Functionality

**Priority:** P0 (MVP)

**Description:**
One-click copy of generated briefs

**Acceptance Criteria:**
- [ ] 📋 button copies full output
- [ ] Visual confirmation on successful copy
- [ ] Works across all modes and output types
- [ ] Preserves formatting in clipboard

---

## 4. Non-Functional Requirements

### 4.1 Performance

- **Response Time:**
  - Default Mode: < 3 seconds
  - Mode A (Clarification): < 4 seconds
  - Mode A (Distillation): < 6 seconds
  - Mode B: < 5 seconds
  - Image/Video/Music: < 4 seconds

- **Scalability:**
  - Handle concurrent users via Cloudflare Workers
  - No database bottlenecks (stateless design)

### 4.2 Security

- **No User Data Storage:** CONTEXTOR does not store user inputs or outputs
- **API Key Protection:** User API keys not required; service keys stored as Cloudflare secrets
- **HTTPS Only:** All traffic encrypted via Cloudflare

### 4.3 Usability & Accessibility

- **Design Philosophy:**
  - Light mode only
  - Ultra minimal design
  - No gradients
  - Monospace typography (JetBrains Mono)

- **Accessibility:**
  - Keyboard navigation support
  - Screen reader compatible
  - Clear visual hierarchy
  - High contrast text

### 4.4 Reliability

- **Fallback Logic:**
  - If OpenRouter fails → switch to Gemini or alternate OpenRouter model
  - Graceful error messages (no technical jargon)

- **Uptime:**
  - Target: 99.9% (leveraging Cloudflare infrastructure)

---

## 5. Constraints & Assumptions

### Technical Constraints

- **Free AI Providers Only:**
  - OpenRouter free tier
  - Gemini 2.5 Flash (free tier)

- **Cloudflare Infrastructure:**
  - Cloudflare Pages (UI)
  - Cloudflare Workers (backend)
  - CF AI Gateway (API routing)

- **No Heavy Inference:**
  - CONTEXTOR does not run local models
  - All AI calls are API-based

### Business Constraints

- **No User API Keys:** Service must work without user-provided keys
- **No Monetization (MVP):** Focus on free-tier viability

### Key Assumptions

- Free API limits sufficient for MVP usage
- Cloudflare Workers execution time adequate for all modes
- Users are comfortable with copy-paste workflow
- JSON schema flexibility acceptable (no rigid structure)

---

## 6. Out of Scope

### Not Included in MVP

- **Dark Mode:** Light mode only
- **Model Selection:** Users cannot manually choose AI models
- **Direct AI Execution:** CONTEXTOR does not run the AI itself
- **User Accounts:** No login or saved history
- **Custom Templates:** Predefined blueprints only
- **Multi-Language Support:** English only
- **Mobile App:** Web-only (responsive design)
- **Advanced Analytics:** No user tracking or analytics dashboard

---

## 7. Dependencies

### Third-Party Services

1. **OpenRouter**
   - Default model: `z-ai/glm-4.5-air:free`
   - Used for: Clarification questions (Mode A)

2. **Google Gemini**
   - Model: Gemini 2.5 Flash
   - Used for: Distillation (Mode A), fallback for all modes
   - Accessed via: Cloudflare AI Gateway

3. **Cloudflare**
   - Pages: Frontend hosting
   - Workers: Backend logic
   - AI Gateway: API routing and caching

### Internal Systems

- No internal dependencies (standalone system)

---

## 8. Future Enhancements (Out of Scope for MVP)

See [08-future_expansions.md](08-future_expansions.md) for detailed roadmap.

**Summary:**
- Dark mode
- User accounts and history
- Custom template builder
- Multi-language support
- Model selection options
- Advanced analytics

---

## Cross-References

- [01-context.md](01-context.md) — Project overview and specification
- [02-dev_protocol.md](02-dev_protocol.md) — Development standards
- [04-architecture.md](04-architecture.md) — System architecture
- [05-worker_logic.md](05-worker_logic.md) — API and Worker flow
- [06-frontend_ui.md](06-frontend_ui.md) — UI wireframes and UX rules
- [07-prompt_templates.md](07-prompt_templates.md) — Prompt templates for all modes
- [08-future_expansions.md](08-future_expansions.md) — Future roadmap

---

## Appendix: Glossary

### Context Engineering
The practice of structuring and optimizing input context to maximize AI model output quality.

### Clarify → Distill → Brief
Three-stage pipeline: generate questions → process answers → produce final context.

### Chain-of-Thought (CoT)
Step-by-step reasoning approach for analysis and problem-solving.

### Program-of-Thought (PoT)
Algorithmic/pseudo-code approach for logic and coding tasks.

### Blueprint
Structured template for image/video/music generation prompts.

---

> **Note for AI Builders:** This PRD is the authoritative source for all feature requirements, priorities, and acceptance criteria. All implementation work must align with this document.
