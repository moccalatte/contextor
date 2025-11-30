# Mode A & B Implementation Guide

**Product:** CONTEXTOR  
**Version:** 1.2.0  
**Last Updated:** 30 Nov 2025

---

## Overview

CONTEXTOR provides two advanced modes beyond the default text processing:

- **Mode A (Clarify & Distill):** Two-stage interactive workflow for complex tasks
- **Mode B (CoT/PoT):** Reasoning-focused output using Chain-of-Thought or Program-of-Thought methodologies

This guide explains how these modes work, when to use them, and their implementation details.

---

## Mode A: Clarify & Distill 🔍

### Purpose

Mode A is designed for **large, complex tasks** that benefit from structured clarification before context generation. Examples include:

- Research projects
- System architecture design
- Strategic planning
- Complex coding tasks
- Business analysis

### How It Works

Mode A uses a **two-stage workflow**:

#### Stage 1: Clarify (Generate Questions)

1. User enters raw, unstructured input
2. System sends request to backend with `stage: "clarify"`
3. Backend calls AI to generate 3-7 focused, specific questions
4. Questions are returned and displayed to user

**Example Questions:**
```
1. What is the core objective and desired outcome of this project?
2. Who is the target audience or user base?
3. What are the key technical constraints or requirements?
4. What is the expected timeline or milestones?
5. Are there any existing systems or dependencies to consider?
```

#### Stage 2: Distill (Synthesize Context)

1. User answers **ALL questions in ONE text box** (not separately)
2. User can format answers as:
   - Numbered list: `1. answer, 2. answer, 3. answer...`
   - Line-by-line: Each answer on a new line
   - Paragraph format: Separated by double newlines
3. Frontend parses the answers and sends both questions and answers to backend
4. Backend synthesizes a comprehensive, production-ready context brief
5. Final output is NOT in Q&A format — it's a cohesive narrative

**Key Features:**
- User answers in **1 box** (not 5-7 separate inputs)
- Frontend intelligently parses numbered or line-separated answers
- Backend distills into a unified, well-structured brief

### API Request Format

#### Clarify Request

```json
{
  "mode": "text",
  "subMode": "modeA",
  "stage": "clarify",
  "input": "I want to build a SaaS platform for project management"
}
```

#### Clarify Response

```json
{
  "success": true,
  "mode": "text",
  "subMode": "modeA",
  "stage": "clarify",
  "questions": [
    "What is your target market segment?",
    "What features differentiate your platform?",
    "What is your technical stack preference?",
    "What is your go-to-market timeline?",
    "What integrations are critical?"
  ],
  "metadata": {
    "provider": "gemini",
    "model": "gemini-2.5-flash",
    "fallbackUsed": false
  }
}
```

#### Distill Request

```json
{
  "mode": "text",
  "subMode": "modeA",
  "stage": "distill",
  "questions": [
    "What is your target market segment?",
    "What features differentiate your platform?",
    "..."
  ],
  "answers": [
    "Small to mid-size creative agencies (10-50 employees)",
    "Real-time collaboration, visual project timelines, AI-powered task suggestions",
    "..."
  ]
}
```

#### Distill Response

```json
{
  "success": true,
  "mode": "text",
  "subMode": "modeA",
  "stage": "distill",
  "output": "# SaaS Project Management Platform for Creative Agencies\n\n## Target Market\nSmall to mid-size creative agencies...",
  "metadata": {
    "provider": "gemini",
    "model": "gemini-2.5-flash",
    "fallbackUsed": false
  }
}
```

### Frontend Implementation

**UI Flow:**

1. User selects "Mode A (Clarify & Distill)" radio button
2. User enters initial input and clicks "Generate"
3. Questions panel appears with all questions displayed
4. Input field clears and placeholder changes to: _"Answer all questions above..."_
5. Button text changes to: **"💫 Distill Context"**
6. User types all answers in one box
7. User clicks "Distill Context"
8. Final brief is displayed in output panel

**Answer Parsing Logic:**

The frontend uses `parseAnswers()` function with fallback logic:

1. **Try numbered format:** Match `1. answer`, `2. answer`, etc.
2. **Fallback to paragraph split:** Split by double newlines (`\n\n`)
3. **Final fallback:** Split by single newlines (`\n`)
4. **Padding:** If fewer answers than questions, pad with empty strings

```javascript
function parseAnswers(text, expectedCount) {
  // Try numbered format first
  const numberedMatches = text.match(/^\s*\d+[\.)]\s*(.+?)(?=\s*\d+[\.)]\s*|$)/gms);
  
  if (numberedMatches && numberedMatches.length >= expectedCount) {
    return numberedMatches.map(match => 
      match.replace(/^\s*\d+[\.)]\s*/, '').trim()
    ).slice(0, expectedCount);
  }
  
  // Fallback: split by double newline or single newline
  let answers = text.split(/\n\n+/).map(a => a.trim()).filter(a => a.length > 0);
  
  if (answers.length < expectedCount) {
    answers = text.split(/\n+/).map(a => a.trim()).filter(a => a.length > 0);
  }
  
  while (answers.length < expectedCount) {
    answers.push('');
  }
  
  return answers.slice(0, expectedCount);
}
```

### Token Limits

| Stage | Max Tokens | Rationale |
|-------|-----------|-----------|
| Clarify | 1000 | Enough for 3-7 detailed questions |
| Distill | **8192** | Maximum comprehensive synthesis |

**Note:** Token limits were **drastically increased** in v1.2.0 to allow maximum output quality without artificial truncation.

---

## Mode B: CoT / PoT 🧠

### Purpose

Mode B applies **reasoning methodologies** to the user's input. It's ideal for:

- Analysis tasks
- Pattern recognition
- Coding challenges
- Logic problems
- Strategy breakdown

### Two Sub-Modes

#### Chain-of-Thought (CoT)

**Description:** Step-by-step reasoning with detailed explanations.

**Best For:**
- Problem analysis
- Decision-making processes
- Complex explanations
- Research breakdowns

**Output Structure:**
1. Understand the Problem/Task
2. Identify Key Components
3. Reason Through Step-by-Step
4. Synthesize Conclusion

**Example Output:**
```
### 1. Understand the Problem

The user wants to optimize database query performance for a SaaS app 
with 100k+ daily active users...

### 2. Identify Key Components

- Current database: PostgreSQL
- Main bottleneck: Complex JOIN queries on user_events table
- Average query time: 2-3 seconds (target: <500ms)
...

### 3. Step-by-Step Reasoning

Step 1: Analyze the query execution plan...
Step 2: Identify missing indexes...
Step 3: Consider denormalization trade-offs...
...

### 4. Conclusion

Recommended approach: Implement composite indexes on (user_id, timestamp)...
```

#### Program-of-Thought (PoT)

**Description:** Algorithmic, pseudo-code-based reasoning.

**Best For:**
- Coding tasks
- Algorithm design
- Technical specifications
- Logic flow design

**Output Structure:**
1. Define Inputs and Outputs
2. Outline the Algorithm
3. Write Pseudo-Code or Structured Logic
4. Explain Key Decisions

**Example Output:**
```
### 1. Inputs and Outputs

INPUT: User query text, database connection
OUTPUT: Optimized query with execution plan

### 2. Algorithm Outline

FUNCTION optimizeQuery(query, db):
  - Parse query AST
  - Identify JOIN operations
  - Check for existing indexes
  - Generate index recommendations
  - Return optimized query

### 3. Pseudo-Code

```
function optimizeQuery(query, db) {
  // Step 1: Parse and analyze
  let ast = parseSQL(query);
  let tables = extractTables(ast);
  let joins = extractJoins(ast);
  
  // Step 2: Check indexes
  let existingIndexes = db.getIndexes(tables);
  let missingIndexes = identifyMissingIndexes(joins, existingIndexes);
  
  // Step 3: Generate recommendations
  let recommendations = [];
  for (let index of missingIndexes) {
    recommendations.push({
      table: index.table,
      columns: index.columns,
      type: index.type,
      impact: estimateImpact(index)
    });
  }
  
  // Step 4: Apply optimizations
  let optimizedQuery = applyOptimizations(query, recommendations);
  
  return {
    originalQuery: query,
    optimizedQuery: optimizedQuery,
    recommendations: recommendations,
    estimatedSpeedup: calculateSpeedup(recommendations)
  };
}
```

### 4. Key Decisions

- Use composite indexes instead of single-column (better selectivity)
- Avoid index on low-cardinality columns (e.g., boolean flags)
- Prioritize indexes on JOIN and WHERE clause columns
```
```

### API Request Format

```json
{
  "mode": "text",
  "subMode": "cot",  // or "pot"
  "input": "How can I optimize database queries for a high-traffic SaaS application?"
}
```

### Response Format

```json
{
  "success": true,
  "mode": "text",
  "subMode": "cot",
  "output": "### 1. Understand the Problem\n\nThe user wants to...",
  "metadata": {
    "provider": "gemini",
    "model": "gemini-2.5-flash",
    "fallbackUsed": false
  }
}
```

### Token Limits

| Mode | Max Tokens | Rationale |
|------|-----------|-----------|
| CoT | **8192** | Detailed step-by-step reasoning |
| PoT | **8192** | Comprehensive pseudo-code + explanations |

**Note:** Both modes use maximum token limits to ensure thorough, untruncated reasoning output.

---

## When to Use Which Mode

| Scenario | Recommended Mode |
|----------|------------------|
| Quick context generation | Default Mode |
| Complex project planning | Mode A (Clarify & Distill) |
| Research task with unclear scope | Mode A |
| Problem analysis | Mode B (CoT) |
| Algorithm design | Mode B (PoT) |
| Coding task breakdown | Mode B (PoT) |
| Strategic decision-making | Mode B (CoT) |
| Large-scale system design | Mode A first, then Mode B |

### Combining Modes

**Best Practice:** For very large, complex tasks:

1. **Start with Mode A** to clarify scope and requirements
2. **Use Mode B** on the distilled output to reason through implementation

**Example Workflow:**

```
User Input (Mode A Clarify):
"Build a real-time chat application"

Questions Generated:
1. What scale (users, messages/sec)?
2. What features (DMs, groups, media)?
3. Tech stack preferences?
...

User Answers → Mode A Distill:
[Comprehensive project brief generated]

Take output → Mode B (PoT):
[Algorithmic breakdown with pseudo-code for WebSocket handling, 
message queuing, data structure design, etc.]
```

---

## Implementation Details

### Backend (Worker)

**File:** `worker/index.js`

**Key Functions:**

- `processModeA(body, env)` — Routes to clarify or distill
- `processModeAClarify(body, env)` — Generates questions
- `processModeADistill(body, env)` — Synthesizes final brief
- `processModeB(body, env)` — Handles CoT and PoT reasoning

**Validation:**

```javascript
// Mode A validation
if (subMode === "modeA") {
  const validStages = ["clarify", "distill"];
  if (!stage || !validStages.includes(stage)) {
    return { valid: false, error: "Mode A requires valid stage" };
  }
  
  if (stage === "distill") {
    if (!body.questions || !body.answers) {
      return { valid: false, error: "Distill requires questions and answers" };
    }
    if (!Array.isArray(body.questions) || !Array.isArray(body.answers)) {
      return { valid: false, error: "Questions and answers must be arrays" };
    }
    if (body.questions.length !== body.answers.length) {
      return { valid: false, error: "Question/answer count mismatch" };
    }
  }
}
```

### Frontend (UI)

**File:** `public/app.js`

**State Management:**

```javascript
const state = {
  currentMode: "text",
  currentSubMode: "default",  // "default", "modeA", "cot", "pot"
  modeAStage: null,            // null, "clarify", or "distill"
  modeAQuestions: [],          // Stored questions from clarify stage
  ...
};
```

**Mode A Flow Functions:**

- `handleModeA(input)` — Entry point for Mode A
- `modeAClarify(input)` — Stage 1: Get questions
- `modeADistill(answersText)` — Stage 2: Synthesize context
- `displayQuestions(questions)` — Render questions panel
- `parseAnswers(text, expectedCount)` — Parse user answers

---

## Error Handling

### Mode A Specific Errors

| Error | Cause | Solution |
|-------|-------|----------|
| "Invalid Mode A stage" | Missing or invalid `stage` parameter | Ensure `stage` is "clarify" or "distill" |
| "Missing questions/answers" | Distill stage without required data | Verify questions array and answers array are present |
| "Question/answer mismatch" | Different array lengths | Parse answers to match question count |
| "No questions found" | Stage state lost | Restart Mode A flow from beginning |

### Mode B Specific Errors

| Error | Cause | Solution |
|-------|-------|----------|
| "Invalid subMode" | Not "cot" or "pot" | Check radio button value |
| "Empty input" | No user input provided | Validate input before submission |

---

## Testing Checklist

### Mode A

- [ ] Clarify stage generates 3-7 questions
- [ ] Questions are relevant to input domain
- [ ] Questions panel displays correctly
- [ ] Input placeholder updates after clarify
- [ ] Button text changes to "Distill Context"
- [ ] Numbered answers are parsed correctly
- [ ] Line-separated answers are parsed correctly
- [ ] Distill stage produces cohesive brief (not Q&A format)
- [ ] Final output is comprehensive and well-structured
- [ ] Mode A state resets when switching modes
- [ ] Mode A state resets when switching submodes

### Mode B

- [ ] CoT mode produces step-by-step reasoning
- [ ] PoT mode produces pseudo-code format
- [ ] Output includes all required sections
- [ ] Reasoning is logical and detailed
- [ ] Token limit allows complete output (no truncation)
- [ ] Switching between CoT and PoT works correctly

---

## Performance Metrics

### Expected Response Times

| Operation | Target | Notes |
|-----------|--------|-------|
| Mode A Clarify | < 4s | Question generation |
| Mode A Distill | < 8s | Complex synthesis with high token count |
| Mode B (CoT) | < 6s | Detailed reasoning |
| Mode B (PoT) | < 6s | Pseudo-code generation |

### Token Consumption

| Mode | Avg Input Tokens | Avg Output Tokens | Total |
|------|------------------|-------------------|-------|
| Mode A Clarify | 100-200 | 300-500 | ~500-700 |
| Mode A Distill | 500-1000 | 2000-4000 | ~2500-5000 |
| Mode B (CoT) | 100-300 | 2000-4000 | ~2100-4300 |
| Mode B (PoT) | 100-300 | 2000-4000 | ~2100-4300 |

**Note:** High output token usage is intentional to ensure comprehensive, production-ready context generation.

---

## Future Enhancements

### Planned Improvements

1. **Mode A:**
   - Auto-save questions/answers to localStorage
   - Allow editing/refining questions before answering
   - Add "skip question" option
   - Support multi-turn clarification (iterative refinement)

2. **Mode B:**
   - Add "Hybrid CoT+PoT" mode
   - Visual diagram generation for PoT outputs
   - Step-by-step execution preview

3. **General:**
   - Mode comparison view (run multiple modes side-by-side)
   - Export mode outputs to markdown/PDF with metadata
   - Mode usage analytics and recommendations

---

## Cross-References

- [03-prd.md](03-prd.md) — Product requirements for Mode A and B
- [07-prompt_templates.md](07-prompt_templates.md) — AI prompt templates for all modes
- [05-worker_logic.md](05-worker_logic.md) — Backend implementation details
- [06-frontend_ui.md](06-frontend_ui.md) — UI design and interaction patterns

---

> **Developer Note:** Mode A and Mode B are P0 MVP features. Ensure all validation, error handling, and UI flows are thoroughly tested before deployment. Token limits have been maximized to prioritize output quality over cost optimization.