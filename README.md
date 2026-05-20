# URL SYSTEM - Enterprise Architecture

URL SYSTEM has been restructured into an enterprise-grade, 4-team Domain Driven Design (DDD) architecture.

## Team Ownership & Domains

### 1. FRONTEND TEAM (`/src/frontend`)
Owns the cinematic UI, state management, layouts, and visual effects.
- **Components**: Tactical UI modules (`LiveThreatFeed`, `ThreatVisualizer`)
- **State**: Zustand store (`useUIStore`)
- **Animations**: Framer Motion configurations

### 2. BACKEND TEAM (`/src/backend`)
Owns the core API logic, database interactions, middleware, and request validation.
- **Middleware**: API security headers and rate limiting.
- **Database**: Supabase client initialization and queries.
- **Services**: API orchestration and external upload handling.

### 3. AI TEAM (`/src/ai`)
Owns the Ollama integration, Llama 3 agents, and persistent memory systems.
- **Agents**: `URLAgent`, `EmailAgent`, `ThreatReasoningAgent`
- **Prompts**: `promptEngine.ts`
- **Memory**: `threatMemoryService.ts` for context syncing.

### 4. CYBERSECURITY TEAM (`/src/cyber`)
Owns the threat detection heuristics, scoring logic, and attack signatures.
- **Heuristics**: Hardcoded rules for identifying phishing, disposable emails, and scam domains.
- **Scoring**: `threatScoringService.ts` (modifies confidence based on AI memory).

### Additional Domains
- `/src/shared`: Utilities and constants shared across all teams.
- `/src/types`: Global TypeScript interfaces (`ThreatMemoryRecord`, `ScanResult`, etc.).
- `/src/app`: The Next.js App Router (Thin wrappers connecting frontend and backend).

## Development Workflow
When making changes, always use the configured path aliases:
- `@frontend/*`
- `@backend/*`
- `@ai/*`
- `@cyber/*`
- `@projectTypes/*`
- `@shared/*`

## Running Locally
```bash
npm run dev:all
```
This boots the Next.js server and prints instructions for verifying the Ollama AI service is running.
