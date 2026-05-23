# 🛡️ URL SYSTEM - Enterprise Threat Intelligence

URL SYSTEM is an enterprise-grade, real-time threat intelligence and cybersecurity analysis platform. The codebase is organized using a highly scalable 4-team Domain Driven Design (DDD) architecture.

---

## 🏗️ Team Ownership & Domains

### 1. 🎨 FRONTEND TEAM (`/src/frontend`)
Owns the cinematic dashboard UI, global state management, responsive layouts, and interactive visual effects.
- **Dashboard & Core UI**: High-fidelity threat interfaces including [CoreInterface.tsx](file:///c:/Users/ashwi/Downloads/URL-SYSTEM/src/frontend/components/CoreInterface.tsx), [ThreatVisualizer.tsx](file:///c:/Users/ashwi/Downloads/URL-SYSTEM/src/frontend/components/ThreatVisualizer.tsx), and the telemetry [TacticalLoader.tsx](file:///c:/Users/ashwi/Downloads/URL-SYSTEM/src/frontend/components/TacticalLoader.tsx).
- **Cinematic Effects & Components**:
  - `HelloVietnameseEffect` text scrolling effects.
  - Interactive glassmorphic `HoverButton`.
  - Animated `Marquee` display ticker.
  - Customized vector-based `URLSystemLogo`.
- **State Management**: React-based Zustand store at [useUIStore.ts](file:///c:/Users/ashwi/Downloads/URL-SYSTEM/src/frontend/state/useUIStore.ts).
- **Styling & Motion**: Tailwind CSS v4 combined with Framer Motion transitions.

### 2. ⚡ BACKEND TEAM (`/src/backend`)
Owns core API routing, database schema interactions, request validation, and server-side middleware.
- **API Interfaces**: Next.js API route handlers (e.g. image scanning APIs at [route.ts](file:///c:/Users/ashwi/Downloads/URL-SYSTEM/src/app/api/analyze-image/route.ts)).
- **Database Integration**: Supabase client initialization, schema migrations, and real-time database queries defined in `supabase_schema.sql`.

### 3. 🧠 AI TEAM (`/src/ai`)
Owns the local LLM orchestration (Ollama/Llama 3), persistent threat memory syncing, and contextual web scraping.
- **Autonomous Agents**:
  - `URLAgent` — Inspects URL syntax, domain registration, and hosting risk profiles.
  - `EmailAgent` — Analyzes email headers, body content, and sender behavior signatures.
  - `ImageThreatAgent` — Evaluates text extracted via OCR from images for phishing templates or deceptive layout patterns.
  - `ThreatReasoningAgent` — Resolves conflicts between heuristic scores and AI-based memory records to form a unified threat verdict.
- **Services**:
  - `siteMetadataService.ts` — Fetches metadata headers and open-graph tags from inspected target sites.
  - `threatMemoryService.ts` — Synchronizes threat contexts and patterns across analysis runs.
- **Prompts**: Modular prompt engineering and templating system in `promptEngine.ts`.

### 4. 🕵️ CYBERSECURITY TEAM (`/src/cyber`)
Owns threat signature databases, real-time heuristic validation rules, and threat scoring algorithms.
- **Heuristic Engines**:
  - `urlHeuristics.ts` — Validates TLDs, typosquatting risk, character entropy, and domain age.
  - `emailHeuristics.ts` — Examines DMARC/SPF alignability, disposable domains, and spoofed display names.
  - `imageHeuristics.ts` — Analyzes OCR texts, logo profiles, and structural layout anomalies.
- **Scoring Engine**: [threatScoringService.ts](file:///c:/Users/ashwi/Downloads/URL-SYSTEM/src/cyber/scoring/threatScoringService.ts) dynamically computes threat levels, adjusting confidence based on past memory.

---

## 📂 Additional Domains
- `/src/shared`: Utility functions and global constants.
- `/src/types`: Shared TypeScript interfaces and threat schemas (e.g., `ScanResult`, `ThreatMemoryRecord`).
- `/src/app`: Thin wrappers connecting frontend pages to backend APIs.

---

## 🔄 Development Workflow
When writing imports, use the configured TypeScript path aliases:
- `@frontend/*` ➡️ `/src/frontend/*`
- `@backend/*` ➡️ `/src/backend/*`
- `@ai/*` ➡️ `/src/ai/*`
- `@cyber/*` ➡️ `/src/cyber/*`
- `@projectTypes/*` ➡️ `/src/types/*`
- `@shared/*` ➡️ `/src/shared/*`

---

## 🚀 Running Locally
1. Start the Ollama local AI server and pull the default model:
   ```bash
   ollama serve
   ollama run llama3
   ```
2. Start the development server (runs both Next.js and displays AI instructions):
   ```bash
   npm run dev:all
   ```
   The application will be accessible at `http://localhost:3001`.
