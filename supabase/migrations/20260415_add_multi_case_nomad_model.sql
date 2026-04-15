create table if not exists public.cases (
  id uuid primary key default gen_random_uuid(),
  immigrant_id uuid not null references public.immigrants(id) on delete cascade,
  category_code text not null default 'legacy'
    check (category_code in (
      'entrepreneurs',
      'highly_qualified',
      'researchers',
      'ict',
      'collective_ict',
      'audiovisual',
      'nomad',
      'family',
      'legacy'
    )),
  track_code text not null default 'legacy_general'
    check (track_code in ('legacy_general', 'nomad_holder', 'nomad_family', 'nomad_renewal')),
  title text not null,
  summary text,
  stage text not null default 'intake'
    check (stage in (
      'intake',
      'eligibility_check',
      'lawyer_review',
      'documents_required',
      'payment_pending',
      'ready_to_file',
      'submitted',
      'approved',
      'rejected',
      'closed'
    )),
  outcome text
    check (outcome in ('pending', 'approved', 'rejected', 'withdrawn', 'expired', 'renewed')),
  assigned_lawyer_user_id uuid references auth.users(id) on delete set null,
  source_case_id uuid references public.cases(id) on delete set null,
  linked_primary_case_id uuid references public.cases(id) on delete set null,
  opened_by_user_id uuid references auth.users(id) on delete set null,
  intake_answers jsonb not null default '{}'::jsonb,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  closed_at timestamptz
);

create index if not exists idx_cases_immigrant_updated
  on public.cases (immigrant_id, updated_at desc);

create index if not exists idx_cases_assigned_stage
  on public.cases (assigned_lawyer_user_id, stage, updated_at desc);

create index if not exists idx_cases_track_stage
  on public.cases (track_code, stage, updated_at desc);

create index if not exists idx_cases_linked_primary
  on public.cases (linked_primary_case_id);

alter table if exists public.cases enable row level security;

drop policy if exists cases_immigrant_select_own on public.cases;
create policy cases_immigrant_select_own
  on public.cases
  for select
  using (
    exists (
      select 1
      from public.immigrants i
      where i.id = cases.immigrant_id
        and i.user_id = auth.uid()
    )
  );

drop policy if exists cases_immigrant_insert_own on public.cases;
create policy cases_immigrant_insert_own
  on public.cases
  for insert
  with check (
    exists (
      select 1
      from public.immigrants i
      where i.id = cases.immigrant_id
        and i.user_id = auth.uid()
    )
  );

drop policy if exists cases_immigrant_update_own on public.cases;
create policy cases_immigrant_update_own
  on public.cases
  for update
  using (
    exists (
      select 1
      from public.immigrants i
      where i.id = cases.immigrant_id
        and i.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1
      from public.immigrants i
      where i.id = cases.immigrant_id
        and i.user_id = auth.uid()
    )
  );

drop policy if exists cases_lawyer_select_assigned on public.cases;
create policy cases_lawyer_select_assigned
  on public.cases
  for select
  using (assigned_lawyer_user_id = auth.uid());

drop policy if exists cases_lawyer_update_assigned on public.cases;
create policy cases_lawyer_update_assigned
  on public.cases
  for update
  using (assigned_lawyer_user_id = auth.uid())
  with check (assigned_lawyer_user_id = auth.uid());

drop policy if exists cases_lawyer_request_select on public.cases;
create policy cases_lawyer_request_select
  on public.cases
  for select
  using (
    exists (
      select 1
      from public.lawyer_assignment_requests lar
      where lar.case_id = cases.id
        and lar.lawyer_user_id = auth.uid()
    )
  );

create table if not exists public.case_payments (
  id uuid primary key default gen_random_uuid(),
  case_id uuid not null references public.cases(id) on delete cascade,
  milestone_type text not null
    check (milestone_type in ('consultation', 'case_opening', 'filing', 'renewal')),
  label text,
  amount_eur numeric(10,2),
  status text not null default 'pending'
    check (status in ('not_needed', 'pending', 'requested', 'paid', 'waived')),
  notes text,
  requested_at timestamptz,
  paid_at timestamptz,
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists idx_case_payments_case_created
  on public.case_payments (case_id, created_at desc);

alter table if exists public.case_payments enable row level security;

drop policy if exists case_payments_immigrant_select_own on public.case_payments;
create policy case_payments_immigrant_select_own
  on public.case_payments
  for select
  using (
    exists (
      select 1
      from public.cases c
      join public.immigrants i on i.id = c.immigrant_id
      where c.id = case_payments.case_id
        and i.user_id = auth.uid()
    )
  );

drop policy if exists case_payments_lawyer_select_assigned on public.case_payments;
create policy case_payments_lawyer_select_assigned
  on public.case_payments
  for select
  using (
    exists (
      select 1
      from public.cases c
      where c.id = case_payments.case_id
        and c.assigned_lawyer_user_id = auth.uid()
    )
  );

drop policy if exists case_payments_lawyer_insert_assigned on public.case_payments;
create policy case_payments_lawyer_insert_assigned
  on public.case_payments
  for insert
  with check (
    exists (
      select 1
      from public.cases c
      where c.id = case_payments.case_id
        and c.assigned_lawyer_user_id = auth.uid()
    )
  );

drop policy if exists case_payments_lawyer_update_assigned on public.case_payments;
create policy case_payments_lawyer_update_assigned
  on public.case_payments
  for update
  using (
    exists (
      select 1
      from public.cases c
      where c.id = case_payments.case_id
        and c.assigned_lawyer_user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1
      from public.cases c
      where c.id = case_payments.case_id
        and c.assigned_lawyer_user_id = auth.uid()
    )
  );

create table if not exists public.case_events (
  id uuid primary key default gen_random_uuid(),
  case_id uuid not null references public.cases(id) on delete cascade,
  actor_user_id uuid references auth.users(id) on delete set null,
  event_type text not null,
  title text not null,
  description text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists idx_case_events_case_created
  on public.case_events (case_id, created_at desc);

alter table if exists public.case_events enable row level security;

drop policy if exists case_events_immigrant_select_own on public.case_events;
create policy case_events_immigrant_select_own
  on public.case_events
  for select
  using (
    exists (
      select 1
      from public.cases c
      join public.immigrants i on i.id = c.immigrant_id
      where c.id = case_events.case_id
        and i.user_id = auth.uid()
    )
  );

drop policy if exists case_events_lawyer_select_assigned on public.case_events;
create policy case_events_lawyer_select_assigned
  on public.case_events
  for select
  using (
    exists (
      select 1
      from public.cases c
      where c.id = case_events.case_id
        and c.assigned_lawyer_user_id = auth.uid()
    )
  );

drop policy if exists case_events_immigrant_insert_own on public.case_events;
create policy case_events_immigrant_insert_own
  on public.case_events
  for insert
  with check (
    exists (
      select 1
      from public.cases c
      join public.immigrants i on i.id = c.immigrant_id
      where c.id = case_events.case_id
        and i.user_id = auth.uid()
    )
  );

drop policy if exists case_events_lawyer_insert_assigned on public.case_events;
create policy case_events_lawyer_insert_assigned
  on public.case_events
  for insert
  with check (
    exists (
      select 1
      from public.cases c
      where c.id = case_events.case_id
        and c.assigned_lawyer_user_id = auth.uid()
    )
  );

alter table if exists public.case_documents
  add column if not exists case_id uuid references public.cases(id) on delete cascade;

create index if not exists idx_case_documents_case_uploaded
  on public.case_documents (case_id, uploaded_at desc);

alter table if exists public.case_documents enable row level security;

drop policy if exists documents_immigrant_own on public.case_documents;
create policy documents_immigrant_own
  on public.case_documents
  for select
  using (
    exists (
      select 1
      from public.cases c
      join public.immigrants i on i.id = c.immigrant_id
      where c.id = case_documents.case_id
        and i.user_id = auth.uid()
    )
  );

drop policy if exists documents_immigrant_insert_own_case on public.case_documents;
create policy documents_immigrant_insert_own_case
  on public.case_documents
  for insert
  with check (
    exists (
      select 1
      from public.cases c
      join public.immigrants i on i.id = c.immigrant_id
      where c.id = case_documents.case_id
        and i.user_id = auth.uid()
        and c.immigrant_id = case_documents.immigrant_id
    )
  );

drop policy if exists documents_immigrant_delete_own_case on public.case_documents;
create policy documents_immigrant_delete_own_case
  on public.case_documents
  for delete
  using (
    exists (
      select 1
      from public.cases c
      join public.immigrants i on i.id = c.immigrant_id
      where c.id = case_documents.case_id
        and i.user_id = auth.uid()
    )
  );

drop policy if exists documents_lawyer_assigned on public.case_documents;
create policy documents_lawyer_assigned
  on public.case_documents
  for select
  using (
    exists (
      select 1
      from public.cases c
      where c.id = case_documents.case_id
        and c.assigned_lawyer_user_id = auth.uid()
    )
  );

alter table if exists public.case_notes
  add column if not exists case_id uuid references public.cases(id) on delete cascade;

create index if not exists idx_case_notes_case_created
  on public.case_notes (case_id, created_at desc);

alter table if exists public.case_notes enable row level security;

drop policy if exists notes_lawyer_own on public.case_notes;
create policy notes_lawyer_own
  on public.case_notes
  for all
  using (
    exists (
      select 1
      from public.cases c
      where c.id = case_notes.case_id
        and c.assigned_lawyer_user_id = auth.uid()
    )
    and lawyer_id = auth.uid()
  )
  with check (
    exists (
      select 1
      from public.cases c
      where c.id = case_notes.case_id
        and c.assigned_lawyer_user_id = auth.uid()
        and c.immigrant_id = case_notes.immigrant_id
    )
    and lawyer_id = auth.uid()
  );

alter table if exists public.lawyer_assignment_requests
  add column if not exists case_id uuid references public.cases(id) on delete cascade;

create index if not exists idx_lawyer_assignment_requests_case_created
  on public.lawyer_assignment_requests (case_id, created_at desc);

alter table if exists public.lawyer_assignment_requests enable row level security;

drop policy if exists lar_immigrant_select on public.lawyer_assignment_requests;
create policy lar_immigrant_select
  on public.lawyer_assignment_requests
  for select
  using (
    exists (
      select 1
      from public.cases c
      join public.immigrants i on i.id = c.immigrant_id
      where c.id = lawyer_assignment_requests.case_id
        and i.user_id = auth.uid()
    )
  );

drop policy if exists lar_immigrant_insert on public.lawyer_assignment_requests;
create policy lar_immigrant_insert
  on public.lawyer_assignment_requests
  for insert
  with check (
    exists (
      select 1
      from public.cases c
      join public.immigrants i on i.id = c.immigrant_id
      where c.id = lawyer_assignment_requests.case_id
        and c.immigrant_id = lawyer_assignment_requests.immigrant_id
        and i.user_id = auth.uid()
    )
  );

drop policy if exists lar_immigrant_update on public.lawyer_assignment_requests;
create policy lar_immigrant_update
  on public.lawyer_assignment_requests
  for update
  using (
    exists (
      select 1
      from public.cases c
      join public.immigrants i on i.id = c.immigrant_id
      where c.id = lawyer_assignment_requests.case_id
        and i.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1
      from public.cases c
      join public.immigrants i on i.id = c.immigrant_id
      where c.id = lawyer_assignment_requests.case_id
        and i.user_id = auth.uid()
    )
  );

drop policy if exists lar_lawyer_select on public.lawyer_assignment_requests;
create policy lar_lawyer_select
  on public.lawyer_assignment_requests
  for select
  using (lawyer_user_id = auth.uid());

drop policy if exists lar_lawyer_update on public.lawyer_assignment_requests;
create policy lar_lawyer_update
  on public.lawyer_assignment_requests
  for update
  using (lawyer_user_id = auth.uid())
  with check (lawyer_user_id = auth.uid());

drop index if exists idx_lawyer_assignment_requests_one_pending_per_immigrant;
create unique index if not exists idx_lawyer_assignment_requests_one_pending_per_case
  on public.lawyer_assignment_requests (case_id)
  where status = 'pending' and case_id is not null;

with inserted_cases as (
  insert into public.cases (
    immigrant_id,
    category_code,
    track_code,
    title,
    summary,
    stage,
    outcome,
    assigned_lawyer_user_id,
    opened_by_user_id,
    created_at,
    updated_at
  )
  select
    i.id,
    'legacy',
    'legacy_general',
    'Legacy case',
    'Migrated from the single-case platform model.',
    case
      when i.case_status = 'pending' then 'intake'
      when i.case_status = 'in_review' then 'lawyer_review'
      when i.case_status = 'documents_required' then 'documents_required'
      when i.case_status = 'submitted' then 'submitted'
      when i.case_status = 'approved' then 'approved'
      when i.case_status = 'rejected' then 'rejected'
      else 'intake'
    end,
    case
      when i.case_status = 'approved' then 'approved'
      when i.case_status = 'rejected' then 'rejected'
      else 'pending'
    end,
    i.assigned_lawyer_id,
    i.user_id,
    i.created_at,
    timezone('utc', now())
  from public.immigrants i
  where not exists (
    select 1
    from public.cases c
    where c.immigrant_id = i.id
  )
  returning id, immigrant_id, assigned_lawyer_user_id, stage
)
insert into public.case_events (case_id, actor_user_id, event_type, title, description)
select
  ic.id,
  ic.assigned_lawyer_user_id,
  'migration',
  'Legacy case migrated',
  'This case was created automatically from the previous single-case data model.'
from inserted_cases ic;

update public.case_documents cd
set case_id = c.id
from public.cases c
where cd.case_id is null
  and c.immigrant_id = cd.immigrant_id
  and c.track_code = 'legacy_general';

update public.case_notes cn
set case_id = c.id
from public.cases c
where cn.case_id is null
  and c.immigrant_id = cn.immigrant_id
  and c.track_code = 'legacy_general';

update public.lawyer_assignment_requests lar
set case_id = c.id
from public.cases c
where lar.case_id is null
  and c.immigrant_id = lar.immigrant_id
  and c.track_code = 'legacy_general';
