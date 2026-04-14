import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import DashboardLayout from '@/components/DashboardLayout'
import LawyerDashboardClient from './LawyerDashboardClient'

export default async function LawyerDashboardPage() {
  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', user.id)
    .single()

  if (!profile || profile.role !== 'lawyer') redirect('/immigrant/dashboard')

  // Stats
  const { count: totalImmigrants } = await supabase
    .from('immigrants')
    .select('*', { count: 'exact', head: true })
    .eq('assigned_lawyer_id', user.id)

  const { count: pendingCases } = await supabase
    .from('lawyer_assignment_requests')
    .select('*', { count: 'exact', head: true })
    .eq('lawyer_user_id', user.id)
    .eq('status', 'pending')

  const { count: inReviewCases } = await supabase
    .from('immigrants')
    .select('*', { count: 'exact', head: true })
    .eq('assigned_lawyer_id', user.id)
    .eq('case_status', 'in_review')

  // Recent immigrants
  const { data: recentImmigrants } = await supabase
    .from('immigrants')
    .select('*')
    .eq('assigned_lawyer_id', user.id)
    .order('created_at', { ascending: false })
    .limit(5)

  return (
    <DashboardLayout
      role="lawyer"
      userEmail={user.email}
      userName={profile.full_name}
    >
      <LawyerDashboardClient
        stats={{
          total: totalImmigrants || 0,
          pending: pendingCases || 0,
          inReview: inReviewCases || 0,
        }}
        recentImmigrants={recentImmigrants || []}
        lawyerName={profile.full_name}
      />
    </DashboardLayout>
  )
}
