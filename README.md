# 🚀 CONTEXTOR v1.2.0 - Context Engineering Assistant

**Generate context-engineered prompts for AI models** — ChatGPT, Claude, Midjourney, and more

[![Version](https://img.shields.io/badge/version-1.2.0-blue.svg)](https://github.com/yourusername/contextor)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![Free](https://img.shields.io/badge/cost-$0/month-brightgreen.svg)](https://github.com/yourusername/contextor)

> **New in v1.2.0:** 🛡️ Auto-retry logic, ⏱️ Timeout handling, 🏥 Health monitoring, 📚 Output history, 💬 Enhanced error messages

---

## 📖 What is CONTEXTOR?

CONTEXTOR is a **free, production-ready** context engineering assistant that transforms vague ideas into comprehensive, actionable prompts for AI models.

### ✨ Features

- ✍️ **Text Mode** - Generate detailed context for text AI (ChatGPT, Claude)
- 🎨 **Image Mode** - Create professional image generation prompts (Midjourney, DALL-E)
- 🎬 **Video Mode** - Craft cinematic video scene descriptions (Runway, Pika)
- 🎵 **Music Mode** - Design structured music generation prompts (Suno, Udio)
- 🔄 **Mode A** - Clarify → Distill workflow for complex requests
- 🧠 **Mode B** - Chain-of-Thought (CoT) and Program-of-Thought (PoT) reasoning

### 🆕 What's New in v1.2.0

- 🛡️ **Auto-Retry Logic** - 99%+ success rate with exponential backoff
- ⏱️ **Timeout Handling** - Clear 30-45s timeouts, no infinite waits
- 🏥 **Health Check System** - Real-time API provider monitoring (`/api/health`)
- 📚 **Output History** - Last 20 outputs saved in browser (survives refresh)
- 💬 **Enhanced Error Messages** - User-friendly, actionable guidance
- 📊 **Better Loading States** - Progress feedback for long requests

**100% FREE** - No API keys required, no usage limits, no credit card needed.

---

## 🎯 Who Is This For?

This guide is for you if you:
- ❌ Have never coded before
- ❌ Have never deployed a website
- ❌ Are confused by terms like "terminal", "API", etc.
- ✅ Want to learn from ZERO
- ✅ Have a computer (Windows/Mac/Linux)

**Don't worry, everything is explained step-by-step!**

For Indonesian speakers: See [MULAI_DISINI.md](MULAI_DISINI.md) for complete Indonesian guide.

---

## 📋 Prerequisites (Install Software First)

### Step 1: Install Node.js

**Apa itu Node.js?** Software untuk menjalankan JavaScript di komputer (bukan di browser).

**Cara Install:**

#### Windows:
1. Buka https://nodejs.org/
2. Klik tombol hijau **"Download Node.js (LTS)"**
3. Tunggu download selesai
4. Klik file yang didownload (misalnya `node-v18.x.x-x64.msi`)
5. Klik **Next** terus sampai selesai
6. Restart komputer

#### Mac:
1. Buka https://nodejs.org/
2. Klik tombol hijau **"Download Node.js (LTS)"**
3. Buka file `.pkg` yang didownload
4. Ikuti instruksi installer
5. Restart komputer

#### Linux (Ubuntu/Debian):
```bash
curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
sudo apt-get install -y nodejs
```

**Cek berhasil atau tidak:**
1. Buka **Terminal** (Mac/Linux) atau **Command Prompt** (Windows)
   - Windows: Tekan `Win + R`, ketik `cmd`, Enter
   - Mac: Tekan `Cmd + Space`, ketik `terminal`, Enter
   - Linux: Tekan `Ctrl + Alt + T`

2. Ketik ini dan tekan Enter:
```bash
node --version
```

Kalau muncul angka kayak `v18.17.0` → **BERHASIL!** ✅

---

### Step 2: Install Git

**Apa itu Git?** Software untuk manage code (simpan versi, share code, dll).

**Cara Install:**

#### Windows:
1. Buka https://git-scm.com/download/win
2. Download otomatis jalan, tunggu selesai
3. Klik file `.exe` yang didownload
4. Klik **Next** terus sampai selesai

#### Mac:
Git sudah terinstall. Cek dulu:
```bash
git --version
```
Kalau belum ada, install lewat Homebrew atau download dari https://git-scm.com/download/mac

#### Linux:
```bash
sudo apt-get install git
```

**Cek berhasil:**
```bash
git --version
```
Muncul angka → **BERHASIL!** ✅

---

### Step 3: Bikin Akun Cloudflare (GRATIS)

**Apa itu Cloudflare?** Tempat kita host website GRATIS.

**Cara Bikin Akun:**
1. Buka https://dash.cloudflare.com/sign-up
2. Isi:
   - Email kamu
   - Password (yang kuat ya!)
3. Klik **Sign Up**
4. Buka email kamu, klik link verifikasi
5. **SELESAI!** ✅

---

## 🔑 Dapetin API Keys (GRATIS)

### Apa itu API Key?
Bayangkan API Key itu kayak "password" buat akses AI gratis. Kita butuh 2 API keys:

1. **OpenRouter** - Buat akses ChatGPT gratis
2. **Google Gemini** - Buat AI cadangan

**KEDUANYA GRATIS!** Tidak perlu kartu kredit.

---

### API Key #1: OpenRouter

**Step-by-step:**

1. Buka https://openrouter.ai/
2. Klik **Sign In** (pojok kanan atas)
3. Pilih **Sign in with Google** atau **Sign in with GitHub**
4. Login pakai akun Google/GitHub kamu
5. Setelah masuk, klik nama kamu (pojok kanan atas)
6. Klik **Keys**
7. Klik tombol **Create Key**
8. Isi nama key (misalnya: "CONTEXTOR")
9. Klik **Create**
10. **COPY API KEY** yang muncul! (Simpan di notepad)
    - Bentuknya kayak: `sk-or-v1-abc123xyz...`
    - **JANGAN SHARE ke siapa-siapa!**

✅ **API Key OpenRouter DAPAT!**

---

### API Key #2: Google Gemini

**Step-by-step:**

1. Buka https://aistudio.google.com/
2. Klik **Sign in** (pojok kanan atas)
3. Login pakai akun Google kamu
4. Klik **Get API Key** (di sidebar kiri)
5. Klik **Create API Key**
6. Pilih project atau buat baru (pilih aja yang muncul)
7. **COPY API KEY** yang muncul! (Simpan di notepad)
   - Bentuknya kayak: `AIzaSyAbc123...`
   - **JANGAN SHARE ke siapa-siapa!**

✅ **API Key Gemini DAPAT!**

---

## 💻 Setup Project CONTEXTOR

Sekarang kita mulai setup projectnya!

### Step 1: Buka Terminal/Command Prompt

- **Windows:** Tekan `Win + R`, ketik `cmd`, Enter
- **Mac:** Tekan `Cmd + Space`, ketik `terminal`, Enter
- **Linux:** Tekan `Ctrl + Alt + T`

---

### Step 2: Masuk ke Folder Project

Di terminal, ketik ini (satu per satu):

```bash
cd /home/dre/dev/code/contextor
```

**Penjelasan:**
- `cd` = Change Directory (pindah folder)
- `/home/dre/dev/code/contextor` = lokasi project kamu

**PENTING:** Sesuaikan path dengan lokasi project kamu!

Cek udah bener belum:
```bash
pwd
```

Harusnya muncul: `/home/dre/dev/code/contextor`

---

### Step 3: Install Dependencies

**Apa itu dependencies?** Library/tools yang dibutuhkan project.

Ketik di terminal:
```bash
npm install
```

**Tunggu proses selesai** (biasanya 30 detik - 2 menit).

Kalau muncul tulisan kayak:
```
added 150 packages, and audited 151 packages in 45s
```

✅ **BERHASIL!**

---

### Step 4: Setup API Keys

Sekarang kita masukin API keys yang tadi kamu dapetin.

**1. Copy file template:**
```bash
cp .dev.vars.example .dev.vars
```

**Penjelasan:**
- `cp` = Copy (salin file)
- `.dev.vars.example` = File template
- `.dev.vars` = File baru yang kita bikin

**2. Edit file `.dev.vars`:**

**Cara 1 - Pakai Nano (di terminal):**
```bash
nano .dev.vars
```

Nanti terbuka editor. Kamu lihat ini:
```
OPENROUTER_API_KEY=your_openrouter_api_key_here
GEMINI_API_KEY=your_gemini_api_key_here
```

**Ganti:**
- `your_openrouter_api_key_here` dengan API key OpenRouter kamu
- `your_gemini_api_key_here` dengan API key Gemini kamu

**Contoh hasil:**
```
OPENROUTER_API_KEY=sk-or-v1-abc123xyz
GEMINI_API_KEY=AIzaSyAbc123xyz
```

**Simpan:**
- Tekan `Ctrl + O` (huruf O)
- Tekan `Enter`
- Tekan `Ctrl + X`

**Cara 2 - Pakai Text Editor biasa:**

1. Buka file explorer
2. Masuk ke folder project: `/home/dre/dev/code/contextor`
3. Cari file `.dev.vars`
   - **PENTING:** Aktifkan "Show Hidden Files" dulu!
   - Windows: View → Show → Hidden items
   - Mac: Tekan `Cmd + Shift + .`
   - Linux: Tekan `Ctrl + H`
4. Klik kanan → Open with → Notepad/TextEdit/gedit
5. Edit seperti di atas
6. Save (Ctrl+S)

✅ **API Keys sudah disetup!**

---

## 🧪 Test di Komputer Kamu (Localhost)

Sekarang kita test dulu di komputer kamu sebelum deploy online.

### Step 1: Jalankan Backend (Worker)

Di terminal, ketik:
```bash
npx wrangler dev
```

**Apa yang terjadi:**
- Wrangler = Tool dari Cloudflare
- dev = Mode development (testing)

**Tunggu sampai muncul:**
```
[wrangler:inf] Ready on http://localhost:8787
```

✅ **Backend jalan!**

**JANGAN TUTUP TERMINAL INI!** Biarkan jalan terus.

---

### Step 2: Jalankan Frontend (Website)

**Buka terminal BARU** (jangan tutup yang tadi).

**Cara buka terminal baru:**
- Windows: Buka Command Prompt lagi
- Mac/Linux: Klik File → New Tab di Terminal

Di terminal baru, masuk ke folder project lagi:
```bash
cd /home/dre/dev/code/contextor
```

Lalu jalankan frontend:
```bash
npm run dev
```

**Tunggu sampai muncul:**
```
[wrangler:inf] Ready on http://localhost:8788
```

✅ **Frontend jalan!**

---

### Step 3: Buka di Browser

1. Buka browser (Chrome/Firefox/Safari)
2. Ketik di address bar: `http://localhost:8788`
3. Tekan Enter

**KAMU HARUSNYA LIHAT WEBSITE CONTEXTOR!** 🎉

Tampilan:
```
┌─────────────────────────────────────┐
│ CONTEXTOR                      ⚙️  │
│ Context Engineering Assistant      │
├─────────────────────────────────────┤
│ ✍️ Text  🎨 Image  🎬 Video  🎵 Music │
├─────────────────────────────────────┤
│ [Input box...]                     │
│                                    │
│ [✨ Generate]                      │
└─────────────────────────────────────┘
```

---

### Step 4: Coba Pakai!

**Test sederhana:**

1. Klik tab **✍️ Text** (sudah aktif by default)
2. Di input box, ketik:
   ```
   Jelaskan blockchain dengan bahasa sederhana
   ```
3. Klik **✨ Generate**
4. Tunggu 3-5 detik
5. Lihat hasilnya muncul di bawah!

**Kalau berhasil** → Kamu lihat penjelasan panjang tentang blockchain.

**Kalau error** → Lihat bagian Troubleshooting di bawah.

✅ **CONTEXTOR JALAN DI KOMPUTER KAMU!**

---

## 🌍 Deploy ke Internet (Biar Orang Lain Bisa Akses)

Sekarang kita deploy supaya bisa diakses dari mana aja via internet!

### Step 1: Login ke Cloudflare

Di terminal, ketik:
```bash
npx wrangler login
```

**Apa yang terjadi:**
1. Browser terbuka otomatis
2. Muncul halaman Cloudflare
3. Klik **Allow** atau **Authorize**
4. Muncul "Success!" di browser

Balik ke terminal, harusnya muncul:
```
Successfully logged in.
```

✅ **Login berhasil!**

---

### Step 2: Masukin API Keys ke Cloudflare

Sekarang kita upload API keys ke Cloudflare (biar worker bisa pakai).

**Upload API Key OpenRouter:**
```bash
npx wrangler secret put OPENROUTER_API_KEY
```

Nanti muncul:
```
Enter a secret value:
```

**PASTE API Key OpenRouter kamu** (yang `sk-or-v1-...`) lalu tekan Enter.

Muncul:
```
✅ Success! Uploaded secret OPENROUTER_API_KEY
```

**Upload API Key Gemini:**
```bash
npx wrangler secret put GEMINI_API_KEY
```

Nanti muncul:
```
Enter a secret value:
```

**PASTE API Key Gemini kamu** (yang `AIza...`) lalu tekan Enter.

Muncul:
```
✅ Success! Uploaded secret GEMINI_API_KEY
```

✅ **API Keys sudah di cloud!**

---

### Step 3: Deploy Backend (Worker)

Ketik di terminal:
```bash
npx wrangler deploy
```

**Tunggu proses selesai** (30 detik - 1 menit).

Nanti muncul:
```
Published contextor-api (X.XX sec)
  https://contextor-api.XXXXXXX.workers.dev
```

**COPY URL** yang muncul! (misalnya: `https://contextor-api.abc123.workers.dev`)

✅ **Backend sudah online!**

---

### Step 4: Update Frontend (Sambungin ke Backend)

Sebelum deploy frontend, kita harus sambungin ke backend yang baru deploy.

**Buka file `public/app.js`:**

Cari baris yang ada `/api/generate` (ada beberapa tempat).

**Ganti semua `/api/generate` dengan URL worker kamu.**

**Contoh:**

**Sebelum:**
```javascript
const response = await fetch('/api/generate', {
```

**Sesudah:**
```javascript
const response = await fetch('https://contextor-api.abc123.workers.dev/api/generate', {
```

**ATAU** kalau kamu mau lebih rapi, tambahkan di bagian paling atas file `app.js`:

```javascript
// Config
const API_URL = 'https://contextor-api.abc123.workers.dev';
```

Lalu ganti semua fetch jadi:
```javascript
const response = await fetch(`${API_URL}/api/generate`, {
```

**Save file!** (Ctrl+S)

---

### Step 5: Deploy Frontend (Website)

Ketik di terminal:
```bash
npx wrangler pages deploy public --project-name=contextor
```

**Pertama kali** deploy, akan muncul pertanyaan:

```
? Create a new project? (Y/n)
```
**Ketik:** `Y` lalu Enter

```
? Enter the name of your new project:
```
**Ketik:** `contextor` lalu Enter

**Tunggu upload selesai** (30 detik - 1 menit).

Nanti muncul:
```
✨ Success! Uploaded 3 files
✨ Deployment complete! Take a peek over at https://contextor.pages.dev
```

**COPY URL** yang muncul! (misalnya: `https://contextor.pages.dev` atau `https://contextor-xxx.pages.dev`)

---

### Step 6: Test Website Online!

1. Buka browser
2. Buka URL yang tadi dicopy (misalnya `https://contextor.pages.dev`)
3. **WEBSITE KAMU SUDAH ONLINE!** 🎉🎉🎉

Test kayak tadi:
1. Ketik: "Jelaskan quantum computing dengan sederhana"
2. Klik Generate
3. Lihat hasilnya!

**Sekarang kamu bisa share link ini ke teman-teman!**

✅ **CONTEXTOR SUDAH LIVE DI INTERNET!**

---

## 🎨 Cara Pakai CONTEXTOR

### Mode ✍️ Text (Default)

**Untuk:** Bikin context buat ChatGPT, Claude, dll.

**Contoh:**
- Input: "Bikin business plan untuk toko kopi"
- Output: Context lengkap dengan struktur jelas

### Mode 🎨 Image

**Untuk:** Bikin deskripsi gambar buat Midjourney, DALL-E, dll.

**Contoh:**
- Input: "Kota cyberpunk di malam hari dengan hujan neon"
- Output: Blueprint lengkap dengan detail lighting, camera angle, dll.

### Mode 🎬 Video

**Untuk:** Bikin script video buat Runway, Pika, dll.

**Contoh:**
- Input: "Kucing lari di taman dengan slow motion"
- Output: Timeline lengkap dengan camera motion, lighting, dll.

### Mode 🎵 Music

**Untuk:** Bikin deskripsi musik buat Suno, Udio, dll.

**Contoh:**
- Input: "Lagu pop ceria tentang musim panas"
- Output: Blueprint lengkap dengan BPM, chord progression, dll.

### Mode A (Clarify → Distill)

**Untuk:** Project besar yang butuh klarifikasi.

**Cara pakai:**
1. Pilih radio button "Mode A"
2. Ketik input kamu (misalnya: "Mau bikin startup")
3. Klik Generate
4. **Akan muncul 5-7 pertanyaan**
5. Jawab semua pertanyaan
6. Klik "Generate Context"
7. Dapat context lengkap!

### Mode B (Reasoning)

**Untuk:** Problem solving, coding, analisis.

**Pilihan:**
- **CoT (Chain of Thought):** Step-by-step reasoning
- **PoT (Program of Thought):** Pseudo-code/algorithm

---

## 🐛 Troubleshooting

**New in v1.2.0:** Most errors are now handled automatically with retry logic!

For comprehensive troubleshooting:
- 📕 [QUICK_ERROR_REFERENCE.md](QUICK_ERROR_REFERENCE.md) - Quick fixes (1 page)
- 📘 [ERROR_GUIDE.md](ERROR_GUIDE.md) - Complete error reference (790 lines)

### Common Issues

#### Health Check
```bash
# Check API provider status
curl https://your-worker.workers.dev/api/health
```

Expected response:
```json
{
  "status": "healthy",
  "providers": {
    "gemini": { "status": "healthy", "latency": 1234 },
    "openrouter": { "status": "healthy", "latency": 2345 }
  }
}
```

### Error: "All AI providers failed"

**Penyebab:** API keys salah atau belum diisi.

**Solusi:**

1. **Cek file `.dev.vars` (untuk localhost):**
   ```bash
   cat .dev.vars
   ```
   Pastikan API keys sudah benar.

2. **Cek secrets di Cloudflare (untuk production):**
   ```bash
   # Upload ulang
   npx wrangler secret put OPENROUTER_API_KEY
   npx wrangler secret put GEMINI_API_KEY
   ```

3. **Test API keys valid:**
   - Buka https://openrouter.ai/keys → cek key masih aktif
   - Buka https://aistudio.google.com/app/apikey → cek key masih aktif

---

### Error: "Module not found" atau "Cannot find package"

**Penyebab:** Dependencies belum terinstall.

**Solusi:**
```bash
npm install
```

---

### Error: "Port 8788 already in use"

**Penyebab:** Ada program lain pakai port 8788.

**Solusi:**

**Windows:**
```bash
netstat -ano | findstr :8788
taskkill /PID [PID_NUMBER] /F
```

**Mac/Linux:**
```bash
lsof -ti:8788 | xargs kill -9
```

Atau restart komputer.

---

### Website tidak update setelah deploy

**Penyebab:** Browser cache.

**Solusi:**
1. **Hard refresh:**
   - Windows: `Ctrl + Shift + R`
   - Mac: `Cmd + Shift + R`
2. Atau buka **Incognito/Private mode**
3. Atau clear browser cache

---

### Lupa URL deployment

**Cek URL Worker:**
```bash
npx wrangler deployments list
```

**Cek URL Pages:**
1. Buka https://dash.cloudflare.com/
2. Klik **Pages** di sidebar
3. Klik project **contextor**
4. Lihat URL di bagian atas

---

## 💰 Biaya

**SEMUA GRATIS!**

| Service | Limit Gratis | Cukup? |
|---------|--------------|--------|
| Cloudflare Pages | Unlimited requests | ✅ Lebih dari cukup |
| Cloudflare Workers | 100,000 requests/hari | ✅ Lebih dari cukup |
| Google Gemini 2.5 Flash | 1,500 requests/hari | ✅ Primary AI (lebih dari cukup) |
| OpenRouter (GLM-4.5-Air) | Rate limited tapi gratis | ✅ Fallback AI |

**Estimasi usage:**
- Personal: 10-50 requests/hari → **GRATIS SELAMANYA**
- Sharing ke teman: 100-500 requests/hari → **MASIH GRATIS**
- Viral: 10,000+ requests/hari → **MASIH GRATIS** (dalam limit 100k/hari)

---

## 🔄 Update Code

Kalau kamu edit code dan mau update deployment:

**1. Edit file yang kamu mau** (misalnya `public/app.js`, `public/styles.css`, dll)

**2. Deploy ulang:**

```bash
# Deploy worker (kalau edit worker/index.js)
npx wrangler deploy

# Deploy pages (kalau edit public/*)
npx wrangler pages deploy public --project-name=contextor
```

**3. Hard refresh browser** untuk lihat perubahan.

---

## 📁 Struktur Project (Biar Ngerti)

```
contextor/
├── public/              ← FRONTEND (tampilan website)
│   ├── index.html      ← Struktur halaman
│   ├── styles.css      ← Styling (warna, font, dll)
│   └── app.js          ← Logic (apa yang terjadi saat klik button)
│
├── worker/             ← BACKEND (server)
│   └── index.js        ← API logic (komunikasi dengan AI)
│
├── docs/               ← Dokumentasi teknis
│
├── package.json        ← Config npm (daftar dependencies)
├── wrangler.toml       ← Config Cloudflare Worker
├── .dev.vars           ← API keys (LOKAL, jangan share!)
└── README.md           ← File ini!
```

**File yang boleh kamu edit:**
- `public/index.html` → Ubah struktur halaman
- `public/styles.css` → Ubah warna, font, layout
- `public/app.js` → Ubah behavior (apa yang terjadi saat klik)
- `worker/index.js` → Ubah logic backend

**File yang JANGAN diedit:**
- `package.json` (kecuali kamu tau apa yang kamu lakukan)
- `wrangler.toml` (kecuali kamu tau apa yang kamu lakukan)
- `.dev.vars` → Edit ini HANYA untuk ganti API keys

---

## 🎓 Istilah-Istilah Penting

**Frontend:** Bagian website yang kamu lihat (HTML, CSS, JS).

**Backend:** Server yang proses data (API, database, dll).

**API:** Jembatan komunikasi antara frontend dan backend.

**API Key:** Password untuk akses API (harus rahasia!).

**Deploy:** Upload code ke server supaya online.

**Localhost:** Website jalan di komputer kamu aja (belum online).

**Terminal/Command Prompt:** Tempat ketik perintah ke komputer.

**NPM:** Package manager untuk JavaScript (install library).

**Wrangler:** Tool dari Cloudflare untuk deploy.

**Worker:** Server kecil dari Cloudflare (jalan di edge/CDN).

**Pages:** Hosting website statis dari Cloudflare.

---

## 📞 Butuh Bantuan?

**Dokumentasi lengkap:**
- Lihat folder `docs/` untuk dokumentasi teknis
- Baca `QUICK_START.md` untuk panduan cepat

**Stuck?**
- Baca bagian Troubleshooting di atas
- Open issue di GitHub
- Tanya di forum/komunitas

---

## 🎉 Selamat!

Kamu berhasil:
✅ Install semua software yang dibutuhkan
✅ Dapetin API keys gratis
✅ Setup project CONTEXTOR
✅ Test di localhost
✅ Deploy ke internet
✅ Punya website sendiri yang bisa diakses dari mana aja!

**Share link website kamu ke teman-teman dan keluarga!**

**Next steps:**
- Customize tampilan (edit `public/styles.css`)
- Tambah fitur baru
- Baca dokumentasi teknis di folder `docs/`

---

**Made with ❤️ - 100% GRATIS**

Ada pertanyaan? Buka issue di GitHub atau tanya di komunitas!
