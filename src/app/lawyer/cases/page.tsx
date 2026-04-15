import { redirect } from 'next/navigation'
import DashboardLayout from '@/components/DashboardLayout'
import LawyerCasesClient from './LawyerCasesClient'
import { createClient } from '@/lib/supabase/server'
import { sortCasesByRecency } from '@/lib/cases'

export default async function LawyerCasesPage() {
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

  if (!profile || profile.role !== 'lawyer') redirect('/immigrant/dashboard')

  const { data: rawCases } = await supabase
    .from('cases')
    .select('*')
    .eq('assigned_lawyer_user_id', user.id)

  const immigrantIds = Array.from(new Set((rawCases || []).map((caseItem) => caseItem.immigrant_id)))
  const { data: immigrants } = immigrantIds.length
    ? await supabase
        .from('immigrants')
        .select('id, full_name, email')
        .in('id', immigrantIds)
    : { data: [] as any[] }

  const immigrantMap = new Map((immigrants || []).map((immigrant) => [immigrant.id, immigrant]))
  const cases = sortCasesByRecency(
    (rawCases || []).map((caseItem) => ({
      ...caseItem,
      immigrantName: immigrantMap.get(caseItem.immigrant_id)?.full_name || null,
      immigrantEmail: immigrantMap.get(caseItem.immigrant_id)?.email || null,
    }))
  )

  return (
    <DashboardLayout role="lawyer" userEmail={user.email} userName={profile.full_name}>
      <LawyerCasesClient cases={cases} />
    </DashboardLayout>
  )
}
