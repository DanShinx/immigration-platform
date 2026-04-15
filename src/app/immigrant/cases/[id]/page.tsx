import { notFound, redirect } from 'next/navigation'
import DashboardLayout from '@/components/DashboardLayout'
import ImmigrantCaseDetailClient from './ImmigrantCaseDetailClient'
import { createClient } from '@/lib/supabase/server'

export default async function ImmigrantCaseDetailPage({
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

  if (!profile || profile.role !== 'immigrant') redirect('/lawyer/dashboard')

  const { data: immigrant } = await supabase
    .from('immigrants')
    .select('*')
    .eq('user_id', user.id)
    .single()

  if (!immigrant) notFound()

  const { data: caseItem } = await supabase
    .from('cases')
    .select('*')
    .eq('id', params.id)
    .eq('immigrant_id', immigrant.id)
    .single()

  if (!caseItem) notFound()

  const [{ data: documents }, { data: payments }, { data: events }] = await Promise.all([
    supabase.from('case_documents').select('*').eq('case_id', caseItem.id).order('uploaded_at', { ascending: false }),
    supabase.from('case_payments').select('*').eq('case_id', caseItem.id).order('created_at', { ascending: true }),
    supabase.from('case_events').select('*').eq('case_id', caseItem.id).order('created_at', { ascending: false }),
  ])

  let lawyer = null
  if (caseItem.assigned_lawyer_user_id) {
    const { data } = await supabase
      .from('lawyers')
      .select('full_name, email')
      .eq('user_id', caseItem.assigned_lawyer_user_id)
      .single()
    lawyer = data
  }

  return (
    <DashboardLayout role="immigrant" userEmail={user.email} userName={profile.full_name}>
      <ImmigrantCaseDetailClient
        caseItem={caseItem}
        lawyer={lawyer}
        documents={documents || []}
        payments={payments || []}
        events={events || []}
      />
    </DashboardLayout>
  )
}
