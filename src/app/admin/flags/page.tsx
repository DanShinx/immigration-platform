import { redirect } from 'next/navigation'
import AdminLayout from '@/components/AdminLayout'
import { createClient } from '@/lib/supabase/server'
import AdminFlagsClient from './AdminFlagsClient'

export default async function AdminFlagsPage() {
  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: profile } = await supabase
    .from('profiles').select('*').eq('user_id', user.id).single()

  if (!profile || profile.role !== 'admin') redirect('/')

  const { data: flags } = await supabase
    .from('admin_flags')
    .select('*')
    .order('created_at', { ascending: false })

  // Hydrate reporter info from profiles
  const reporterIds = Array.from(new Set((flags || []).map((f: any) => f.reporter_user_id)))
  const { data: reporters } = reporterIds.length
    ? await supabase.from('profiles').select('user_id, full_name, email').in('user_id', reporterIds)
    : { data: [] as any[] }

  const profileById = new Map((reporters || []).map((p: any) => [p.user_id, p]))

  const hydratedFlags = (flags || []).map((f: any) => ({
    ...f,
    reporter: profileById.get(f.reporter_user_id) || null,
  }))

  return (
    <AdminLayout userEmail={user.email} userName={profile.full_name}>
      <AdminFlagsClient flags={hydratedFlags} adminUserId={user.id} />
    </AdminLayout>
  )
}
