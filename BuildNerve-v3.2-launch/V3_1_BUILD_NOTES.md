# BuildNerve v3.1 Build Notes

## Product architecture

BuildNerve is positioned as the intelligence layer connecting field operations, project management, commercial control and company leadership. Groundworks remains the first deep vertical, but the name and data model can support wider construction businesses.

## v3.1 production core

- Identity: Supabase Auth
- Tenancy: organisation-scoped data
- Roles: director, PM, QS, site agent, engineer, foreman, buyer, admin, viewer
- Projects: live CRUD API foundation
- Site records: daily diary API
- Actions: cross-project action API
- Documents: private-storage signed upload handshake + metadata
- Audit: immutable event table foundation
- Notifications: per-user queue foundation
- AI: server-only model call with construction-specific safety/authority guardrails
- Deployment: Vercel or Docker
- Mobile: responsive UI + PWA manifest foundation

## Next sprint

Wire the existing v3 dashboard components to `/api/bootstrap`, replace remaining seeded portfolio data with live database records, add invite/team administration, implement storage RLS, document parsing with source citations, and offline-first diary capture.
