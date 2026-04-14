import { redirect } from 'next/navigation'
import AdminLayout from '@/components/AdminLayout'
import { createClient } from '@/lib/supabase/server'
import AdminLawyersClient from './AdminLawyersClient'

export default async function AdminLawyersPage() {
  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: profile } = await supabase
    .from('profiles').select('*').eq('user_id', user.id).single()

  if (!profile || profile.role !== 'admin') redirect('/')

  const { data: lawyers } = await supabase
    .from('lawyers')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <AdminLayout userEmail={user.email} userName={profile.full_name}>
      <AdminLawyersClient lawyers={lawyers || []} adminUserId={user.id} />
    </AdminLayout>
  )
}
