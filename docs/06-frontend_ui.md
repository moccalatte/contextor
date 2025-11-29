# 06 — Frontend UI & UX Design

**Product:** CONTEXTOR
**Version:** 1.0
**Last Updated:** 29 Nov 2025

---

## Purpose

This document defines the user interface design, UX patterns, visual style, and interaction flows for CONTEXTOR's frontend.

---

## 1. Design Philosophy

### Core Principles

1. **Ultra Minimal:** No unnecessary elements, maximum clarity
2. **Light Mode Only:** Single, clean color scheme
3. **Monospace Typography:** JetBrains Mono throughout
4. **Emoji-Driven:** Icons replaced with emojis for universal recognition
5. **No Gradients:** Flat, solid colors only
6. **Instant Feedback:** Real-time state changes and loading indicators

### Design Inspiration

- Terminal/command-line aesthetics
- Technical documentation sites
- Brutalist web design
- Plain text editors

---

## 2. Typography

### Font Family

**Primary:** JetBrains Mono (monospace)

**Weights:**
- Regular (400) — Body text
- Medium (500) — Labels, buttons
- Bold (700) — Headings

**Font Sizes:**
```css
--font-size-xs: 12px;   /* Metadata, hints */
--font-size-sm: 14px;   /* Body text */
--font-size-md: 16px;   /* Input, output */
--font-size-lg: 20px;   /* Section headers */
--font-size-xl: 28px;   /* Page title */
```

**Line Heights:**
```css
--line-height-tight: 1.3;  /* Headings */
--line-height-normal: 1.6; /* Body */
--line-height-relaxed: 1.8; /* Output text */
```

---

## 3. Color Palette

### Light Mode Colors

```css
/* Base colors */
--color-bg: #FFFFFF;           /* Page background */
--color-bg-secondary: #F5F5F5; /* Panel background */
--color-bg-tertiary: #E8E8E8;  /* Hover states */

/* Text colors */
--color-text-primary: #1A1A1A;   /* Main text */
--color-text-secondary: #666666; /* Labels, metadata */
--color-text-tertiary: #999999;  /* Hints, placeholders */

/* Accent colors */
--color-accent: #0066FF;        /* Links, active states */
--color-success: #00AA00;       /* Success messages */
--color-error: #DD0000;         /* Error messages */
--color-warning: #FF8800;       /* Warning messages */

/* Border colors */
--color-border: #DDDDDD;        /* Default borders */
--color-border-focus: #0066FF;  /* Focused inputs */
```

---

## 4. Layout Structure

### Overall Page Layout

```
┌─────────────────────────────────────────────────────────┐
│  [Header]                                               │
│  CONTEXTOR                                              │
│  ✍️ 🎨 🎬 🎵                                            │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  [Input Panel]                                          │
│  ┌───────────────────────────────────────────────────┐ │
│  │ Enter your input...                               │ │
│  │                                                   │ │
│  │                                                   │ │
│  └───────────────────────────────────────────────────┘ │
│  [Mode Selection: Default / Mode A / Mode B]          │
│  [✨ Generate]                                          │
│                                                         │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  [Output Panel]                                         │
│  ┌───────────────────────────────────────────────────┐ │
│  │                                                   │ │
│  │  Generated context brief appears here...          │ │
│  │                                                   │ │
│  │                                                   │ │
│  └───────────────────────────────────────────────────┘ │
│  [Format: Text / JSON]  [📋 Copy]                      │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### Responsive Breakpoints

```css
/* Mobile */
@media (max-width: 640px) {
  /* Single column, stacked layout */
}

/* Tablet */
@media (min-width: 641px) and (max-width: 1024px) {
  /* Two-column layout */
}

/* Desktop */
@media (min-width: 1025px) {
  /* Full layout with side panels */
  max-width: 1200px;
  margin: 0 auto;
}
```

---

## 5. Component Design

### 5.1 Header Component

**Visual Design:**
```
┌─────────────────────────────────────────────┐
│ CONTEXTOR                            ⚙️     │
│ Context Engineering Assistant               │
└─────────────────────────────────────────────┘
```

**HTML Structure:**
```html
<header class="header">
  <div class="header-left">
    <h1 class="header-title">CONTEXTOR</h1>
    <p class="header-subtitle">Context Engineering Assistant</p>
  </div>
  <button class="btn-icon" aria-label="Settings">⚙️</button>
</header>
```

**CSS:**
```css
.header {
  padding: 24px;
  border-bottom: 1px solid var(--color-border);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-title {
  font-size: var(--font-size-xl);
  font-weight: 700;
  margin: 0;
  color: var(--color-text-primary);
}

.header-subtitle {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  margin: 4px 0 0 0;
}
```

---

### 5.2 Mode Selector (Emoji Tabs)

**Visual Design:**
```
┌─────────────────────────────────────┐
│ [✍️ Text] [🎨 Image] [🎬 Video] [🎵 Music] │
└─────────────────────────────────────┘
```

**HTML Structure:**
```html
<nav class="mode-selector">
  <button class="mode-btn active" data-mode="text">
    <span class="emoji">✍️</span>
    <span class="label">Text</span>
  </button>
  <button class="mode-btn" data-mode="image">
    <span class="emoji">🎨</span>
    <span class="label">Image</span>
  </button>
  <button class="mode-btn" data-mode="video">
    <span class="emoji">🎬</span>
    <span class="label">Video</span>
  </button>
  <button class="mode-btn" data-mode="music">
    <span class="emoji">🎵</span>
    <span class="label">Music</span>
  </button>
</nav>
```

**CSS:**
```css
.mode-selector {
  display: flex;
  gap: 8px;
  margin-bottom: 24px;
}

.mode-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  background: var(--color-bg-secondary);
  border: 1px solid var(--color-border);
  border-radius: 4px;
  font-family: 'JetBrains Mono', monospace;
  font-size: var(--font-size-sm);
  cursor: pointer;
  transition: all 0.2s ease;
}

.mode-btn:hover {
  background: var(--color-bg-tertiary);
}

.mode-btn.active {
  background: var(--color-accent);
  color: white;
  border-color: var(--color-accent);
}

.mode-btn .emoji {
  font-size: 20px;
}
```

---

### 5.3 Input Panel

**Visual Design:**
```
┌───────────────────────────────────────────┐
│ Enter your input...                       │
│                                           │
│                                           │
│                                           │
│                                           │
└───────────────────────────────────────────┘

Sub-mode: ○ Default  ○ Mode A  ○ Mode B

[✨ Generate]
```

**HTML Structure:**
```html
<div class="input-panel">
  <textarea
    class="input-field"
    placeholder="Enter your input..."
    rows="8"
  ></textarea>

  <div class="sub-mode-selector">
    <label>
      <input type="radio" name="submode" value="default" checked>
      <span>Default</span>
    </label>
    <label>
      <input type="radio" name="submode" value="modeA">
      <span>Mode A (Clarify → Distill)</span>
    </label>
    <label>
      <input type="radio" name="submode" value="modeB">
      <span>Mode B (CoT / PoT)</span>
    </label>
  </div>

  <button class="btn-primary" id="generateBtn">
    <span class="emoji">✨</span>
    <span>Generate</span>
  </button>
</div>
```

**CSS:**
```css
.input-panel {
  margin-bottom: 32px;
}

.input-field {
  width: 100%;
  padding: 16px;
  font-family: 'JetBrains Mono', monospace;
  font-size: var(--font-size-md);
  line-height: var(--line-height-normal);
  border: 1px solid var(--color-border);
  border-radius: 4px;
  resize: vertical;
  min-height: 150px;
}

.input-field:focus {
  outline: none;
  border-color: var(--color-border-focus);
  box-shadow: 0 0 0 3px rgba(0, 102, 255, 0.1);
}

.sub-mode-selector {
  display: flex;
  gap: 16px;
  margin: 16px 0;
  font-size: var(--font-size-sm);
}

.sub-mode-selector label {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}

.btn-primary {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 14px 28px;
  background: var(--color-accent);
  color: white;
  border: none;
  border-radius: 4px;
  font-family: 'JetBrains Mono', monospace;
  font-size: var(--font-size-md);
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-primary:hover {
  background: #0052CC;
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(0, 102, 255, 0.2);
}

.btn-primary:active {
  transform: translateY(0);
}

.btn-primary .emoji {
  font-size: 20px;
}
```

---

### 5.4 Output Panel

**Visual Design:**
```
┌───────────────────────────────────────────┐
│ Generated Context Brief                   │
│                                           │
│ [Output text appears here...]             │
│                                           │
│                                           │
└───────────────────────────────────────────┘

Format: ○ Text  ○ JSON      [📋 Copy]
```

**HTML Structure:**
```html
<div class="output-panel">
  <div class="output-header">
    <h2 class="output-title">Generated Context</h2>
    <div class="output-controls">
      <label>
        <input type="radio" name="format" value="text" checked>
        <span>Text</span>
      </label>
      <label>
        <input type="radio" name="format" value="json">
        <span>JSON</span>
      </label>
    </div>
  </div>

  <div class="output-field">
    <pre id="outputText"></pre>
  </div>

  <div class="output-footer">
    <button class="btn-secondary" id="copyBtn">
      <span class="emoji">📋</span>
      <span>Copy to Clipboard</span>
    </button>
    <span class="copy-feedback" id="copyFeedback"></span>
  </div>
</div>
```

**CSS:**
```css
.output-panel {
  margin-top: 32px;
  border: 1px solid var(--color-border);
  border-radius: 4px;
  background: var(--color-bg);
}

.output-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid var(--color-border);
  background: var(--color-bg-secondary);
}

.output-title {
  font-size: var(--font-size-lg);
  margin: 0;
}

.output-controls {
  display: flex;
  gap: 16px;
  font-size: var(--font-size-sm);
}

.output-field {
  padding: 20px;
  min-height: 200px;
  max-height: 600px;
  overflow-y: auto;
}

.output-field pre {
  font-family: 'JetBrains Mono', monospace;
  font-size: var(--font-size-md);
  line-height: var(--line-height-relaxed);
  white-space: pre-wrap;
  word-wrap: break-word;
  margin: 0;
}

.output-footer {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px 20px;
  border-top: 1px solid var(--color-border);
  background: var(--color-bg-secondary);
}

.btn-secondary {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  background: var(--color-bg);
  border: 1px solid var(--color-border);
  border-radius: 4px;
  font-family: 'JetBrains Mono', monospace;
  font-size: var(--font-size-sm);
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-secondary:hover {
  background: var(--color-bg-tertiary);
}

.copy-feedback {
  font-size: var(--font-size-sm);
  color: var(--color-success);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.copy-feedback.show {
  opacity: 1;
}
```

---

### 5.5 Loading State

**Visual Design:**
```
┌───────────────────────────────────────────┐
│ ⏳ Generating context...                  │
│                                           │
│ [Progress indicator]                      │
└───────────────────────────────────────────┘
```

**HTML Structure:**
```html
<div class="loading-state">
  <span class="emoji">⏳</span>
  <p class="loading-text">Generating context...</p>
  <div class="loading-bar">
    <div class="loading-progress"></div>
  </div>
</div>
```

**CSS:**
```css
.loading-state {
  text-align: center;
  padding: 40px;
}

.loading-state .emoji {
  font-size: 48px;
  display: block;
  margin-bottom: 16px;
  animation: pulse 1.5s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.loading-text {
  font-size: var(--font-size-md);
  color: var(--color-text-secondary);
  margin-bottom: 20px;
}

.loading-bar {
  width: 200px;
  height: 4px;
  background: var(--color-bg-secondary);
  border-radius: 2px;
  margin: 0 auto;
  overflow: hidden;
}

.loading-progress {
  height: 100%;
  background: var(--color-accent);
  animation: loading 1.5s ease-in-out infinite;
}

@keyframes loading {
  0% { width: 0%; margin-left: 0%; }
  50% { width: 50%; margin-left: 25%; }
  100% { width: 0%; margin-left: 100%; }
}
```

---

### 5.6 Mode A — Clarification Questions UI

**Visual Design:**
```
┌───────────────────────────────────────────┐
│ Clarifying Questions                      │
│                                           │
│ 1. What is the main goal?                │
│    [Answer input...]                      │
│                                           │
│ 2. Who are the target users?             │
│    [Answer input...]                      │
│                                           │
│ [✨ Generate Context]                     │
└───────────────────────────────────────────┘
```

**HTML Structure:**
```html
<div class="questions-panel">
  <h3 class="questions-title">Clarifying Questions</h3>
  <form id="questionsForm">
    <div class="question-item">
      <label class="question-label">1. What is the main goal?</label>
      <textarea class="answer-input" rows="3"></textarea>
    </div>
    <div class="question-item">
      <label class="question-label">2. Who are the target users?</label>
      <textarea class="answer-input" rows="3"></textarea>
    </div>
    <!-- More questions dynamically generated -->
    <button type="submit" class="btn-primary">
      <span class="emoji">✨</span>
      <span>Generate Context</span>
    </button>
  </form>
</div>
```

**CSS:**
```css
.questions-panel {
  padding: 24px;
  background: var(--color-bg-secondary);
  border-radius: 4px;
  margin: 24px 0;
}

.questions-title {
  font-size: var(--font-size-lg);
  margin: 0 0 20px 0;
}

.question-item {
  margin-bottom: 24px;
}

.question-label {
  display: block;
  font-size: var(--font-size-md);
  font-weight: 500;
  margin-bottom: 8px;
  color: var(--color-text-primary);
}

.answer-input {
  width: 100%;
  padding: 12px;
  font-family: 'JetBrains Mono', monospace;
  font-size: var(--font-size-sm);
  border: 1px solid var(--color-border);
  border-radius: 4px;
  resize: vertical;
}
```

---

## 6. Interaction Patterns

### 6.1 Mode Switching

**Behavior:**
1. User clicks emoji tab (✍️, 🎨, 🎬, or 🎵)
2. Active tab highlights with accent color
3. Input placeholder text updates to mode-specific hint
4. Output panel clears (with confirmation if there's existing output)

**Example Placeholders:**
- Text: "Enter your text context request..."
- Image: "Describe the image you want to generate..."
- Video: "Describe the video scene..."
- Music: "Describe the music you want to create..."

---

### 6.2 Generate Button Flow

**Default/Mode B:**
```
User clicks "✨ Generate"
    ↓
Button disabled, shows loading state
    ↓
API call to /api/generate
    ↓
Output appears in output panel
    ↓
Button re-enabled
```

**Mode A:**
```
User clicks "✨ Generate" (Stage 1)
    ↓
Questions appear below input
    ↓
User fills answers
    ↓
User clicks "✨ Generate Context" (Stage 2)
    ↓
API call to distill
    ↓
Final context appears in output panel
```

---

### 6.3 Copy to Clipboard

**Behavior:**
```javascript
document.getElementById('copyBtn').addEventListener('click', async () => {
  const outputText = document.getElementById('outputText').textContent;

  try {
    await navigator.clipboard.writeText(outputText);

    // Show success feedback
    const feedback = document.getElementById('copyFeedback');
    feedback.textContent = '✓ Copied!';
    feedback.classList.add('show');

    setTimeout(() => {
      feedback.classList.remove('show');
    }, 2000);

  } catch (err) {
    console.error('Copy failed:', err);
    feedback.textContent = '✗ Copy failed';
    feedback.classList.add('show');
  }
});
```

---

### 6.4 Format Toggle (Text/JSON)

**Behavior:**
```javascript
document.querySelectorAll('input[name="format"]').forEach(radio => {
  radio.addEventListener('change', (e) => {
    const format = e.target.value;
    const outputElement = document.getElementById('outputText');

    if (format === 'json') {
      // Display JSON format if available
      const jsonData = window.currentOutputJSON;
      if (jsonData) {
        outputElement.textContent = JSON.stringify(jsonData, null, 2);
      }
    } else {
      // Display text format
      outputElement.textContent = window.currentOutputText;
    }
  });
});
```

---

## 7. Responsive Design

### Mobile View (< 640px)

- Single column layout
- Mode selector stacked vertically
- Emoji tabs become full-width buttons
- Reduced padding and font sizes
- Input/output panels stack

### Tablet View (641px - 1024px)

- Two-column layout where applicable
- Emoji tabs remain horizontal
- Slightly reduced margins

### Desktop View (> 1024px)

- Full layout as designed
- Maximum width: 1200px centered
- Generous whitespace

---

## 8. Accessibility

### Keyboard Navigation

- Tab order: Header → Mode selector → Input → Sub-mode → Generate → Output → Copy
- Enter key submits forms
- Escape key clears modals/overlays

### ARIA Labels

```html
<button aria-label="Generate context from input">✨ Generate</button>
<button aria-label="Copy output to clipboard">📋 Copy</button>
<textarea aria-label="Input text for context generation"></textarea>
```

### Screen Reader Support

- All interactive elements have descriptive labels
- Loading states announced via `aria-live` regions
- Error messages announced immediately

---

## 9. Error States

### Error Message Display

```html
<div class="error-message">
  <span class="emoji">⚠️</span>
  <p class="error-text">Something went wrong. Please try again.</p>
</div>
```

**CSS:**
```css
.error-message {
  padding: 16px 20px;
  background: #FFF0F0;
  border: 1px solid var(--color-error);
  border-radius: 4px;
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 16px 0;
}

.error-message .emoji {
  font-size: 24px;
}

.error-text {
  color: var(--color-error);
  margin: 0;
  font-size: var(--font-size-sm);
}
```

---

## 10. Animation & Transitions

### Subtle Transitions

```css
/* Smooth state changes */
* {
  transition: background-color 0.2s ease,
              border-color 0.2s ease,
              color 0.2s ease,
              transform 0.2s ease;
}

/* Hover effects */
button:hover {
  transform: translateY(-1px);
}

button:active {
  transform: translateY(0);
}

/* Fade in animations */
.fade-in {
  animation: fadeIn 0.3s ease-in;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
```

---

## Cross-References

- [01-context.md](01-context.md) — Project overview
- [03-prd.md](03-prd.md) — Product requirements
- [04-architecture.md](04-architecture.md) — System architecture
- [05-worker_logic.md](05-worker_logic.md) — Backend API logic
- [07-prompt_templates.md](07-prompt_templates.md) — AI prompt templates

---

> **Note for AI Builders:** This UI is designed for maximum clarity and minimum friction. Every element serves a purpose. Follow these patterns to maintain consistency.
