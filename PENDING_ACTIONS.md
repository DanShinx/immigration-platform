# Pending Actions

This file is the persistent list of next actions for the Immigration Platform project.
Future work sessions should review and update this file as tasks are completed or added.

## Current Priorities

- Apply and validate the multi-case migration plan in Supabase:
  - `cases`
  - `case_documents.case_id`
  - `case_payments`
  - `case_events`
  - `lawyer_assignment_requests.case_id`
  - `case_notes.case_id`
- Confirm the compatibility rollout for replacing `immigrants.case_status` and `immigrants.assigned_lawyer_id` with case-level workflow fields in production data and admin tooling.
- Test the full multi-case flow with real accounts:
  - prior failed case
  - new Nomad Holder case approved
  - Nomad Family case linked to holder
  - Nomad Renewal case linked to the prior Nomad case
- Validate case-scoped document uploads and access rules end to end with real file uploads and lawyer assignment.
- Verify the `case-documents` bucket MIME-type allow list covers all Nomad document types used in production.
- Review and polish the remaining UGE categories beyond Nomad for later detailed rollout.
- Finalize legal-content QA for Nomad Holder, Family, and Renewal against these official Ministry sources:
  - https://www.inclusion.gob.es/en/web/unidadgrandesempresas/autorizaciones-y-requisitos
  - https://www.inclusion.gob.es/documents/d/unidadgrandesempresas/informacion-documentacion-pagina-web-titular-v2
  - https://www.inclusion.gob.es/documents/d/unidadgrandesempresas/informacion-documentacion-pagina-web-familiares-v2
  - https://www.inclusion.gob.es/en/web/unidadgrandesempresas/teletrabajadores
  - https://www.inclusion.gob.es/en/web/unidadgrandesempresas/documentacion-orientativa

## Recently Completed

- Multi-case architecture implemented around `cases`, `case_documents.case_id`, `case_payments`, and `case_events`.
- Public homepage now shows official UGE category discovery, with Nomad fully detailed and the rest visible as upcoming categories.
- Added `/categories/nomad` with Holder, Family, and Renewal entry points plus official-source links.
- Added immigrant multi-case flows:
  - `/immigrant/cases`
  - `/immigrant/cases/new`
  - `/immigrant/cases/[id]`
  - `/immigrant/my-case` now redirects into the new case model
- Added lawyer multi-case flows:
  - `/lawyer/cases`
  - `/lawyer/cases/[id]`
  - legacy `/lawyer/immigrants*` routes now redirect into case-centric routes
- Migrated immigrant and lawyer dashboards to case-based summaries, counts, and navigation.
- Updated lawyer assignment requests to work per case instead of per immigrant.
- Updated immigrant and lawyer document views to operate on `case_id`.
- Public homepage for `Immigration Platform - Spain`.
- Login and signup flows for immigrants and lawyers.
- Google OAuth onboarding flow for first-time users without a role profile.
- Immigrant lawyer selection page and lawyer request review panel.
- Role-based dashboards with middleware protection.
- Immigrant documents page with upload, open, and delete actions.
- Lawyer documents page for reviewing uploaded files from assigned immigrants.
- Immigrant case page at `/immigrant/my-case`.
- Applied migration `add_lawyer_assignment_requests_and_fix_rls`:
  - Created `lawyer_assignment_requests` table with indexes and unique constraint on pending requests per immigrant.
  - Full RLS policies for both immigrant and lawyer roles.
  - DB trigger `on_request_accepted` to auto-reject competing requests and auto-assign the lawyer.
  - Added `lawyers_visible_to_all_authenticated` so immigrants can browse active lawyers.
  - Added `immigrants_lawyer_request_select` so lawyers can read immigrant data for pending requests.
  - Added `immigrants_lawyer_assign_update` so lawyers can set `assigned_lawyer_id` when accepting.
- Fixed unsafe documents query in `ImmigrantDashboardPage` when no immigrant record exists.
- Configured Supabase Storage bucket `case-documents` (private, 50 MB limit, PDF/image/Office types) with full RLS policies for upload, read, and delete.
- Built `/immigrant/settings` — edit name, phone, nationality, passport, DOB, address.
- Built `/lawyer/settings` — edit name, phone, license, specialization, bar association, bio, visibility toggle.
- Added settings translations to all three locales (ES, EN, PT).
- Configured ESLint (`.eslintrc.json`) — `npm run lint` passes with zero errors and no setup prompt.
- Added `README.md` with full setup, schema, storage, RLS, routes, i18n, and deployment docs.
