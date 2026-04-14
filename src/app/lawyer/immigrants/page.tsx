import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import DashboardLayout from '@/components/DashboardLayout'
import ImmigrantListClient from './ImmigrantListClient'

export default async function ImmigrantsPage() {
  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', user.id)
    .single()

  if (!profile || profile.role !== 'lawyer') redirect('/immigrant/dashboard')

  const { data: immigrants } = await supabase
    .from('immigrants')
    .select('*')
    .eq('assigned_lawyer_id', user.id)
    .order('created_at', { ascending: false })

  return (
    <DashboardLayout role="lawyer" userEmail={user.email} userName={profile.full_name}>
      <ImmigrantListClient immigrants={immigrants || []} />
    </DashboardLayout>
  )
}
