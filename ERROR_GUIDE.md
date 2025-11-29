# 🔧 ERROR GUIDE & TROUBLESHOOTING

**CONTEXTOR Error Reference** — Comprehensive guide to all potential errors, root causes, and solutions.

**Version:** 1.1.1
**Last Updated:** 29 November 2025

---

## 📑 Table of Contents

1. [Gemini API Errors](#gemini-api-errors)
2. [OpenRouter API Errors](#openrouter-api-errors)
3. [Worker Errors](#worker-errors)
4. [Frontend Errors](#frontend-errors)
5. [Deployment Errors](#deployment-errors)
6. [Network & Timeout Errors](#network--timeout-errors)
7. [Rate Limiting Errors](#rate-limiting-errors)
8. [Configuration Errors](#configuration-errors)
9. [Prevention Strategies](#prevention-strategies)
10. [Debugging Guide](#debugging-guide)

---

## 🤖 Gemini API Errors

### ❌ Error: `TypeError: Cannot read properties of undefined (reading '0')`

**Root Cause:**
- Gemini returns empty `candidates` array (content filtered by safety settings)
- Response structure validation missing

**When It Happens:**
- Content triggers safety filters (harassment, hate speech, etc.)
- Prompt contains blocked keywords
- API experiencing issues

**Solution (IMPLEMENTED in v1.1.1):**
```javascript
// Comprehensive validation added:
if (!data.candidates || data.candidates.length === 0) {
  if (data.promptFeedback && data.promptFeedback.blockReason) {
    throw new Error(`Gemini blocked: ${data.promptFeedback.blockReason}`);
  }
  throw new Error('Gemini returned no candidates');
}
```

**User Action:**
- Try different input wording (avoid sensitive topics)
- Wait 1-2 minutes and retry
- Check `npx wrangler tail` for specific block reason

**Status:** ✅ FIXED in v1.1.1

---

### ❌ Error: `Gemini blocked: SAFETY`

**Root Cause:**
- Input content triggers Gemini safety filters

**Categories:**
- `HARM_CATEGORY_HARASSMENT`
- `HARM_CATEGORY_HATE_SPEECH`
- `HARM_CATEGORY_SEXUALLY_EXPLICIT`
- `HARM_CATEGORY_DANGEROUS_CONTENT`

**Solution:**
```javascript
// Safety settings configured to BLOCK_ONLY_HIGH
safetySettings: [
  { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_ONLY_HIGH" }
  // ... other categories
]
```

**User Action:**
- Rephrase input to be more neutral
- Avoid controversial/sensitive topics
- System will automatically fallback to OpenRouter

**Status:** ✅ MITIGATED in v1.1.1 (threshold set to HIGH)

---

### ❌ Error: `Gemini blocked: RECITATION`

**Root Cause:**
- Gemini detected potential copyright content in response

**When It Happens:**
- Generated output too similar to copyrighted material
- Prompt asks for verbatim reproduction of copyrighted content

**Solution:**
- Automatic fallback to OpenRouter
- User should rephrase request to avoid requesting exact copies

**User Action:**
- Ask for "inspired by" instead of "exactly like"
- Request original content, not reproductions

**Status:** ✅ HANDLED with automatic fallback

---

### ❌ Error: `Gemini HTTP error: 429 - Quota exceeded`

**Root Cause:**
- Free tier rate limit exceeded (15 RPM or 1500 requests/day)

**Limits (Gemini 2.5 Flash Free Tier):**
- **Requests Per Minute (RPM):** 15
- **Requests Per Day (RPD):** 1500
- **Tokens Per Minute (TPM):** 1,000,000

**Solution:**
- Automatic fallback to OpenRouter
- Wait 1 minute for RPM reset
- Wait until next day for RPD reset

**Prevention:**
- Implement request caching (future feature)
- Add client-side rate limiting

**Status:** ✅ HANDLED with automatic fallback

---

### ❌ Error: `Gemini HTTP error: 400 - Invalid API key`

**Root Cause:**
- API key incorrect, expired, or not set

**Solution:**
1. Regenerate API key:
   - Go to https://aistudio.google.com/app/apikey
   - Click "Create API Key"
   - Copy new key

2. Update Cloudflare secret:
```bash
npx wrangler secret put GEMINI_API_KEY
# Paste new key when prompted
```

3. Redeploy:
```bash
npx wrangler deploy
```

**Verification:**
```bash
curl "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=YOUR_KEY" \
-H 'Content-Type: application/json' \
-d '{"contents":[{"parts":[{"text":"test"}]}]}'
```

**Status:** ⚠️ USER CONFIGURATION

---

### ❌ Error: `Gemini HTTP error: 503 - Service temporarily unavailable`

**Root Cause:**
- Gemini API experiencing downtime or maintenance

**Solution:**
- Automatic fallback to OpenRouter
- Retry after 5-10 minutes

**User Action:**
- No action needed (automatic fallback)
- Check Gemini status: https://status.cloud.google.com/

**Status:** ✅ HANDLED with automatic fallback

---

## 🔄 OpenRouter API Errors

### ❌ Error: `OpenRouter error: 401 - Unauthorized`

**Root Cause:**
- Invalid or missing OpenRouter API key

**Solution:**
1. Get API key:
   - Go to https://openrouter.ai/keys
   - Create account (free)
   - Generate API key

2. Update secret:
```bash
npx wrangler secret put OPENROUTER_API_KEY
```

3. Redeploy:
```bash
npx wrangler deploy
```

**Status:** ⚠️ USER CONFIGURATION

---

### ❌ Error: `OpenRouter error: 429 - Rate limit exceeded`

**Root Cause:**
- Free model `z-ai/glm-4.5-air:free` rate limit hit

**Limits (Estimated):**
- Varies by model and usage patterns
- Typically resets hourly

**Solution:**
- Wait 1 hour for reset
- Upgrade to paid OpenRouter tier (optional)

**Prevention:**
- Primary provider (Gemini) should handle most traffic
- OpenRouter is fallback only

**Status:** ⚠️ RATE LIMIT (expected for free tier)

---

### ❌ Error: `All AI providers failed`

**Root Cause:**
- Both Gemini AND OpenRouter failed

**Scenarios:**
1. Both hit rate limits simultaneously
2. Network issues
3. Both APIs experiencing downtime
4. Invalid configuration for both

**Solution:**
1. Check API keys are valid
2. Wait 5-10 minutes and retry
3. Check logs for specific errors:
```bash
npx wrangler tail
```

**User Action:**
- Verify API keys are correct
- Check both service status pages
- Wait and retry

**Status:** ⚠️ REQUIRES INVESTIGATION

---

## ⚙️ Worker Errors

### ❌ Error: `Worker error: Invalid request`

**Root Cause:**
- Request validation failed (missing mode, input, etc.)

**Validation Rules:**
```javascript
- mode: must be 'text', 'image', 'video', or 'music'
- input: required, non-empty string, max 5000 characters
- Mode A: requires stage ('clarify' or 'distill')
- Distill stage: requires questions and answers arrays
```

**Solution:**
- Frontend should prevent invalid requests
- Check request body format

**Example Valid Request:**
```json
{
  "mode": "text",
  "input": "Build a todo app"
}
```

**Status:** ✅ VALIDATED server-side

---

### ❌ Error: `Input exceeds maximum length of 5000 characters`

**Root Cause:**
- User input too long

**Limit:** 5000 characters

**Solution:**
- Split long inputs into multiple requests
- Use Mode A (Clarify → Distill) for complex tasks
- Summarize input before submitting

**User Action:**
- Reduce input length
- Focus on key points only

**Status:** ✅ EXPECTED BEHAVIOR

---

### ❌ Error: `CORS error` (in browser console)

**Root Cause:**
- CORS headers not configured properly
- Wrong origin

**Solution:**
```javascript
// Worker CORS headers (already configured):
'Access-Control-Allow-Origin': '*',
'Access-Control-Allow-Methods': 'POST, OPTIONS',
'Access-Control-Allow-Headers': 'Content-Type'
```

**If Issue Persists:**
- Check worker URL is correct
- Verify OPTIONS preflight is handled
- Clear browser cache

**Status:** ✅ CONFIGURED

---

## 🌐 Frontend Errors

### ❌ Error: `Failed to fetch` or `Network request failed`

**Root Cause:**
1. Worker not deployed
2. Wrong worker URL in `app.js`
3. Network connectivity issues
4. Browser blocking requests

**Solution:**

**1. Verify Worker is Deployed:**
```bash
npx wrangler deploy
```

**2. Check Worker URL in `app.js`:**
```javascript
// Should match your worker subdomain:
const response = await fetch('https://contextor-api.YOUR_SUBDOMAIN.workers.dev/api/generate', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ mode, input })
});
```

**3. Test Worker Directly:**
```bash
curl -X POST https://contextor-api.YOUR_SUBDOMAIN.workers.dev/api/generate \
  -H "Content-Type: application/json" \
  -d '{"mode":"text","input":"test"}'
```

**Status:** ⚠️ CONFIGURATION CHECK

---

### ❌ Error: `Unexpected token < in JSON`

**Root Cause:**
- Worker returning HTML (404 page) instead of JSON
- Wrong endpoint URL

**Common Mistakes:**
```javascript
// ❌ WRONG:
fetch('https://worker.dev/')              // Root path (404)
fetch('https://worker.dev/generate')      // Missing /api/

// ✅ CORRECT:
fetch('https://worker.dev/api/generate')
```

**Solution:**
- Verify endpoint is `/api/generate`
- Check worker is deployed
- Verify route configuration in `wrangler.toml`

**Status:** ⚠️ CONFIGURATION CHECK

---

## 🚀 Deployment Errors

### ❌ Error: `Could not find wrangler.toml`

**Root Cause:**
- Running command outside project directory
- File deleted/missing

**Solution:**
```bash
# Navigate to project directory first:
cd /path/to/contextor

# Then run wrangler commands:
npx wrangler deploy
```

**Verify you're in correct directory:**
```bash
ls wrangler.toml
# Should show the file
```

**Status:** ⚠️ USER ERROR

---

### ❌ Error: `Authentication error` or `Not logged in`

**Root Cause:**
- Not authenticated with Cloudflare

**Solution:**
```bash
# Login to Cloudflare:
npx wrangler login

# Browser will open, authorize Wrangler
# Then retry deployment
```

**Status:** ⚠️ USER CONFIGURATION

---

### ❌ Error: `Build failed` (Pages deployment)

**Root Cause:**
- Invalid build command
- Missing dependencies

**Solution:**
```bash
# Pages deployment command:
npx wrangler pages deploy public --project-name=contextor

# Note: "public" is the folder, not a build output
# No build step needed (vanilla HTML/CSS/JS)
```

**Status:** ✅ NO BUILD REQUIRED

---

## 🌐 Network & Timeout Errors

### ❌ Error: `Request timeout`

**Root Cause:**
- AI provider taking too long (>30s)
- Network issues

**Cloudflare Worker Limits:**
- **Free Tier:** 10ms CPU time, 30s wall-clock time
- **Paid Tier:** 50ms CPU time, unlimited wall-clock time

**Solution:**
- Reduce `maxTokens` for faster responses
- Implement timeout handling (future improvement)
- Use streaming responses (future feature)

**Current Timeouts:**
- No explicit timeout (relies on Cloudflare limit)

**Status:** ⚠️ FUTURE IMPROVEMENT NEEDED

---

### ❌ Error: `Worker exceeded CPU time limit`

**Root Cause:**
- Complex processing taking too long
- Infinite loops (unlikely with current code)

**Solution:**
- Simplify processing logic
- Offload heavy computation to AI providers
- Current code should not hit this limit

**Status:** ✅ UNLIKELY (stateless design)

---

## ⏱️ Rate Limiting Errors

### Rate Limit Summary

| Provider | Free Tier Limits | Reset Period |
|----------|-----------------|--------------|
| **Gemini 2.5 Flash** | 15 RPM, 1500 RPD, 1M TPM | 1 min / 24 hr |
| **OpenRouter GLM-4.5** | ~200 RPH (estimated) | 1 hour |

**Handling Strategy:**
1. Gemini hits limit → Fallback to OpenRouter
2. Both hit limit → Return error to user
3. User waits for reset

**Future Improvements:**
- Client-side rate limiting UI
- Request queue with retry
- Caching identical requests

**Status:** ✅ FALLBACK IMPLEMENTED, 🔄 CACHING PLANNED

---

## 🔧 Configuration Errors

### ❌ Error: `Environment variable not set`

**Root Cause:**
- API keys not configured in Cloudflare

**Required Secrets:**
- `GEMINI_API_KEY`
- `OPENROUTER_API_KEY`

**Solution:**
```bash
# Set both secrets:
npx wrangler secret put GEMINI_API_KEY
npx wrangler secret put OPENROUTER_API_KEY

# Redeploy:
npx wrangler deploy
```

**Verification:**
```bash
# List secrets (doesn't show values):
npx wrangler secret list
```

**Status:** ⚠️ USER CONFIGURATION

---

## 🛡️ Prevention Strategies

### 1. Input Validation
```javascript
// Already implemented:
✅ Mode validation
✅ Input length check (max 5000 chars)
✅ Required field validation
✅ Array validation for Mode A
```

### 2. Error Handling
```javascript
// Already implemented:
✅ Try-catch blocks
✅ Comprehensive response validation
✅ Detailed error logging
✅ Automatic fallback
```

### 3. Rate Limit Management
```javascript
// Future improvements:
🔄 Request caching (CloudFlare KV)
🔄 Client-side rate limit UI
🔄 Exponential backoff retry
```

### 4. Monitoring
```bash
# Active monitoring:
npx wrangler tail

# Check logs for:
- Error patterns
- Fallback frequency
- Response times
```

### 5. Testing
```bash
# Test endpoints:
curl -X POST https://worker.dev/api/generate \
  -H "Content-Type: application/json" \
  -d '{"mode":"text","input":"test input"}'

# Expected response:
{
  "success": true,
  "mode": "text",
  "output": "...",
  "metadata": {
    "provider": "gemini",
    "model": "gemini-2.5-flash",
    "processingTime": 2000
  }
}
```

---

## 🔍 Debugging Guide

### Step 1: Identify Error Location

**Frontend Error (Browser Console):**
```javascript
// Check browser console (F12):
- Network tab: Failed requests
- Console tab: JavaScript errors
```

**Backend Error (Worker Logs):**
```bash
# Real-time logs:
npx wrangler tail

# Look for:
- "Gemini failed, trying OpenRouter"
- HTTP status codes (400, 401, 429, 500)
- Validation errors
```

### Step 2: Reproduce Error

**Test Worker Directly:**
```bash
curl -X POST https://YOUR-WORKER.workers.dev/api/generate \
  -H "Content-Type: application/json" \
  -d '{
    "mode": "text",
    "input": "test"
  }'
```

**Test Gemini API Directly:**
```bash
curl "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=YOUR_KEY" \
  -H 'Content-Type: application/json' \
  -d '{"contents":[{"parts":[{"text":"test"}]}]}'
```

**Test OpenRouter API Directly:**
```bash
curl https://openrouter.ai/api/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_KEY" \
  -d '{
    "model": "z-ai/glm-4.5-air:free",
    "messages": [{"role": "user", "content": "test"}]
  }'
```

### Step 3: Check Configuration

```bash
# Verify project structure:
ls -la
# Should see: public/, worker/, wrangler.toml, package.json

# Check secrets are set:
npx wrangler secret list
# Should show: GEMINI_API_KEY, OPENROUTER_API_KEY

# Check deployment status:
npx wrangler deployments list
```

### Step 4: Common Fixes

```bash
# Fix 1: Redeploy everything
npx wrangler deploy                                    # Backend
npx wrangler pages deploy public --project-name=NAME   # Frontend

# Fix 2: Reset secrets
npx wrangler secret put GEMINI_API_KEY
npx wrangler secret put OPENROUTER_API_KEY

# Fix 3: Clear cache
# Browser: Ctrl+Shift+R (hard refresh)

# Fix 4: Check API key validity
# Test with curl commands above
```

### Step 5: Get Help

**Information to Provide:**
1. Error message (exact text)
2. When it happens (always/sometimes/specific input)
3. Wrangler tail logs
4. Browser console errors (if frontend)
5. Steps to reproduce

**Where to Report:**
- GitHub Issues: https://github.com/YOUR-REPO/issues
- Include: Error logs, environment (OS, browser), reproduction steps

---

## 📊 Error Frequency (Expected)

Based on current architecture:

| Error | Frequency | Severity | Handled? |
|-------|-----------|----------|----------|
| Gemini safety block | Rare (<1%) | Low | ✅ Auto-fallback |
| Gemini rate limit | Occasional (free tier) | Medium | ✅ Auto-fallback |
| OpenRouter rate limit | Rare (fallback only) | Low | ⚠️ User waits |
| Network timeout | Very rare | Low | ⚠️ User retry |
| Invalid input | Rare (frontend validates) | Low | ✅ Rejected |
| API key invalid | One-time (setup) | High | ⚠️ User fixes |
| Both providers fail | Extremely rare | High | ⚠️ User retry |

**Overall Stability:** 🟢 EXCELLENT (99%+ success rate expected)

---

## 🚀 Future Error Prevention Features

### Planned Improvements:

1. **Request Retry Logic**
   - Exponential backoff (1s, 2s, 4s)
   - Max 3 retries
   - User-visible retry status

2. **Request Caching**
   - Cache identical requests (CloudFlare KV)
   - 5-minute TTL
   - Reduces API calls by ~30-50%

3. **Client-Side Rate Limiting**
   - Show "Rate limit reached" warning
   - Countdown timer to reset
   - Queue requests

4. **Health Check Endpoint**
   - `/api/health` endpoint
   - Checks both AI providers
   - Returns status for UI indicator

5. **Error Analytics**
   - Track error patterns
   - Alert on unusual error rates
   - CloudFlare Analytics integration

---

## 📝 Summary

**Current Error Handling:** 🟢 ROBUST
- Comprehensive validation
- Automatic fallbacks
- Detailed logging
- Graceful degradation

**Known Issues:** 🟡 MINOR
- No retry logic (user must retry manually)
- No request caching (hitting API every time)
- No timeout handling (relies on CloudFlare default)

**Recommended Actions:**
1. ✅ Monitor `npx wrangler tail` during first week
2. ✅ Track which errors occur most frequently
3. 🔄 Implement retry logic if needed
4. 🔄 Add caching if rate limits become issue

**Overall Assessment:** Production-ready with room for optimization.

---

**Need Help?** Check logs first:
```bash
npx wrangler tail
```

Then refer to specific error section above. 🚀
