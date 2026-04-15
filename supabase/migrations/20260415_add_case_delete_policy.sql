alter table if exists public.cases enable row level security;

drop policy if exists cases_immigrant_delete_own on public.cases;
create policy cases_immigrant_delete_own
  on public.cases
  for delete
  using (
    exists (
      select 1
      from public.immigrants i
      where i.id = cases.immigrant_id
        and i.user_id = auth.uid()
    )
  );
