# ⚡ CONTEXTOR v1.3.1 - Quick Reference Guide

**Last Updated:** 2025-11-30  
**Version:** 1.3.1

---

## 🚀 Quick Start (5 Minutes)

### 1. Choose AI Provider

| Provider | Speed | Quality | Output Limit | Best For |
|----------|-------|---------|--------------|----------|
| **Gemini** | 🟢 Fast | 🟢🟢🟢 Excellent | 65K tokens | Comprehensive briefs |
| **Groq** | 🟢🟢🟢 Ultra Fast | 🟢🟢 Good | 8K tokens | Quick iterations |
| **OpenRouter** | 🟢 Moderate | 🟢🟢 Good | 4K tokens | Fallback/diversity |

**Recommendation:** Start with **Gemini 2.5 Flash** for best results.

---

### 2. Select Model

**Gemini:**
- `gemini-2.5-flash` - Only option, excellent quality

**Groq (3 options):**
- `moonshotai/kimi-k2-instruct` - Balanced
- `meta-llama/llama-4-maverick-17b-128e-instruct` - Fast, good reasoning
- `openai/gpt-oss-120b` - Largest, comprehensive

**OpenRouter:**
- `z-ai/glm-4.5-air:free` - Free tier default

---

### 3. Choose Mode

| Mode | Icon | When to Use | Example |
|------|------|-------------|---------|
| **Text** | ✍️ | General context | "Explain blockchain to beginners" |
| **Image** | 🎨 | Visual generation | "Cyberpunk city at night" |
| **Video** | 🎬 | Cinematic scenes | "Drone shot of ocean sunset" |
| **Music** | 🎵 | Song creation | "Upbeat pop song about summer" |

---

### 4. Choose Reasoning Technique (Text Mode Only)

| Technique | Best For | Output Style |
|-----------|----------|--------------|
| **Default** | Quick requests | Standard context |
| **Clarify & Distill** | Complex projects | Questions → Synthesis |
| **CoT** | Logical analysis | Step-by-step reasoning |
| **PoT** | Coding tasks | Pseudo-code + algorithms |
| **Tree of Thoughts** | Multiple solutions | Branch evaluation |
| **ReAct** | Debugging | Thought → Action → Observation |

---

## 📋 Mode Comparison Chart

### Text Mode Sub-Modes

```
INPUT: "Build a SaaS product"

┌─────────────────────────────────────────────────────────────┐
│ Default                                                      │
├─────────────────────────────────────────────────────────────┤
│ Output: Direct context brief about SaaS product             │
│ Time: ~2-3 seconds                                          │
│ Use: Simple, straightforward requests                       │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ Clarify & Distill (ENHANCED in v1.3.1)                      │
├─────────────────────────────────────────────────────────────┤
│ Step 1: Generates 10-15 comprehensive questions             │
│ Step 2: Questions appear IN input box with Answer: fields   │
│ Step 3: Fill answers next to "Answer:" for each question    │
│ Step 4: Synthesizes comprehensive brief with context        │
│ Time: ~10-15 seconds total                                  │
│ Use: Large projects, unclear scope, complex requirements    │
│ Fixed: No more "Input is required" errors!                  │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ CoT (Chain-of-Thought)                                      │
├─────────────────────────────────────────────────────────────┤
│ Output:                                                      │
│ 1. Understand the Problem                                   │
│ 2. Identify Key Components                                  │
│ 3. Reason Through Step-by-Step                              │
│ 4. Synthesize Conclusion                                    │
│ Time: ~4-6 seconds                                          │
│ Use: Analysis, decision-making, explanations                │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ PoT (Program-of-Thought)                                    │
├─────────────────────────────────────────────────────────────┤
│ Output:                                                      │
│ 1. Define Inputs/Outputs                                    │
│ 2. Outline Algorithm                                        │
│ 3. Write Pseudo-Code                                        │
│ 4. Explain Key Decisions                                    │
│ Time: ~4-6 seconds                                          │
│ Use: Coding, algorithm design, technical specs              │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ Tree of Thoughts (NEW in v1.3.0)                            │
├─────────────────────────────────────────────────────────────┤
│ Output:                                                      │
│ 1. Multiple Thought Branches (3-5 paths)                    │
│ 2. Evaluation of Each Branch                                │
│ 3. Selected Optimal Path                                    │
│ 4. Final Solution                                           │
│ Time: ~5-8 seconds                                          │
│ Use: Complex problems, strategic planning, architecture     │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ ReAct (NEW in v1.3.0)                                       │
├─────────────────────────────────────────────────────────────┤
│ Output:                                                      │
│ Thought 1 → Action 1 → Observation 1 →                      │
│ Thought 2 → Action 2 → Observation 2 →                      │
│ ... → Final Answer                                          │
│ Time: ~5-8 seconds                                          │
│ Use: Debugging, troubleshooting, iterative tasks            │
└─────────────────────────────────────────────────────────────┘
```

---

## 🎯 Decision Tree: Which Mode/Technique to Use?

```
START: What do you need?
│
├─ 📝 Text context?
│  │
│  ├─ Simple request → Default Mode
│  │
│  ├─ Complex project, unclear scope → Clarify & Distill
│  │
│  ├─ Need logical reasoning → CoT
│  │
│  ├─ Need algorithm/code → PoT
│  │
│  ├─ Need to explore multiple solutions → Tree of Thoughts
│  │
│  └─ Need iterative problem-solving → ReAct
│
├─ 🎨 Image prompt?
│  └─ Image Mode → Get structured visual blueprint
│
├─ 🎬 Video prompt?
│  └─ Video Mode → Get cinematic breakdown with timeline
│
└─ 🎵 Music prompt?
   └─ Music Mode → Get complete music blueprint
```

---

## ⚡ Keyboard Shortcuts

| Action | Shortcut |
|--------|----------|
| Focus input | `Alt + I` |
| Generate | `Alt + G` or `Enter` (in input field) |
| Copy output | `Alt + C` |
| Settings | `Alt + S` |
| Clear output | `Esc` |

*(Note: Shortcuts may vary by browser)*

---

## 🔧 Provider Selection Guide

### When to Switch Providers

**Use Gemini when:**
- ✅ You need maximum output length (65K tokens)
- ✅ Quality is top priority
- ✅ Comprehensive, detailed briefs needed
- ✅ Default choice for most use cases

**Use Groq when:**
- ✅ Speed is critical (0.5-1.5s response!)
- ✅ Quick iterations needed
- ✅ Real-time demos
- ✅ Testing multiple variations quickly

**Use OpenRouter when:**
- ✅ Gemini/Groq are unavailable
- ✅ Want to try different models
- ✅ Need fallback reliability

---

## 📊 Input Length Limits

| Mode | Max Characters | Reason |
|------|---------------|--------|
| Default Text | 3,000 | Balanced quality/speed |
| Clarify & Distill | 1,000 | Prevents MAX_TOKENS |
| CoT/PoT/Tree/ReAct | 2,500 | Complex reasoning |
| Image/Video/Music | 2,000 | Structured output |

**Tip:** If input too long, use Clarify & Distill mode to break it down.

---

## 🎨 Output Format Options

### Text Mode
- **Text** (default) - Clean, readable format
- **JSON** - Structured data (for image/video/music only)

### When to Use JSON
- ✅ Programmatic processing
- ✅ API integration
- ✅ Structured data needed
- ✅ Copy to other tools

---

## 🚨 Common Errors & Quick Fixes

| Error Message | Cause | Quick Fix |
|---------------|-------|-----------|
| "Input too long..." | Input exceeds limit | Shorten input or use Clarify & Distill |
| "All AI providers failed" | API keys invalid/missing | Check API keys in .dev.vars |
| "Request timeout" | Slow connection/server | Retry or switch provider |
| "Rate limit exceeded" | Too many requests | Wait 1-2 minutes, try again |
| "Input is required" | Empty input field | Enter some text |

---

## 💡 Pro Tips

### 1. Optimize Input
```
❌ Bad: "make a song"
✅ Good: "Create an upbeat pop song about summer vacation 
         with catchy chorus and electronic beats"
```

### 2. Use Clarify & Distill for Complex Tasks
```
Input: "Build a SaaS platform"
↓
Questions generated automatically
↓
Answer questions
↓
Comprehensive brief ready!
```

### 3. Experiment with Providers
- Try same prompt with different providers
- Compare speed vs. quality
- Find your preferred provider

### 4. Leverage Reasoning Modes
```
Problem: "Optimize database queries"

CoT → Logical analysis
PoT → Algorithm design
Tree → Multiple optimization strategies
ReAct → Step-by-step debugging
```

### 5. Copy Output Immediately
- Click 📋 Copy button
- Paste to your AI tool (ChatGPT, Claude, etc.)
- Iterate based on results

---

## 🔍 Example Workflows

### Workflow 1: Quick Text Context
```
1. Select: Gemini 2.5 Flash
2. Mode: Text (Default)
3. Input: "Explain quantum computing for beginners"
4. Click: ✨ Generate
5. Wait: ~2-3 seconds
6. Click: 📋 Copy
7. Paste: Into ChatGPT/Claude
```

### Workflow 2: Complex Project (Clarify & Distill)
```
1. Select: Gemini 2.5 Flash
2. Mode: Text → Clarify & Distill
3. Input: "Build a mobile app for fitness tracking"
4. Click: ✨ Generate
5. Wait: ~3-4 seconds
6. See: Questions appear in input box
7. Fill: Answers next to each "Answer:"
8. Click: 💫 Distill Context
9. Wait: ~6-8 seconds
10. Click: 📋 Copy
11. Paste: Complete brief ready!
```

### Workflow 3: Image Generation Prompt
```
1. Select: Groq (for speed)
2. Mode: 🎨 Image
3. Input: "Cyberpunk city at night with neon rain"
4. Click: ✨ Generate
5. Wait: ~1-2 seconds (Groq is fast!)
6. Toggle: JSON format (optional)
7. Click: 📋 Copy
8. Paste: Into Midjourney/DALL-E
```

### Workflow 4: Debugging with ReAct
```
1. Select: Gemini 2.5 Flash
2. Mode: Text → ReAct
3. Input: "Debug memory leak in Node.js application"
4. Click: ✨ Generate
5. Wait: ~5-8 seconds
6. Output: Thought → Action → Observation cycle
7. Click: 📋 Copy
8. Use: Iterative debugging guide
```

---

## 📈 Performance Benchmarks

### Response Time by Provider
```
Groq:        ████░░░░░░ 0.5-1.5s (fastest!)
Gemini:      ██████░░░░ 1-3s
OpenRouter:  ████████░░ 2-4s
```

### Output Quality
```
Gemini:      ██████████ 10/10
Groq:        ████████░░ 8/10
OpenRouter:  ████████░░ 8/10
```

### Output Length
```
Gemini:      ██████████ 65K tokens (max!)
Groq:        ████░░░░░░ 8K tokens
OpenRouter:  ██░░░░░░░░ 4K tokens
```

---

## 🎯 Mode Recommendations by Use Case

| Use Case | Recommended Mode | Provider |
|----------|-----------------|----------|
| Blog post outline | Default Text | Gemini |
| Code refactoring | PoT | Groq |
| Business strategy | Tree of Thoughts | Gemini |
| Debugging | ReAct | Gemini |
| API design | PoT | Gemini |
| Market analysis | CoT | Gemini |
| Complex project | Clarify & Distill | Gemini |
| Image for Midjourney | Image Mode | Groq |
| Video for Runway | Video Mode | Gemini |
| Music for Suno | Music Mode | Gemini |

---

## 🔗 Quick Links

- **Health Check:** `https://your-worker-url/api/health`
- **Documentation:** `/docs` folder
- **Error Guide:** `ERROR_GUIDE.md`
- **Deployment:** `DEPLOYMENT_CHECKLIST.md`
- **Version History:** `CHANGELOG.md`

---

## ✅ Checklist: Am I Using CONTEXTOR Correctly?

- [ ] Selected appropriate AI provider
- [ ] Chosen correct mode for my task
- [ ] Input length within limits
- [ ] Used Clarify & Distill for complex projects
- [ ] Tried reasoning modes for analysis tasks
- [ ] Copied output to clipboard
- [ ] Pasted into target AI tool (ChatGPT, Midjourney, etc.)
- [ ] Iterated based on results

---

## 🎉 You're Ready!

**Version:** 1.3.0  
**Status:** Production Ready  

**Remember:**
- 🚀 3 providers for reliability
- 🧠 5 reasoning techniques
- ⚡ Groq for speed, Gemini for quality
- 📋 Always copy output
- 🔄 Iterate and improve

**Happy Context Engineering!** ✨

---

**Need Help?**
- Read: `DEPLOYMENT_CHECKLIST.md`
- Check: `ERROR_GUIDE.md`
- Review: `CHANGELOG.md`
