import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import DashboardLayout from '@/components/DashboardLayout'
import ImmigrantDetailClient from './ImmigrantDetailClient'

interface Props {
  params: { id: string }
}

export default async function ImmigrantDetailPage({ params }: Props) {
  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', user.id)
    .single()

  if (!profile || profile.role !== 'lawyer') redirect('/immigrant/dashboard')

  // Only fetch immigrant if assigned to this lawyer
  const { data: immigrant } = await supabase
    .from('immigrants')
    .select('*')
    .eq('id', params.id)
    .eq('assigned_lawyer_id', user.id)
    .single()

  if (!immigrant) notFound()

  const { data: documents } = await supabase
    .from('case_documents')
    .select('*')
    .eq('immigrant_id', params.id)
    .order('uploaded_at', { ascending: false })

  const { data: notes } = await supabase
    .from('case_notes')
    .select('*')
    .eq('immigrant_id', params.id)
    .order('created_at', { ascending: false })

  return (
    <DashboardLayout role="lawyer" userEmail={user.email} userName={profile.full_name}>
      <ImmigrantDetailClient
        immigrant={immigrant}
        documents={documents || []}
        notes={notes || []}
        lawyerId={user.id}
      />
    </DashboardLayout>
  )
}
