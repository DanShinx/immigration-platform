# Immigration Platform — Spain

A bilingual (ES / EN / PT) case management platform connecting immigrants with specialized immigration lawyers in Spain. Built with Next.js 14, Supabase, and Tailwind CSS.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14 (App Router) |
| Database & Auth | Supabase (PostgreSQL + Auth) |
| Storage | Supabase Storage |
| Styling | Tailwind CSS |
| Language | TypeScript |

---

## Local Setup

### 1. Prerequisites

- Node.js 18+
- A Supabase project (free tier works)

### 2. Install dependencies

```bash
npm install
```

### 3. Environment variables

Create `.env.local` in the project root:

```env
NEXT_PUBLIC_SUPABASE_URL=https://<your-project-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key>

# Optional — defaults to "case-documents" if not set
NEXT_PUBLIC_SUPABASE_DOCUMENTS_BUCKET=case-documents
```

### 4. Apply database migrations

Migrations are tracked in `supabase/migrations/`. Apply them in order via the Supabase dashboard SQL editor or the Supabase CLI:

```bash
supabase db push
```

Migrations applied so far:

| Version | Name |
|---|---|
| 20260414154922 | create_immigration_platform_schema |
| 20260414163013 | auto_create_profile_on_signup |
| 20260414163900 | enable_google_oauth |
| (via MCP) | add_lawyer_assignment_requests_and_fix_rls |
| (via MCP) | create_case_documents_storage_bucket |

### 5. Run the dev server

```bash
npm run dev
```

---

## Database Schema

### `profiles`
Central user record created on signup (trigger: `auto_create_profile_on_signup`).

| Column | Type | Notes |
|---|---|---|
| id | uuid | PK |
| user_id | uuid | FK → auth.users |
| role | text | `'lawyer'` or `'immigrant'` |
| full_name | text | |
| email | text | |
| phone | text | nullable |
| created_at | timestamptz | |
| updated_at | timestamptz | |

### `immigrants`
Created when a user completes onboarding as an immigrant.

| Column | Type | Notes |
|---|---|---|
| id | uuid | PK |
| user_id | uuid | FK → auth.users (unique) |
| full_name | text | |
| email | text | |
| nationality | text | |
| passport_number | text | nullable |
| date_of_birth | date | nullable |
| address_in_spain | text | nullable |
| assigned_lawyer_id | uuid | nullable, FK → auth.users |
| case_status | text | `pending` / `in_review` / `documents_required` / `submitted` / `approved` / `rejected` |
| avatar_url | text | nullable |
| created_at | timestamptz | |

### `lawyers`
Created when a user completes onboarding as a lawyer.

| Column | Type | Notes |
|---|---|---|
| id | uuid | PK |
| user_id | uuid | FK → auth.users (unique) |
| full_name | text | |
| email | text | |
| license_number | text | |
| specialization | text | nullable |
| bar_association | text | nullable |
| bio | text | nullable |
| avatar_url | text | nullable |
| is_active | boolean | controls visibility to immigrants |
| created_at | timestamptz | |

### `case_documents`
Documents uploaded by immigrants, stored in Supabase Storage.

| Column | Type | Notes |
|---|---|---|
| id | uuid | PK |
| immigrant_id | uuid | FK → immigrants.id |
| document_type | text | see `documentTypeValues` in `src/lib/documents.ts` |
| file_name | text | original filename |
| file_url | text | storage path (`{immigrantId}/{timestamp}-{filename}`) |
| notes | text | nullable |
| uploaded_by | uuid | nullable, FK → auth.users |
| uploaded_at | timestamptz | |

### `case_notes`
Private notes added by lawyers on each case.

| Column | Type | Notes |
|---|---|---|
| id | uuid | PK |
| immigrant_id | uuid | FK → immigrants.id |
| lawyer_id | uuid | FK → auth.users |
| content | text | |
| is_private | boolean | always `true` for now |
| created_at | timestamptz | |

### `lawyer_assignment_requests`
Immigrant → lawyer assignment requests with status tracking.

| Column | Type | Notes |
|---|---|---|
| id | uuid | PK |
| immigrant_id | uuid | FK → immigrants.id |
| lawyer_user_id | uuid | FK → auth.users |
| status | text | `pending` / `accepted` / `rejected` / `withdrawn` |
| message | text | nullable |
| created_at | timestamptz | |
| responded_at | timestamptz | nullable |

**Unique constraint:** only one `pending` request per immigrant at a time.

**Trigger `on_request_accepted`:** when a request is accepted, automatically rejects all other pending requests for the same immigrant and sets `immigrants.assigned_lawyer_id`.

---

## Storage Buckets

### `case-documents`
Private bucket (not publicly accessible). Max file size: 50 MB.

**Allowed MIME types:** `application/pdf`, `image/png`, `image/jpeg`, `application/msword`, `application/vnd.openxmlformats-officedocument.wordprocessingml.document`

**Path pattern:** `{immigrantId}/{timestamp}-{sanitizedFilename}`

**Storage RLS policies:**

| Policy | Who | What |
|---|---|---|
| immigrants_can_upload_own | Authenticated immigrant | INSERT into own folder |
| immigrants_can_read_own | Authenticated immigrant | SELECT from own folder |
| immigrants_can_delete_own | Authenticated immigrant | DELETE from own folder |
| lawyers_can_read_assigned | Assigned lawyer | SELECT from assigned immigrants' folders |

---

## Row Level Security (RLS)

All tables have RLS enabled. Policies by table:

### `profiles`
- `profiles_select_own` — user reads own row
- `profiles_insert_own` — user inserts own row
- `profiles_update_own` — user updates own row

### `immigrants`
- `immigrants_select_own` — immigrant reads own row
- `immigrants_insert_own` — immigrant inserts own row
- `immigrants_update_own` — immigrant updates own row
- `immigrants_lawyer_select` — assigned lawyer reads
- `immigrants_lawyer_update` — assigned lawyer updates case_status
- `immigrants_lawyer_request_select` — lawyer reads immigrants who sent them a request
- `immigrants_lawyer_assign_update` — lawyer can set assigned_lawyer_id when accepting a request

### `lawyers`
- `lawyers_select_own` — lawyer reads own row
- `lawyers_insert_own` — lawyer inserts own row
- `lawyers_update_own` — lawyer updates own row
- `lawyers_visible_to_assigned_immigrants` — assigned immigrant reads lawyer details
- `lawyers_visible_to_all_authenticated` — any authenticated user browses active lawyers

### `case_documents`
- `documents_immigrant_own` — immigrant full access to own documents
- `documents_lawyer_assigned` — assigned lawyer can read

### `case_notes`
- `notes_lawyer_own` — lawyer full access to own notes

### `lawyer_assignment_requests`
- `lar_immigrant_select/insert/update` — immigrant manages own requests
- `lar_lawyer_select/update` — lawyer views and responds to requests addressed to them

---

## Application Routes

### Public
| Route | Description |
|---|---|
| `/` | Marketing homepage |
| `/auth/login` | Login (email + Google OAuth) |
| `/auth/signup` | Signup |
| `/auth/callback` | OAuth callback |
| `/auth/complete-profile` | First-time Google users choose role |

### Immigrant portal (`/immigrant/*`)
| Route | Description |
|---|---|
| `/immigrant/dashboard` | Overview, recent docs, lawyer, case status |
| `/immigrant/lawyers` | Browse and request lawyers |
| `/immigrant/documents` | Upload, view, delete documents |
| `/immigrant/my-case` | Full case detail and timeline |
| `/immigrant/settings` | Edit personal profile |

### Lawyer portal (`/lawyer/*`)
| Route | Description |
|---|---|
| `/lawyer/dashboard` | Overview, stats, quick actions |
| `/lawyer/immigrants` | List of assigned immigrants |
| `/lawyer/immigrants/[id]` | Immigrant detail: documents, notes, status |
| `/lawyer/requests` | Accept or reject incoming requests |
| `/lawyer/documents` | All documents from assigned immigrants |
| `/lawyer/settings` | Edit professional profile |

---

## Middleware

`src/middleware.ts` runs on every non-static request and enforces:
- Unauthenticated users → `/auth/login`
- Authenticated users without a profile → `/auth/complete-profile`
- Role mismatch (e.g. immigrant visiting `/lawyer/*`) → correct dashboard
- Authenticated users visiting `/auth/login` or `/auth/signup` → correct dashboard

---

## Internationalization

Translations live in `src/lib/translations.ts`. Supported locales:

| Code | Language |
|---|---|
| `es` | Spanish (default) |
| `en` | English |
| `pt` | Portuguese |

The active locale is stored in `localStorage` (`immigration-platform-locale`) and provided to all client components via `LanguageProvider`.

---

## Deployment

The project is a standard Next.js app and deploys on any Node.js-compatible host.

### Vercel (recommended)

1. Connect the GitHub repo to a Vercel project.
2. Set the environment variables (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`) in the Vercel dashboard under **Settings → Environment Variables**.
3. Vercel will detect Next.js and build automatically on every push to `main`.

### Build locally

```bash
npm run build
npm run start
```

---

## Linting

```bash
npm run lint
```

Config: `.eslintrc.json` extends `next/core-web-vitals`. No interactive setup prompt.
