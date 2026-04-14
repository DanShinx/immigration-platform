import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import DashboardLayout from '@/components/DashboardLayout'
import ImmigrantDashboardClient from './ImmigrantDashboardClient'

export default async function ImmigrantDashboardPage() {
  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', user.id)
    .single()

  if (!profile || profile.role !== 'immigrant') redirect('/lawyer/dashboard')

  const { data: immigrantData } = await supabase
    .from('immigrants')
    .select('*')
    .eq('user_id', user.id)
    .single()

  // Get lawyer info if assigned
  let lawyerInfo = null
  if (immigrantData?.assigned_lawyer_id) {
    const { data: lawyer } = await supabase
      .from('lawyers')
      .select('full_name, email, specialization, phone')
      .eq('user_id', immigrantData.assigned_lawyer_id)
      .single()
    lawyerInfo = lawyer
  }

  const { data: pendingRows } = immigrantData
    ? await supabase
        .from('lawyer_assignment_requests')
        .select('*')
        .eq('immigrant_id', immigrantData.id)
        .eq('status', 'pending')
        .order('created_at', { ascending: false })
        .limit(1)
    : { data: [] as any[] }

  const pendingRequestRow = pendingRows?.[0] || null

  let pendingLawyer = null
  if (pendingRequestRow?.lawyer_user_id) {
    const { data: lawyer } = await supabase
      .from('lawyers')
      .select('full_name, email, specialization, phone')
      .eq('user_id', pendingRequestRow.lawyer_user_id)
      .single()

    pendingLawyer = lawyer
  }

  const { data: documents } = await supabase
    .from('case_documents')
    .select('*')
    .eq('immigrant_id', immigrantData?.id)
    .order('uploaded_at', { ascending: false })
    .limit(5)

  return (
    <DashboardLayout
      role="immigrant"
      userEmail={user.email}
      userName={profile.full_name}
    >
      <ImmigrantDashboardClient
        immigrant={immigrantData}
        lawyer={lawyerInfo}
        pendingRequest={
          pendingRequestRow
            ? {
                ...pendingRequestRow,
                lawyer: pendingLawyer,
              }
            : null
        }
        recentDocuments={documents || []}
        userName={profile.full_name}
      />
    </DashboardLayout>
  )
}
