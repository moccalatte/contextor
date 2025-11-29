# ⚡ QUICK ERROR REFERENCE

**CONTEXTOR v1.2.0 - Common Errors & Fast Solutions**

One-page reference for quick troubleshooting.

---

## 🚨 Most Common Errors

### 1. "Request timeout"

**What it means:** AI took longer than 30-45 seconds

**Quick Fix:**
```bash
✅ Wait a moment and try again
✅ Simplify your input (make it shorter)
✅ Check /api/health to see provider status
```

**Why it happens:** Complex requests or slow API response

---

### 2. "Network error" / "Failed to fetch"

**What it means:** Can't reach the server

**Quick Fix:**
```bash
✅ Check your internet connection
✅ Refresh the page
✅ Try again in a few seconds
✅ Check if you're behind a firewall/VPN
```

**Why it happens:** Network connectivity issues

---

### 3. "All AI providers failed"

**What it means:** Both Gemini and OpenRouter are down

**Quick Fix:**
```bash
✅ Wait 5-10 minutes and retry
✅ Check /api/health endpoint
✅ Check Gemini status: https://status.cloud.google.com
✅ Check OpenRouter status: https://openrouter.ai/status
```

**Why it happens:** Provider outage (rare with v1.2.0 retry logic)

---

### 4. "Content blocked by safety filters"

**What it means:** AI blocked your request as potentially unsafe

**Quick Fix:**
```bash
✅ Rephrase your request in neutral language
✅ Avoid sensitive topics (violence, explicit content)
✅ Be more specific and professional
✅ Fallback provider may accept it
```

**Why it happens:** AI safety policies

---

### 5. "Rate limit exceeded" / "Quota exceeded"

**What it means:** Too many requests in short time

**Quick Fix:**
```bash
✅ Wait 1-5 minutes
✅ Try again with single request
✅ Check if you're in a loop/auto-refresh
```

**Why it happens:**
- Gemini: 15 requests/minute limit
- OpenRouter: 20 requests/minute limit

---

### 6. "Input exceeds 5000 characters"

**What it means:** Your input is too long

**Quick Fix:**
```bash
✅ Shorten your input
✅ Split into multiple requests
✅ Use character counter (v1.2.0+)
```

**Why it happens:** API limit protection

---

### 7. "Invalid mode" / "Invalid request"

**What it means:** Something wrong with your request format

**Quick Fix:**
```bash
✅ Refresh the page
✅ Clear browser cache
✅ Make sure you selected a mode (Text/Image/Video/Music)
✅ Check browser console for details
```

**Why it happens:** Frontend/backend mismatch or corruption

---

## 🔍 Debugging Steps (30 seconds)

**When ANY error occurs:**

1. **Check Health Status**
   ```bash
   Visit: https://your-worker.workers.dev/api/health
   
   Look for:
   - "status": "healthy" ✅
   - "status": "degraded" ⚠️ (primary down, fallback working)
   - "status": "critical" ❌ (all down)
   ```

2. **Check Browser Console**
   ```bash
   F12 → Console tab
   
   Look for:
   - Red error messages
   - "Retry 1/2" (auto-retry working)
   - Health check logs
   ```

3. **Test Simple Input**
   ```bash
   Input: "Hello"
   Mode: Text
   
   If this works → Your original input was the issue
   If this fails → System issue
   ```

---

## 🏥 Health Check Quick Guide

### Access Health Endpoint:
```bash
# Browser:
https://contextor-api.takeakubox.workers.dev/api/health

# Command line:
curl https://contextor-api.takeakubox.workers.dev/api/health
```

### Read the Response:

**✅ HEALTHY:**
```json
{
  "status": "healthy",
  "providers": {
    "gemini": { "status": "healthy", "latency": 1234 },
    "openrouter": { "status": "healthy", "latency": 2345 }
  }
}
```
**Action:** All good! Your error is likely input-related.

---

**⚠️ DEGRADED:**
```json
{
  "status": "degraded",
  "providers": {
    "gemini": { "status": "unhealthy", "error": "..." },
    "openrouter": { "status": "healthy", "latency": 2345 }
  }
}
```
**Action:** Fallback working. May be slower but functional.

---

**❌ CRITICAL:**
```json
{
  "status": "critical",
  "providers": {
    "gemini": { "status": "unhealthy", "error": "..." },
    "openrouter": { "status": "unhealthy", "error": "..." }
  }
}
```
**Action:** Wait 10-15 minutes. Check provider status pages.

---

## 🔧 Quick Fixes by Symptom

| Symptom | Quick Fix | Time |
|---------|-----------|------|
| Infinite loading | Refresh page | 5s |
| "undefined" error | Already fixed in v1.1.1+ | - |
| Slow response | Normal for complex requests | 15-30s |
| Can't click Generate | Already generating, wait | - |
| Lost output on refresh | Use history (v1.2.0+) | - |
| Want to retry | Auto-retry handles it (v1.2.0+) | - |

---

## 📊 Expected Response Times

| Mode | Expected Time | Max Time |
|------|--------------|----------|
| Text (Default) | 2-5s | 30s |
| Text (Mode A Clarify) | 2-4s | 30s |
| Text (Mode A Distill) | 3-8s | 45s |
| Text (Mode B CoT/PoT) | 4-10s | 45s |
| Image Blueprint | 3-6s | 30s |
| Video Blueprint | 4-8s | 30s |
| Music Blueprint | 3-6s | 30s |

**If timeout occurs:**
- v1.2.0 auto-retries 2 times
- Clear error after 30-45 seconds
- Try simplifying input

---

## 🆘 Still Having Issues?

### 1. Check Documentation:
- `ERROR_GUIDE.md` - Comprehensive error reference (790 lines)
- `docs/guides/stability_guide.md` - Detailed troubleshooting (717 lines)

### 2. Check Console Logs:
```bash
F12 → Console
Look for: Retry attempts, health status, detailed errors
```

### 3. Test Health Endpoint:
```bash
https://your-worker.workers.dev/api/health
```

### 4. Verify Deployment:
```bash
# Worker deployed?
npx wrangler deployments list

# Pages deployed?
npx wrangler pages deployments list
```

### 5. Check API Keys:
```bash
# In Cloudflare Dashboard:
Workers & Pages → contextor-api → Settings → Variables

Required:
- OPENROUTER_API_KEY
- GEMINI_API_KEY
```

---

## ✅ Success Indicators

**Everything is working if:**
- ✅ Health endpoint returns "healthy"
- ✅ Simple text generation works
- ✅ Browser console shows no red errors
- ✅ Response time is 2-10 seconds
- ✅ Output appears in output panel

---

## 🎯 Error Prevention Tips

1. **Keep input under 4000 chars** (warning at 4000, limit at 5000)
2. **Use neutral, clear language** (avoid triggering safety filters)
3. **Don't spam Generate button** (wait for response)
4. **Check health periodically** (auto-checks every 5 min in v1.2.0)
5. **Refresh page if stuck** (clears state)

---

## 📞 Need More Help?

**Read in order:**
1. This file (you are here)
2. `ERROR_GUIDE.md` - All errors explained
3. `docs/guides/stability_guide.md` - Deep dive
4. `V1.2.0_RELEASE_NOTES.md` - Latest features

---

**Version:** 1.2.0  
**Last Updated:** 29 November 2025

🚀 **99% of issues resolved by refreshing page or waiting 1-2 minutes!**