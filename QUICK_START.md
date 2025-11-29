# CONTEXTOR Quick Start Guide

Get CONTEXTOR running in **under 10 minutes** with this fast-track guide.

## TL;DR - Commands Only

```bash
# 1. Install dependencies
npm install

# 2. Get API keys:
# - OpenRouter: https://openrouter.ai/keys
# - Gemini: https://aistudio.google.com/app/apikey

# 3. Create .dev.vars
cp .dev.vars.example .dev.vars
# Edit .dev.vars and add your keys

# 4. Test locally
npx wrangler dev          # Terminal 1 (Worker)
npm run dev               # Terminal 2 (Frontend)
# Open http://localhost:8788

# 5. Deploy
npx wrangler login
npx wrangler secret put OPENROUTER_API_KEY
npx wrangler secret put GEMINI_API_KEY
npx wrangler deploy
npx wrangler pages deploy public --project-name=contextor
```

---

## Step-by-Step (First Time)

### 1. Prerequisites ✅

Install these first:
- [Node.js](https://nodejs.org/) (v18+)
- [Git](https://git-scm.com/)
- Create [Cloudflare account](https://dash.cloudflare.com/sign-up) (free)

### 2. Get API Keys (100% Free) 🔑

**OpenRouter (Free GPT-3.5):**
1. Go to https://openrouter.ai/
2. Sign in → Keys → Create Key
3. Copy key (starts with `sk-or-v1-`)

**Google Gemini (Free):**
1. Go to https://aistudio.google.com/
2. Get API Key → Create API Key
3. Copy key (starts with `AIza`)

### 3. Setup Project 📦

```bash
# Install
npm install

# Configure environment
cp .dev.vars.example .dev.vars
nano .dev.vars  # or use any editor
```

Add your keys to `.dev.vars`:
```
OPENROUTER_API_KEY=sk-or-v1-YOUR-KEY
GEMINI_API_KEY=AIzaYOUR-KEY
```

### 4. Test Locally 🧪

**Terminal 1 - Start Worker:**
```bash
npx wrangler dev
```
Keep this running.

**Terminal 2 - Start Frontend:**
```bash
npm run dev
```

**Open browser:** http://localhost:8788

✨ You should see the CONTEXTOR interface!

Try entering: *"Explain quantum computing to a 10-year-old"*

### 5. Deploy to Production 🚀

**Login to Cloudflare:**
```bash
npx wrangler login
```
(Browser opens → Click "Allow")

**Add secrets:**
```bash
npx wrangler secret put OPENROUTER_API_KEY
# Paste your OpenRouter key

npx wrangler secret put GEMINI_API_KEY
# Paste your Gemini key
```

**Deploy Worker:**
```bash
npx wrangler deploy
```
Note the URL: `https://contextor-api.YOUR-SUBDOMAIN.workers.dev`

**Deploy Frontend:**
```bash
npx wrangler pages deploy public --project-name=contextor
```

**Done!** Your site is live at: `https://contextor.pages.dev`

---

## Common Issues 🔧

### "Module not found"
```bash
npm install
```

### "Unauthorized" or API errors
Check your API keys in `.dev.vars` (local) or Wrangler secrets (production):
```bash
# Re-add secrets
npx wrangler secret put OPENROUTER_API_KEY
npx wrangler secret put GEMINI_API_KEY
```

### Worker URL different from frontend
Edit `public/app.js`, replace `/api/generate` with your Worker URL:
```javascript
const workerUrl = 'https://contextor-api.YOUR-SUBDOMAIN.workers.dev';
const response = await fetch(`${workerUrl}/api/generate`, {
```

### Port already in use
Kill the process:
```bash
# macOS/Linux
lsof -ti:8788 | xargs kill -9

# Windows
netstat -ano | findstr :8788
taskkill /PID <PID> /F
```

---

## Next Steps 📚

- Read the full [README.md](README.md) for detailed documentation
- Check [docs/](docs/) folder for architecture and technical details
- Customize the UI in `public/styles.css`
- Add more AI providers in `worker/index.js`

---

## Free Tier Limits

✅ **Cloudflare Pages:** Unlimited requests
✅ **Cloudflare Workers:** 100,000 requests/day
✅ **OpenRouter:** Free models available
✅ **Gemini:** 1,500 requests/day

**Total cost: $0/month** 💰

---

## Support

Need help? Check:
- [README.md](README.md) - Full documentation
- [Troubleshooting section](README.md#troubleshooting)
- Open an issue on GitHub

---

**Happy context engineering! ✨**
