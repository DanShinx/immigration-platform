import { redirect } from 'next/navigation'
import DashboardLayout from '@/components/DashboardLayout'
import { createClient } from '@/lib/supabase/server'
import LawyerRequestsClient from './LawyerRequestsClient'

export default async function LawyerRequestsPage() {
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

  const { data: requests } = await supabase
    .from('lawyer_assignment_requests')
    .select('*')
    .eq('lawyer_user_id', user.id)
    .order('created_at', { ascending: false })

  const immigrantIds = Array.from(new Set((requests || []).map((request) => request.immigrant_id)))

  const { data: immigrants } = immigrantIds.length
    ? await supabase
        .from('immigrants')
        .select('id, full_name, email, nationality, case_status, created_at')
        .in('id', immigrantIds)
    : { data: [] as any[] }

  const immigrantsById = new Map((immigrants || []).map((immigrant) => [immigrant.id, immigrant]))

  const hydratedRequests = (requests || []).map((request) => ({
    ...request,
    immigrant: immigrantsById.get(request.immigrant_id) || null,
  }))

  return (
    <DashboardLayout role="lawyer" userEmail={user.email} userName={profile.full_name}>
      <LawyerRequestsClient requests={hydratedRequests} lawyerUserId={user.id} />
    </DashboardLayout>
  )
}
