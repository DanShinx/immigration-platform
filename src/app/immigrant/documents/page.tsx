import { redirect } from 'next/navigation'
import DashboardLayout from '@/components/DashboardLayout'
import { createClient } from '@/lib/supabase/server'
import ImmigrantDocumentsClient from './ImmigrantDocumentsClient'

export default async function ImmigrantDocumentsPage() {
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
      <ImmigrantDocumentsClient
        immigrant={immigrant}
        documents={documents || []}
      />
    </DashboardLayout>
  )
}
