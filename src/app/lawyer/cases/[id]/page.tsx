import { notFound, redirect } from 'next/navigation'
import DashboardLayout from '@/components/DashboardLayout'
import LawyerCaseDetailClient from './LawyerCaseDetailClient'
import { createClient } from '@/lib/supabase/server'

export default async function LawyerCaseDetailPage({
  params,
}: {
  params: { id: string }
}) {
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

  const { data: caseItem } = await supabase
    .from('cases')
    .select('*')
    .eq('id', params.id)
    .eq('assigned_lawyer_user_id', user.id)
    .single()

  if (!caseItem) notFound()

  const [{ data: immigrant }, { data: documents }, { data: notes }, { data: payments }] =
    await Promise.all([
      supabase.from('immigrants').select('full_name, email, nationality').eq('id', caseItem.immigrant_id).single(),
      supabase.from('case_documents').select('*').eq('case_id', caseItem.id).order('uploaded_at', { ascending: false }),
      supabase.from('case_notes').select('*').eq('case_id', caseItem.id).order('created_at', { ascending: false }),
      supabase.from('case_payments').select('*').eq('case_id', caseItem.id).order('created_at', { ascending: true }),
    ])

  return (
    <DashboardLayout role="lawyer" userEmail={user.email} userName={profile.full_name}>
      <LawyerCaseDetailClient
        caseItem={caseItem}
        immigrant={immigrant}
        documents={documents || []}
        notes={notes || []}
        payments={payments || []}
        lawyerId={user.id}
      />
    </DashboardLayout>
  )
}
