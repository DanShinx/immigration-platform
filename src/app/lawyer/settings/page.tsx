import { redirect } from 'next/navigation'
import DashboardLayout from '@/components/DashboardLayout'
import { createClient } from '@/lib/supabase/server'
import LawyerSettingsClient from './LawyerSettingsClient'

export default async function LawyerSettingsPage() {
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

  const { data: lawyer } = await supabase
    .from('lawyers')
    .select('*')
    .eq('user_id', user.id)
    .single()

  if (!lawyer) redirect('/lawyer/dashboard')

  return (
    <DashboardLayout role="lawyer" userEmail={user.email} userName={profile.full_name}>
      <LawyerSettingsClient lawyer={lawyer} userEmail={user.email ?? ''} userId={user.id} />
    </DashboardLayout>
  )
}
