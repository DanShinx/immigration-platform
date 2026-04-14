# Pending Actions

This file is the persistent list of next actions for the Immigration Platform project.
Future work sessions should review and update this file as tasks are completed or added.

## Current Priorities

- Configure the Supabase Storage bucket `case-documents` and confirm upload permissions for immigrants and read permissions for the assigned lawyer.
- Verify the `case_documents` table schema in Supabase matches the app flow: `immigrant_id`, `document_type`, `file_name`, `file_url`, `uploaded_at`, and optional `notes`.
- Test the new immigrant documents page end to end with a real user account and real file upload.
- Build the settings pages for both roles: `/immigrant/settings` and `/lawyer/settings`.
- Implement the lawyer selection and assignment flow so immigrants can be matched to the correct lawyer securely at scale.
- Add Supabase Row Level Security policies to guarantee lawyers can only access immigrants assigned to them.
- Add project documentation for setup, Supabase schema, storage buckets, and deployment flow.
- Configure ESLint fully so `npm run lint` runs without the first-time setup prompt.

## Recently Completed

- Public homepage for `Immigration Platform - Spain`.
- Login and signup flows for immigrants and lawyers.
- Role-based dashboards with middleware protection.
- Immigrant documents page with upload, open, and delete actions.
- Lawyer documents page for reviewing uploaded files from assigned immigrants.
- Immigrant case page at `/immigrant/my-case`.
