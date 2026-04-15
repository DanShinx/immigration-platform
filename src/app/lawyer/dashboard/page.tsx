import { redirect } from 'next/navigation'
import DashboardLayout from '@/components/DashboardLayout'
import LawyerDashboardClient from './LawyerDashboardClient'
import { createClient } from '@/lib/supabase/server'
import { sortCasesByRecency } from '@/lib/cases'

export default async function LawyerDashboardPage() {
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

  const [{ data: rawCases, count: totalCases }, { count: pendingRequests }, { count: readyToFile }] =
    await Promise.all([
      supabase.from('cases').select('*', { count: 'exact' }).eq('assigned_lawyer_user_id', user.id),
      supabase.from('lawyer_assignment_requests').select('*', { count: 'exact', head: true }).eq('lawyer_user_id', user.id).eq('status', 'pending'),
      supabase.from('cases').select('*', { count: 'exact', head: true }).eq('assigned_lawyer_user_id', user.id).eq('stage', 'ready_to_file'),
    ])

  const immigrantIds = Array.from(new Set((rawCases || []).map((caseItem) => caseItem.immigrant_id)))
  const { data: immigrants } = immigrantIds.length
    ? await supabase.from('immigrants').select('id, full_name').in('id', immigrantIds)
    : { data: [] as any[] }

  const immigrantMap = new Map((immigrants || []).map((immigrant) => [immigrant.id, immigrant.full_name]))
  const recentCases = sortCasesByRecency(rawCases || [])
    .slice(0, 5)
    .map((caseItem) => ({
      ...caseItem,
      immigrantName: immigrantMap.get(caseItem.immigrant_id) || null,
    }))

  return (
    <DashboardLayout role="lawyer" userEmail={user.email} userName={profile.full_name}>
      <LawyerDashboardClient
        stats={{
          total: totalCases || 0,
          pending: pendingRequests || 0,
          readyToFile: readyToFile || 0,
        }}
        recentCases={recentCases}
        lawyerName={profile.full_name}
      />
    </DashboardLayout>
  )
}
