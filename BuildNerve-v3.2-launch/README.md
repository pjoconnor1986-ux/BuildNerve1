# BuildNerve v3.2 — Agentic Construction Core

BuildNerve v3.2 focuses on **ease, speed and agentic workflows** for UK construction businesses. The UI is deliberately simplified around a Today screen, Quick Capture and one cross-functional AI assistant.

## What changed from v3.1

- New **Today** home screen with a ranked intervention queue
- New **Quick Capture** workflow: type/dictate one site update and generate a diary record, actions, risks, commercial evidence prompts and next steps
- New `/api/capture` agent endpoint with safe demo fallback
- Human approval boundary for safety-critical and binding commercial actions
- Simplified mobile-first navigation and floating capture button
- Role-neutral fast actions: Plan tomorrow, Protect margin, Check readiness
- Agentic Observe → Reason → Prepare → Escalate → Learn workflow
- Activity/evidence trail screen and `/api/activity` foundation
- `capture_events`, `audit_events` and `agent_proposals` database tables
- PWA manifest updated for BuildNerve v3.2
- Existing Supabase auth/onboarding/project/action/diary/document foundations retained from v3.1

## Run locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

Without an OpenAI key, Quick Capture and BuildNerve AI run in deterministic demo/fallback mode. Add `OPENAI_API_KEY` to `.env.local` for live AI.

## Production deployment

Vercel: import the repository and configure environment variables from `.env.example`.

Docker:
```bash
docker build -t buildnerve-v3-2 .
docker run --env-file .env.local -p 3000:3000 buildnerve-v3-2
```

## Most important production sprint after this

1. Connect Quick Capture results to real Supabase CRUD.
2. Persist agent proposals and require approval according to role/risk.
3. Add image/photo capture and document ingestion.
4. Add speech-to-text input on supported mobile browsers/native wrapper.
5. Add push notifications and role-specific Today queues.
6. Add offline queue/sync for site diaries and captures.
7. Add source-linked drawing/spec revision analysis.
8. Add programme import and commercial event/evidence linking.

## Safety boundary

BuildNerve is decision support and workflow automation. It must not issue permits, certify inspections, authorise excavations, approve temporary works, or replace authorised competent-person decisions.
