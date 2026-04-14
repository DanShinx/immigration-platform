import { redirect } from 'next/navigation'
import DashboardLayout from '@/components/DashboardLayout'
import { createClient } from '@/lib/supabase/server'
import ImmigrantMyCaseClient from './ImmigrantMyCaseClient'

export default async function ImmigrantMyCasePage() {
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

  let lawyer = null
  if (immigrant?.assigned_lawyer_id) {
    const { data } = await supabase
      .from('lawyers')
      .select('full_name, email, phone, specialization, bar_association')
      .eq('user_id', immigrant.assigned_lawyer_id)
      .single()
    lawyer = data
  }

  const { data: documents } = immigrant
    ? await supabase
        .from('case_documents')
        .select('*')
        .eq('immigrant_id', immigrant.id)
        .order('uploaded_at', { ascending: false })
    : { data: [] }

  return (
    <DashboardLayout
      role="immigrant"
      userEmail={user.email}
      userName={profile.full_name}
    >
      <ImmigrantMyCaseClient
        immigrant={immigrant}
        lawyer={lawyer}
        documents={documents || []}
      />
    </DashboardLayout>
  )
}
