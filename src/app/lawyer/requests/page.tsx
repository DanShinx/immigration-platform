import { redirect } from 'next/navigation'
import DashboardLayout from '@/components/DashboardLayout'
import LawyerRequestsClient from './LawyerRequestsClient'
import { createClient } from '@/lib/supabase/server'

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

  const caseIds = Array.from(new Set((requests || []).map((request) => request.case_id).filter(Boolean)))

  const { data: cases } = caseIds.length
    ? await supabase
        .from('cases')
        .select('id, title, track_code, stage, immigrant_id, created_at')
        .in('id', caseIds)
    : { data: [] as any[] }

  const immigrantIds = Array.from(new Set((cases || []).map((caseItem) => caseItem.immigrant_id)))
  const { data: immigrants } = immigrantIds.length
    ? await supabase
        .from('immigrants')
        .select('id, full_name, email, nationality')
        .in('id', immigrantIds)
    : { data: [] as any[] }

  const casesById = new Map((cases || []).map((caseItem) => [caseItem.id, caseItem]))
  const immigrantsById = new Map((immigrants || []).map((immigrant) => [immigrant.id, immigrant]))

  const hydratedRequests = (requests || []).map((request) => {
    const caseItem = request.case_id ? casesById.get(request.case_id) : null

    return {
      ...request,
      caseItem,
      immigrant: caseItem ? immigrantsById.get(caseItem.immigrant_id) || null : null,
    }
  })

  return (
    <DashboardLayout role="lawyer" userEmail={user.email} userName={profile.full_name}>
      <LawyerRequestsClient requests={hydratedRequests} lawyerUserId={user.id} />
    </DashboardLayout>
  )
}
