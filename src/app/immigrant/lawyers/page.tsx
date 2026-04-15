import { redirect } from 'next/navigation'
import DashboardLayout from '@/components/DashboardLayout'
import ImmigrantLawyerSelectionClient from './ImmigrantLawyerSelectionClient'
import { createClient } from '@/lib/supabase/server'
import { filterVisibleCases, sortCasesByRecency } from '@/lib/cases'

export default async function ImmigrantLawyersPage({
  searchParams,
}: {
  searchParams?: { case?: string }
}) {
  const supabase = createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/auth/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', user.id)
    .single()

  if (!profile || profile.role !== 'immigrant') redirect('/lawyer/dashboard')

  const { data: immigrant } = await supabase
    .from('immigrants')
    .select('*')
    .eq('user_id', user.id)
    .single()

  if (!immigrant) redirect('/immigrant/dashboard')

  const { data: rawCases } = await supabase
    .from('cases')
    .select('*')
    .eq('immigrant_id', immigrant.id)

  const cases = sortCasesByRecency(filterVisibleCases(rawCases || []))
  const currentCase = cases.find((caseItem) => caseItem.id === searchParams?.case) || cases[0] || null

  let assignedLawyer = null
  if (currentCase?.assigned_lawyer_user_id) {
    const { data: lawyer } = await supabase
      .from('lawyers')
      .select('user_id, full_name, email, specialization, bar_association, bio, is_active, created_at')
      .eq('user_id', currentCase.assigned_lawyer_user_id)
      .single()

    assignedLawyer = lawyer
  }

  const { data: pendingRows } = currentCase
    ? await supabase
        .from('lawyer_assignment_requests')
        .select('*')
        .eq('case_id', currentCase.id)
        .eq('status', 'pending')
        .order('created_at', { ascending: false })
        .limit(1)
    : { data: [] as any[] }

  const pendingRequestRow = pendingRows?.[0] || null

  let pendingLawyer = null
  if (pendingRequestRow?.lawyer_user_id) {
    const { data: lawyer } = await supabase
      .from('lawyers')
      .select('user_id, full_name, email, specialization, bar_association, bio, is_active, created_at')
      .eq('user_id', pendingRequestRow.lawyer_user_id)
      .single()

    pendingLawyer = lawyer
  }

  const { data: lawyers } = await supabase
    .from('lawyers')
    .select('user_id, full_name, email, specialization, bar_association, bio, is_active, created_at')
    .eq('is_active', true)
    .order('full_name', { ascending: true })

  const pendingRequest = pendingRequestRow
    ? {
        ...pendingRequestRow,
        lawyer: pendingLawyer,
      }
    : null

  return (
    <DashboardLayout role="immigrant" userEmail={user.email} userName={profile.full_name}>
      <ImmigrantLawyerSelectionClient
        immigrantId={immigrant.id}
        cases={cases.map((caseItem) => ({
          id: caseItem.id,
          title: caseItem.title,
          track_code: caseItem.track_code,
        }))}
        currentCaseId={currentCase?.id || null}
        lawyers={lawyers || []}
        assignedLawyer={assignedLawyer}
        pendingRequest={pendingRequest}
      />
    </DashboardLayout>
  )
}
