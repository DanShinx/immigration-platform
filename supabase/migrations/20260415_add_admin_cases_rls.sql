-- Admin full-read policies for all case-model tables.
-- Admin identity is checked via public.profiles.role = 'admin'.

-- cases
drop policy if exists cases_admin_select_all on public.cases;
create policy cases_admin_select_all
  on public.cases
  for select
  using (
    exists (
      select 1 from public.profiles
      where user_id = auth.uid() and role = 'admin'
    )
  );

drop policy if exists cases_admin_update_all on public.cases;
create policy cases_admin_update_all
  on public.cases
  for update
  using (
    exists (
      select 1 from public.profiles
      where user_id = auth.uid() and role = 'admin'
    )
  )
  with check (
    exists (
      select 1 from public.profiles
      where user_id = auth.uid() and role = 'admin'
    )
  );

-- case_payments
drop policy if exists case_payments_admin_select_all on public.case_payments;
create policy case_payments_admin_select_all
  on public.case_payments
  for select
  using (
    exists (
      select 1 from public.profiles
      where user_id = auth.uid() and role = 'admin'
    )
  );

drop policy if exists case_payments_admin_all on public.case_payments;
create policy case_payments_admin_all
  on public.case_payments
  for all
  using (
    exists (
      select 1 from public.profiles
      where user_id = auth.uid() and role = 'admin'
    )
  )
  with check (
    exists (
      select 1 from public.profiles
      where user_id = auth.uid() and role = 'admin'
    )
  );

-- case_events
drop policy if exists case_events_admin_select_all on public.case_events;
create policy case_events_admin_select_all
  on public.case_events
  for select
  using (
    exists (
      select 1 from public.profiles
      where user_id = auth.uid() and role = 'admin'
    )
  );

drop policy if exists case_events_admin_insert on public.case_events;
create policy case_events_admin_insert
  on public.case_events
  for insert
  with check (
    exists (
      select 1 from public.profiles
      where user_id = auth.uid() and role = 'admin'
    )
  );

-- case_documents
drop policy if exists documents_admin_select_all on public.case_documents;
create policy documents_admin_select_all
  on public.case_documents
  for select
  using (
    exists (
      select 1 from public.profiles
      where user_id = auth.uid() and role = 'admin'
    )
  );

-- case_notes
drop policy if exists notes_admin_select_all on public.case_notes;
create policy notes_admin_select_all
  on public.case_notes
  for select
  using (
    exists (
      select 1 from public.profiles
      where user_id = auth.uid() and role = 'admin'
    )
  );

-- lawyer_assignment_requests (admin select already may exist via prior pattern)
drop policy if exists lar_admin_select_all on public.lawyer_assignment_requests;
create policy lar_admin_select_all
  on public.lawyer_assignment_requests
  for select
  using (
    exists (
      select 1 from public.profiles
      where user_id = auth.uid() and role = 'admin'
    )
  );
