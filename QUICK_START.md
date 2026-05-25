# URL Security Analysis System - Quick Start Guide

## What is This Application?

This is an **Enterprise-Grade URL Security Analysis System** built with:
- **Frontend**: Next.js 15 + React 19 + Tailwind CSS
- **Backend**: Next.js API Routes + Supabase
- **AI**: Llama 3 (via local Ollama integration)
- **Security**: Threat detection heuristics + AI reasoning agents

## ⚡ Quick Start (2 Options)

### Option 1: Batch File (Windows - Easiest)
```bash
Double-click: run_web_app.bat
```
- Auto-detects Node.js
- Auto-installs dependencies
- Launches on http://localhost:3001

### Option 2: Command Line (All Platforms)
```bash
cd "d:\URL SYSTEM\url-system-temp"
npm install
npm run dev
```

Then open: **http://localhost:3001** in your browser

## 📋 System Requirements

- **Node.js**: 18+ (Download: https://nodejs.org/)
- **npm**: 9+ (comes with Node.js)
- **Browser**: Modern browser (Chrome, Firefox, Edge, Safari)
- **RAM**: 4 GB minimum

## 🎯 What This Application Does

The URL Security Analysis System is designed to:

1. **Scan URLs** - Analyze suspicious or unknown URLs
2. **Detect Threats** - Identify phishing, malware, spam
3. **Analyze Images** - OCR and threat detection in screenshots
4. **Email Analysis** - Check email addresses for threats
5. **AI Reasoning** - Use Llama 3 for advanced threat analysis
6. **Memory System** - Learn from past threats
7. **Live Feed** - Real-time threat monitoring

## 🚀 Running the Application

### Windows (Easiest)
1. Double-click: `run_web_app.bat`
2. Wait for "STARTING DEVELOPMENT SERVER"
3. Open browser to: http://localhost:3001

### Mac/Linux
```bash
cd "d:\URL SYSTEM\url-system-temp"
npm install
npm run dev
```

### Developer Mode
For hot-reload development:
```bash
npm run dev
```

### Production Build
```bash
npm run build
npm run start
```

## 📊 Application Architecture

```
src/
├── frontend/          → React UI Components
│   ├── components/    → Reusable UI modules
│   └── state/         → Zustand store
├── backend/           → API & Database
│   └── database/      → Supabase client
├── ai/                → Llama 3 Agents
│   ├── agents/        → URLAgent, EmailAgent, etc.
│   ├── prompts/       → AI prompt templates
│   └── memory/        → Threat memory system
├── cyber/             → Security Logic
│   ├── heuristics/    → Threat detection rules
│   ├── detection/     → Image analysis
│   └── scoring/       → Threat scoring
└── app/               → Next.js routes
```

## 🔗 Features

### Frontend Features
- **Cinematic UI** - Animated threat visualization
- **Live Threat Feed** - Real-time security events
- **Interactive Dashboard** - System status monitoring
- **Responsive Design** - Works on desktop and mobile

### Backend Features
- **API Routes** - RESTful endpoints for scanning
- **Rate Limiting** - Protect against abuse
- **Database Integration** - Supabase PostgreSQL
- **File Uploads** - Image and document analysis

### AI Features
- **Llama 3 Integration** - Local AI via Ollama
- **Threat Reasoning** - AI analyzes complex threats
- **Email Agent** - Specialized email analysis
- **URL Agent** - Deep URL inspection
- **Persistent Memory** - Learn from past threats

### Security Features
- **Phishing Detection** - Identify fake login pages
- **Malware Scoring** - Risk assessment
- **Disposable Email Detection** - Identify temporary emails
- **Scam Detection** - Identify scam websites
- **Image Analysis** - OCR and threat detection

## ⚙️ Configuration

### Environment Variables (Optional)
Create `.env.local` in the project root:

```env
# Supabase (Optional)
NEXT_PUBLIC_SUPABASE_URL=your_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key

# Ollama AI (Optional, for advanced AI features)
OLLAMA_API_URL=http://localhost:11434
```

### Port Configuration
Default: **3001**

To change port:
```bash
npm run dev -- -p 3000
```

## 🐛 Troubleshooting

### Node.js Not Found
```
Error: 'node' is not recognized
```
→ Install from: https://nodejs.org/
→ Make sure "Add to PATH" is checked

### Port Already in Use
```
Error: Port 3001 is already in use
```
→ Kill process on port 3001
→ Or change port: `npm run dev -- -p 3000`

### Dependencies Error
```
npm ERR! code ERESOLVE
```
→ Run: `npm install --force`
→ Or: `npm install --legacy-peer-deps`

### Build Errors
```
TypeScript errors during build
```
→ Run: `npm run build`
→ Check console for specific errors
→ Make sure all dependencies installed

## 📱 Accessing the Application

Once running, access:

**Local**: http://localhost:3001
**From other machine**: http://YOUR_IP:3001

## 🎨 Development Tips

### Hot Reload
Changes to code automatically reload in browser

### Debug Mode
Open browser DevTools: F12 or Right-click → Inspect

### Lint Check
```bash
npm run lint
```

### Format Code
```bash
npx prettier --write .
```

## 🔐 Security Notes

- **Do not expose** on public internet without authentication
- **Use HTTPS** in production
- **Validate inputs** on backend
- **Use environment variables** for secrets
- **Keep dependencies** updated

## 📚 Additional Resources

- **Next.js**: https://nextjs.org/docs
- **React**: https://react.dev
- **Tailwind CSS**: https://tailwindcss.com
- **Supabase**: https://supabase.io
- **Ollama**: https://ollama.ai

## 🆘 Getting Help

1. Check browser console for errors (F12)
2. Check terminal output for backend errors
3. Review application README.md
4. Check specific service documentation

## ✅ Status

**Application Status**: ✓ Ready to Run
**Last Updated**: 2026-05-25

---

**Enjoy using the URL Security Analysis System!** 🚀
