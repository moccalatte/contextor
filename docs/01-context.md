# Project Context & Specification

**Product Codename:** CONTEXTOR

---

## 1. Overview

CONTEXTOR is a web-based **Context Engineering Assistant** that generates **context-engineered briefs** for various use cases:

- Text context
- Image context
- Video context
- Music context

CONTEXTOR **does not run AI reasoning** — it prepares optimal context (briefs) so users can copy-paste them into any AI provider (Gemini, ChatGPT, Claude, Midjourney, Runway, Suno, etc.).

**Focus:** Context engineering, not basic prompting.

---

## 2. Core Modes

### 2.1 Default Text Mode — Instant Context

- User enters free-form input
- System immediately generates a context-engineered text brief
- Default output: text
- Optional format: JSON

Used for quick queries or lightweight exploration.

---

### 2.2 Mode A — Clarify → Distill → Context Brief

Used for large tasks: research, planning, system design, coding, strategy, etc.

#### Stage 1 — Clarification

- User provides raw input
- Gemini 2.5 Flash generates clarifying questions
- User answers the questions

#### Stage 2 — Distillation

- Questions + answers → sent to Gemini (Gemini 2.5 Flash) via CF AI Gateway
- Gemini produces a **distilled context**

#### Stage 3 — Context Brief

- Brief is flexible (not rigidly structured)
- User copy-pastes to their AI provider of choice

---

### 2.3 Mode B — CoT → PoT (Reasoning Mode)

Used for analysis, pattern breakdown, coding-level reasoning, strategy.

#### CoT (Chain of Thought)

- Step-by-step reasoning
- For detailed analysis

#### PoT (Program of Thought)

- Pseudo-code / algorithmic approach
- For coding and logic tasks

**Best Practice:**

- Large tasks → use Mode A first, then Mode B
- Small tasks → Mode B can be used standalone

---

## 3. Image Context Generator — Structured Visual Blueprint

For: Midjourney, SDXL, Flux, Nano Banana, Pika Image, etc.

### Blueprint Format

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

**Output:** text + JSON

---

## 4. Video Context Generator — Cinematic Breakdown

For: Runway Gen-3, Pika, VEO, Luma Ray, Kling, etc.

### Blueprint Format

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

**Output:** text + JSON

---

## 5. Music Context Generator — Structural Music Blueprint

For: Suno, Udio, Noisee, MusicGen, etc.

### Blueprint Format

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

**Output:** text + JSON

---

## 6. Technical Pipeline

### Primary Flow

1. **All Modes** → Gemini 2.5 Flash (primary AI)
2. **Fallback** → OpenRouter (GLM-4.5-Air) if Gemini fails
3. **Output** → User copy-pastes to AI provider

### Fallback Logic

- If Gemini 2.5 Flash errors → fallback to OpenRouter (GLM-4.5-Air)
- Users cannot select models manually

### Infrastructure

- **Cloudflare Pages** (UI)
- **Cloudflare Workers** (backend logic)
- **CF AI Gateway** (API routing)

No user API keys required.

---

## 7. UI/UX Philosophy

### Visual Style

- Light mode only
- Ultra minimal design
- No gradients
- Monospace typography (JetBrains Mono)

### Emoji-Driven UX

- Text: ✍️
- Image: 🎨
- Video: 🎬
- Music: 🎵
- Compile: ✨
- Copy: 📋
- Settings: ⚙️

### Interaction Patterns

- Simple Input → Output Panel
- Mode A/B only appear when selected
- Single output field (clean interface)

---

## 8. Technical Assumptions

- Free AI providers only (Gemini 2.5 Flash primary, OpenRouter GLM-4.5-Air fallback)
- Workers execution not limited like AppScript
- All blueprint outputs are text-based + optional JSON
- JSON schema is flexible
- No heavy inference
- MVP-ready but future expandable

---

## 9. Deliverables

The following documentation should be built based on this context:

1. **03-prd.md** — Product Requirements Document
2. **04-architecture.md** — System Architecture
3. **05-worker_logic.md** — API & Worker Flow
4. **06-frontend_ui.md** — UI Wireframes + UX Rules
5. **07-prompt_templates.md** — Templates for All Modes
6. **08-future_expansions.md** — Next Features

---

## 10. Glossary of Techniques

Understanding each technique used in CONTEXTOR:

### Clarify → Distill → Context Brief

- **Clarify:** Generate important questions
- **Distill:** Summarize answers into context
- **Brief:** Production-ready document

### Chain-of-Thought (CoT)

- Structured step-by-step reasoning

### Program-of-Thought (PoT)

- Reasoning based on pseudo-code / algorithms

### Structured Visual Blueprint

- Structured format for image generation models

### Cinematic Breakdown

- Structured format for video prompting

### Structural Music Blueprint

- Structured format for generative music
