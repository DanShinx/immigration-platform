import { redirect } from 'next/navigation'
import DashboardLayout from '@/components/DashboardLayout'
import LawyerDocumentsClient from './LawyerDocumentsClient'
import { createClient } from '@/lib/supabase/server'

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

  const { data: cases } = await supabase
    .from('cases')
    .select('id, title, track_code, stage, immigrant_id')
    .eq('assigned_lawyer_user_id', user.id)

  const caseIds = (cases || []).map((caseItem) => caseItem.id)
  const immigrantIds = Array.from(new Set((cases || []).map((caseItem) => caseItem.immigrant_id)))

  const [{ data: documents }, { data: immigrants }] = await Promise.all([
    caseIds.length
      ? supabase.from('case_documents').select('*').in('case_id', caseIds).order('uploaded_at', { ascending: false })
      : Promise.resolve({ data: [] as any[] }),
    immigrantIds.length
      ? supabase.from('immigrants').select('id, full_name, email, nationality').in('id', immigrantIds)
      : Promise.resolve({ data: [] as any[] }),
  ])

  return (
    <DashboardLayout role="lawyer" userEmail={user.email} userName={profile.full_name}>
      <LawyerDocumentsClient
        documents={documents || []}
        cases={cases || []}
        immigrants={immigrants || []}
      />
    </DashboardLayout>
  )
}
