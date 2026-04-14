# Pending Actions

This file is the persistent list of next actions for the Immigration Platform project.
Future work sessions should review and update this file as tasks are completed or added.

## Current Priorities

- Test the immigrant documents page and settings pages end to end with real user accounts and real file uploads.
- Verify the `case-documents` bucket MIME-type allow list covers all document types used in production (currently: PDF, PNG, JPG, JPEG, DOC, DOCX).

## Recently Completed

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
