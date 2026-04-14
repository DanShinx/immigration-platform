import { redirect } from 'next/navigation'
import DashboardLayout from '@/components/DashboardLayout'
import { createClient } from '@/lib/supabase/server'
import LawyerDocumentsClient from './LawyerDocumentsClient'

export default async function LawyerDocumentsPage() {
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

  const { data: immigrants } = await supabase
    .from('immigrants')
    .select('id, full_name, email, nationality, case_status')
    .eq('assigned_lawyer_id', user.id)
    .order('full_name', { ascending: true })

  const immigrantIds = immigrants?.map((immigrant) => immigrant.id) || []

  const { data: documents } = immigrantIds.length
    ? await supabase
        .from('case_documents')
        .select('*')
        .in('immigrant_id', immigrantIds)
        .order('uploaded_at', { ascending: false })
    : { data: [] }

  return (
    <DashboardLayout
      role="lawyer"
      userEmail={user.email}
      userName={profile.full_name}
    >
      <LawyerDocumentsClient
        documents={documents || []}
        immigrants={immigrants || []}
      />
    </DashboardLayout>
  )
}
