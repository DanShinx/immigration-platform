import { redirect } from 'next/navigation'
import DashboardLayout from '@/components/DashboardLayout'
import ImmigrantCasesClient from './ImmigrantCasesClient'
import { createClient } from '@/lib/supabase/server'
import { filterVisibleCases, sortCasesByRecency } from '@/lib/cases'

export default async function ImmigrantCasesPage() {
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
    ? await supabase
        .from('cases')
        .select('*')
        .eq('immigrant_id', immigrant.id)
    : { data: [] as any[] }

  const visibleCases = filterVisibleCases(cases || [])
  const lawyerIds = Array.from(new Set(visibleCases.map((caseItem) => caseItem.assigned_lawyer_user_id).filter(Boolean)))

  const { data: lawyers } = lawyerIds.length
    ? await supabase
        .from('lawyers')
        .select('user_id, full_name')
        .in('user_id', lawyerIds)
    : { data: [] as any[] }

  const lawyerMap = new Map((lawyers || []).map((lawyer) => [lawyer.user_id, lawyer.full_name]))
  const hydratedCases = sortCasesByRecency(
    visibleCases.map((caseItem) => ({
      ...caseItem,
      lawyerName: caseItem.assigned_lawyer_user_id
        ? lawyerMap.get(caseItem.assigned_lawyer_user_id) || null
        : null,
    }))
  )

  return (
    <DashboardLayout role="immigrant" userEmail={user.email} userName={profile.full_name}>
      <ImmigrantCasesClient cases={hydratedCases} />
    </DashboardLayout>
  )
}
