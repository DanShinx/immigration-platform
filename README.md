# Immigration Platform Spain

Multi-language immigration case platform for Spain, built with Next.js 14, Supabase, and Tailwind CSS. The product is now centered on `cases`, not a single immigrant-level workflow.

## Stack

- Next.js 14 App Router
- TypeScript
- Supabase Auth, Postgres, and Storage
- Tailwind CSS

## Local Setup

1. Install dependencies:

```bash
npm install
```

2. Create `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://<your-project-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key>

# Optional; defaults to "case-documents"
NEXT_PUBLIC_SUPABASE_DOCUMENTS_BUCKET=case-documents
```

3. Apply migrations:

```bash
supabase db push
```

Current migrations:

- `20260414_add_lawyer_assignment_requests.sql`
- `20260415_add_multi_case_nomad_model.sql`
- `20260415_add_admin_cases_rls.sql`

4. Start the app:

```bash
npm run dev
```

## Current Product Model

The live product truth is the multi-case model introduced for the Nomad release.

- Public site shows all official UGE immigration categories.
- Only `Nomad` is fully detailed in the current release.
- Nomad is split into 3 separate tracks:
  - `nomad_holder`
  - `nomad_family`
  - `nomad_renewal`
- Immigrants can open multiple cases over time.
- Each case has its own:
  - stage
  - outcome
  - assigned lawyer
  - documents
  - payments
  - events/timeline

## Core Tables

### `profiles`

Shared account record created per authenticated user.

- `user_id`
- `role`
- `full_name`
- `email`
- `phone`

### `immigrants`

Person profile for immigrant users.

- `user_id`
- `full_name`
- `email`
- `nationality`
- `passport_number`
- `date_of_birth`
- `address_in_spain`
- `avatar_url`

Compatibility note:

- `immigrants.case_status`
- `immigrants.assigned_lawyer_id`

still exist for legacy compatibility, but they are no longer the canonical workflow source of truth.

### `lawyers`

Professional profile for lawyer users.

- `user_id`
- `full_name`
- `email`
- `license_number`
- `specialization`
- `bar_association`
- `bio`
- `is_active`
- `approval_status`

### `cases`

Primary workflow entity.

- `immigrant_id`
- `category_code`
- `track_code`
- `title`
- `summary`
- `stage`
- `outcome`
- `assigned_lawyer_user_id`
- `source_case_id`
- `linked_primary_case_id`
- `metadata`

Canonical workflow fields now live here:

- case stage
- case outcome
- assigned lawyer
- linked-case relationships

### `case_documents`

Documents are now case-scoped.

- `immigrant_id`
- `case_id`
- `document_type`
- `file_name`
- `file_url`
- `notes`
- `uploaded_by`
- `uploaded_at`

Storage path now uses the case context in the UI upload flow.

### `case_payments`

Manual payment milestones per case.

- `case_id`
- `milestone_type`
- `status`
- `label`
- `amount_eur`
- `created_at`

### `case_events`

Timeline / audit-style case history.

- `case_id`
- `actor_user_id`
- `event_type`
- `title`
- `description`
- `created_at`

### `case_notes`

Private lawyer notes, now also scoped to `case_id`.

### `lawyer_assignment_requests`

Lawyer requests are now case-scoped.

- `immigrant_id`
- `case_id`
- `lawyer_user_id`
- `status`
- `message`

Important change:

- the uniqueness rule is now one pending request per case, not one pending request per immigrant

## Storage

Bucket: `case-documents`

- private bucket
- default max file size: 50 MB
- allowed types include PDF, PNG, JPG, DOC, DOCX

The product upload flow now stores files against the selected case and writes `case_documents.case_id`.

## RLS Summary

RLS is enabled across the platform.

Key multi-case rules:

- immigrants can only read and write their own cases and case-linked records
- lawyers can only access cases assigned to them
- admin policies now exist for case-level oversight across:
  - `cases`
  - `case_payments`
  - `case_events`
  - `case_documents`
  - `case_notes`
  - `lawyer_assignment_requests`

See:

- `supabase/migrations/20260415_add_multi_case_nomad_model.sql`
- `supabase/migrations/20260415_add_admin_cases_rls.sql`

## Routes

### Public

- `/`
- `/auth/login`
- `/auth/signup`
- `/auth/callback`
- `/auth/complete-profile`
- `/categories/nomad`

### Immigrant

Canonical routes:

- `/immigrant/dashboard`
- `/immigrant/cases`
- `/immigrant/cases/new`
- `/immigrant/cases/[id]`
- `/immigrant/lawyers`
- `/immigrant/documents`
- `/immigrant/settings`

Compatibility route:

- `/immigrant/my-case` redirects to the newest active case or the case index

### Lawyer

Canonical routes:

- `/lawyer/dashboard`
- `/lawyer/cases`
- `/lawyer/cases/[id]`
- `/lawyer/requests`
- `/lawyer/documents`
- `/lawyer/settings`

Compatibility route:

- `/lawyer/immigrants` redirects to `/lawyer/cases`

### Admin

- `/admin/dashboard`
- `/admin/cases`
- `/admin/cases/[id]`
- `/admin/immigrants`
- `/admin/lawyers`
- `/admin/flags`

Admin workflow note:

- case operations should happen from `/admin/cases`
- `/admin/immigrants` is now a directory/context view, not the canonical workflow control surface

## Nomad Release Scope

Current detailed category:

- Nomad

Current Nomad tracks:

- Holder
- Family
- Renewal

Official source material used for the product copy and structure:

- [UGE authorizations](https://www.inclusion.gob.es/en/web/unidadgrandesempresas/autorizaciones-y-requisitos)
- [Nomad holder requirements](https://www.inclusion.gob.es/documents/d/unidadgrandesempresas/informacion-documentacion-pagina-web-titular-v2)
- [Nomad family requirements](https://www.inclusion.gob.es/documents/d/unidadgrandesempresas/informacion-documentacion-pagina-web-familiares-v2)
- [Teleworker FAQ](https://www.inclusion.gob.es/en/web/unidadgrandesempresas/teletrabajadores)

## Internationalization

Supported locales:

- `es`
- `en`
- `pt`

Translations live in `src/lib/translations.ts`, and case-category content lives in `src/lib/case-content.ts`.

## Quality Checks

```bash
npm run lint
npm run build
```

## Important Transition Notes

Some legacy fields and screens still exist for compatibility during the migration from the single-case model. When product behavior and legacy fields disagree, treat the case-level model as canonical.
