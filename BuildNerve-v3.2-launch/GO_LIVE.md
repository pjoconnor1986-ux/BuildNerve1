# BuildNerve — Go Live

## Recommended stack
- App hosting: Vercel
- Database/Auth/Storage: Supabase
- AI: OpenAI API
- Domain: your chosen BuildNerve domain after trademark/domain clearance

## 1. Supabase
1. Create a Supabase project in the UK/EU region appropriate for your data requirements.
2. Open SQL Editor and run `supabase/schema.sql` once.
3. From the project Connect panel copy:
   - Project URL
   - Publishable key
4. In Authentication, configure email/password and your production Site URL / redirect URLs.

## 2. Environment variables
Set these in Vercel Production, Preview and Development as appropriate:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- `OPENAI_API_KEY` (server-side secret)
- `OPENAI_MODEL=gpt-5`

Never place the OpenAI secret in a `NEXT_PUBLIC_` variable.

## 3. Deploy
From the project root using Vercel CLI:
```bash
vercel link
vercel env pull .env.local
npm install
npm run typecheck
npm run build
vercel deploy
# verify preview, then:
vercel deploy --prod
```

## 4. Smoke test before inviting anyone
- `/api/health` returns `ok: true`, `supabaseConfigured: true`.
- Sign up with a fresh email.
- Create the first company workspace.
- Sign out / sign back in.
- Create a project through API/UI when wired.
- Create and retrieve an action and diary.
- Request a signed private document upload URL.
- Confirm one organisation cannot read another organisation's rows or storage path.
- Test Quick Capture with and without the OpenAI key.
- Test mobile Safari/Chrome and PWA install behaviour.

## 5. Before customer beta
- Finish invite/member administration.
- Add rate limits to AI/capture endpoints.
- Persist Quick Capture results to `capture_events`, `actions`, `agent_proposals` and `audit_events` after explicit user acceptance.
- Add structured application logging/error monitoring.
- Add backups/retention and a documented data deletion process.
- Security review / penetration test.
- Privacy policy, terms, DPA/subprocessor list and cookie handling.
- UK construction safety/legal review of workflow wording and approval boundaries.

## Launch status
This package is a **launch candidate**, not a claim of completed hosting. The chat environment has no connected Vercel/GitHub account, so the final account-bound deployment must be run in your hosting account.
