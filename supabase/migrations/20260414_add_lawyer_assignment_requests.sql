create table if not exists public.lawyer_assignment_requests (
  id uuid primary key default gen_random_uuid(),
  immigrant_id uuid not null references public.immigrants(id) on delete cascade,
  lawyer_user_id uuid not null references auth.users(id) on delete cascade,
  status text not null default 'pending' check (status in ('pending', 'accepted', 'rejected', 'withdrawn')),
  message text,
  created_at timestamptz not null default timezone('utc', now()),
  responded_at timestamptz
);

create index if not exists idx_lawyer_assignment_requests_lawyer_status_created
  on public.lawyer_assignment_requests (lawyer_user_id, status, created_at desc);

create index if not exists idx_lawyer_assignment_requests_immigrant_created
  on public.lawyer_assignment_requests (immigrant_id, created_at desc);

create unique index if not exists idx_lawyer_assignment_requests_one_pending_per_immigrant
  on public.lawyer_assignment_requests (immigrant_id)
  where status = 'pending';
