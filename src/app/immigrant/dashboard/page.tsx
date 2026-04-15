import { redirect } from 'next/navigation'
import DashboardLayout from '@/components/DashboardLayout'
import ImmigrantDashboardClient from './ImmigrantDashboardClient'
import { createClient } from '@/lib/supabase/server'
import { filterVisibleCases, sortCasesByRecency } from '@/lib/cases'

export default async function ImmigrantDashboardPage() {
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

  const { data: cases } = immigrant
    ? await supabase.from('cases').select('*').eq('immigrant_id', immigrant.id)
    : { data: [] as any[] }

  const visibleCases = filterVisibleCases(cases || [])
  const caseIds = visibleCases.map((caseItem) => caseItem.id)
  const lawyerIds = Array.from(
    new Set(visibleCases.map((caseItem) => caseItem.assigned_lawyer_user_id).filter(Boolean))
  )

  const [{ data: lawyers }, { data: documents }, { data: requests }] = await Promise.all([
    lawyerIds.length
      ? supabase.from('lawyers').select('user_id, full_name').in('user_id', lawyerIds)
      : Promise.resolve({ data: [] as any[] }),
    caseIds.length
      ? supabase.from('case_documents').select('*').in('case_id', caseIds).order('uploaded_at', { ascending: false }).limit(5)
      : Promise.resolve({ data: [] as any[] }),
    caseIds.length
      ? supabase
          .from('lawyer_assignment_requests')
          .select('id, case_id, lawyer_user_id, status, created_at')
          .in('case_id', caseIds)
          .eq('status', 'pending')
          .order('created_at', { ascending: false })
          .limit(1)
      : Promise.resolve({ data: [] as any[] }),
  ])

  const lawyerMap = new Map((lawyers || []).map((lawyer) => [lawyer.user_id, lawyer.full_name]))
  const hydratedCases = sortCasesByRecency(
    visibleCases.map((caseItem) => ({
      ...caseItem,
      lawyerName: caseItem.assigned_lawyer_user_id
        ? lawyerMap.get(caseItem.assigned_lawyer_user_id) || null
        : null,
    }))
  )

  const pendingRequestRow = requests?.[0] || null

  return (
    <DashboardLayout role="immigrant" userEmail={user.email} userName={profile.full_name}>
      <ImmigrantDashboardClient
        cases={hydratedCases}
        recentDocuments={documents || []}
        pendingRequest={
          pendingRequestRow
            ? {
                caseId: pendingRequestRow.case_id,
                lawyerName: lawyerMap.get(pendingRequestRow.lawyer_user_id) || null,
              }
            : null
        }
        userName={profile.full_name}
      />
    </DashboardLayout>
  )
}
