# Pending Actions

This file is the persistent list of next actions for the Immigration Platform project.
Future work sessions should review and update this file as tasks are completed or added.

## Migrations Applied ✓

All database migrations are live on the Supabase project (`vxifgqdaccxnsctkgdes`):

- `add_cases_table_and_rls` — `cases` table + RLS for immigrants, lawyers, admin
- `add_case_payments_and_events` — `case_payments` + `case_events` tables + RLS
- `add_case_id_to_existing_tables` — `case_id` + `file_size` on `case_documents`; `case_id` on `case_notes`; updated RLS on both
- `add_case_id_to_lawyer_requests` — `case_id` on `lawyer_assignment_requests`; updated policies; replaced per-immigrant unique index with per-case unique index
- `backfill_legacy_cases` — 4 immigrants → 4 legacy cases created; migration event written per case; docs/notes/requests linked

The separate `20260415_add_admin_cases_rls.sql` file is superseded — admin policies were included inline in the migrations above.

## Release Blockers

- Validate the updated onboarding path with real confirmed accounts:
  - Google onboarding should land immigrants in `/immigrant/cases/new`
  - email signup should still guide immigrants into first-case creation after first login
- Decide whether to retire or fully migrate the remaining legacy lawyer detail compatibility route at `/lawyer/immigrants/[id]`.
- Complete legal review of the Nomad content gaps listed below before production rollout.

## Blocked on Human Testing

- **Test the full multi-case flow with real accounts:**
  - Prior failed case
  - New Nomad Holder case approved
  - Nomad Family case linked to holder
  - Nomad Renewal case linked to the prior Nomad case
- **Validate case-scoped document uploads and access rules end to end** with real file uploads and lawyer assignment.
- **Verify the `case-documents` bucket MIME-type allow list** covers all Nomad document types used in production.
  - App accepts: `.pdf,.png,.jpg,.jpeg,.doc,.docx`
  - Nomad-specific types needed: passport, NIE, visa, criminal record, birth certificate, marriage certificate, work contract, bank statement, remote work letter, foreign company certificate, CV, degree, tax record, health insurance, social security proof

## QA Validation

- Run end-to-end multi-case QA for Holder, Family, and Renewal with real accounts and linked-case data.
- Validate case-scoped RLS for documents, notes, payments, events, and lawyer assignment requests.
- Validate legacy-route redirects and support-facing behavior after migration.
- Execute business acceptance validation for:
  - onboarding to first usable case state
  - failed previous case does not block new Nomad case
  - Family and Renewal remain distinct from Holder in status, payments, and documents
  - lawyer assignment remains per case, not per immigrant
  - linked/source case IDs behave consistently
- Use QA severity model during triage:
  - `P0` canonical business flow broken / data leakage / cross-case corruption
  - `P1` business-truth mismatch / operator inconsistency / release blocker
  - `P2` UX ambiguity / unsupported edge case / doc mismatch
  - `P3` polish / non-blocking friction

## Compatibility Rollout (immigrants.case_status / assigned_lawyer_id)

**Status: compatibility mode still active — cleanup remains later.**

- All new immigrant/lawyer flows read from `cases.stage` and `cases.assigned_lawyer_user_id`.
- `immigrants.case_status` and `immigrants.assigned_lawyer_id` are still written by auth signup and complete-profile (harmless legacy initialization — no new flow reads from them).
- Admin immigrants page no longer overrides these fields directly; it now acts as a read-only directory and pushes operators into `/admin/cases`.
- Admin dashboard `casesInReview` stat **has been updated** to query `cases.stage = 'lawyer_review'`.
- Future cleanup:
  - stop writing legacy immigrant workflow fields during signup/onboarding once all compatibility surfaces are retired
  - decide whether to keep or remove remaining legacy lawyer immigrant detail pages

## Legal Content QA — Nomad (Review Required)

Ministry sources cannot be fetched directly due to SSL certificate issues on gob.es. Based on cross-referencing third-party sources against the app content, the Holder/Family/Renewal bullets are broadly accurate. **Specific gaps to review with a lawyer before launch:**

- **Income threshold**: The official 2026 requirement is **€2,850/month** (200% SMI). The app says "enough income" without a figure. Decide whether to add the specific number.
- **Renewal — minimum stay**: Renewal requires **183 days/year** in Spain during the prior authorization period. Not currently surfaced in the app content.
- **Renewal — timing window**: Applications can be filed 60 days before or 90 days after the card expiry. Not mentioned in the app.
- **Family — income uplift**: Each dependent requires 75% SMI for the first + 25% SMI per additional. Currently described only as "financial sufficiency linked to the holder."

These are the four specific points to validate with the official PDFs:
- https://www.inclusion.gob.es/documents/d/unidadgrandesempresas/informacion-documentacion-pagina-web-titular-v2
- https://www.inclusion.gob.es/documents/d/unidadgrandesempresas/informacion-documentacion-pagina-web-familiares-v2
- https://www.inclusion.gob.es/en/web/unidadgrandesempresas/teletrabajadores

## Lower Priority

- Review and polish the remaining UGE categories beyond Nomad for later detailed rollout.

## Ops / Business Rules

- Decide whether Family must require a linked holder case and whether Renewal must require a prior Nomad case.
- Define manual payment operations: who requests, who marks paid, and what evidence is accepted.
- Create a support/admin rulebook for linked cases, renewals, and payment-state handling.
- Align release checklist, support notes, and admin playbooks to case-level workflow only.

## Recently Completed

- Added `QA_RELEASE_READINESS.md` with the combined QA validation plan, workflow incoherence report, release gate, validation matrix, severity model, and ownership map for the multi-case platform.
- Updated immigrant onboarding so Google/profile completion sends immigrants directly into `/immigrant/cases/new` instead of a legacy-feeling dashboard landing.
- Strengthened the immigrant dashboard empty state with a direct first-case CTA.
- Reworked `/admin/immigrants` into a directory/context view and removed immigrant-level workflow edits from that screen.
- Rewrote `README.md` to document the case-centric Nomad multi-case architecture, canonical routes, compatibility notes, and current migrations.
- Admin dashboard `casesInReview` count fixed to query `cases.stage = 'lawyer_review'` (was incorrectly querying `immigrants.case_status = 'in_review'`).
- Added `supabase/migrations/20260415_add_admin_cases_rls.sql` with admin read/write RLS for all case-model tables.
- Added `/admin/cases` list page with search, stage filter, and track filter.
- Added `/admin/cases/[id]` detail page (immigrant, lawyer, documents, payments, notes, timeline).
- Added `Cases` nav item to AdminLayout (all 3 locales).
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
