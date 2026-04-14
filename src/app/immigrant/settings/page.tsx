import { redirect } from 'next/navigation'
import DashboardLayout from '@/components/DashboardLayout'
import { createClient } from '@/lib/supabase/server'
import ImmigrantSettingsClient from './ImmigrantSettingsClient'

export default async function ImmigrantSettingsPage() {
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

  if (!immigrant) redirect('/immigrant/dashboard')

  return (
    <DashboardLayout role="immigrant" userEmail={user.email} userName={profile.full_name}>
      <ImmigrantSettingsClient immigrant={immigrant} userEmail={user.email ?? ''} userId={user.id} />
    </DashboardLayout>
  )
}
