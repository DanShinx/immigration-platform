import { notFound, redirect } from 'next/navigation'
import AdminLayout from '@/components/AdminLayout'
import { createClient } from '@/lib/supabase/server'
import { isCaseDeleted } from '@/lib/cases'
import AdminCaseDetailClient from './AdminCaseDetailClient'

export default async function AdminCaseDetailPage({
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

  if (!profile || profile.role !== 'admin') redirect('/')

  const { data: caseItem } = await supabase
    .from('cases')
    .select('*')
    .eq('id', params.id)
    .single()

  if (!caseItem) notFound()
  if (isCaseDeleted(caseItem)) redirect('/admin/cases')

  const [
    { data: immigrant },
    { data: documents },
    { data: payments },
    { data: events },
    { data: notes },
  ] = await Promise.all([
    supabase
      .from('immigrants')
      .select('full_name, email, nationality, phone, passport_number, date_of_birth, address_in_spain')
      .eq('id', caseItem.immigrant_id)
      .single(),
    supabase
      .from('case_documents')
      .select('*')
      .eq('case_id', caseItem.id)
      .order('uploaded_at', { ascending: false }),
    supabase
      .from('case_payments')
      .select('*')
      .eq('case_id', caseItem.id)
      .order('created_at', { ascending: true }),
    supabase
      .from('case_events')
      .select('*')
      .eq('case_id', caseItem.id)
      .order('created_at', { ascending: false }),
    supabase
      .from('case_notes')
      .select('*')
      .eq('case_id', caseItem.id)
      .order('created_at', { ascending: false }),
  ])

  let lawyer = null
  if (caseItem.assigned_lawyer_user_id) {
    const { data } = await supabase
      .from('lawyers')
      .select('user_id, full_name, email, license_number, specialization')
      .eq('user_id', caseItem.assigned_lawyer_user_id)
      .single()

    lawyer = data
  }

  return (
    <AdminLayout userEmail={user.email} userName={profile.full_name}>
      <AdminCaseDetailClient
        caseItem={caseItem}
        immigrant={immigrant}
        lawyer={lawyer}
        documents={documents || []}
        payments={payments || []}
        events={events || []}
        notes={notes || []}
      />
    </AdminLayout>
  )
}
