import { redirect } from 'next/navigation'
import AdminLayout from '@/components/AdminLayout'
import { createClient } from '@/lib/supabase/server'
import AdminImmigrantsClient from './AdminImmigrantsClient'

export default async function AdminImmigrantsPage() {
  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: profile } = await supabase
    .from('profiles').select('*').eq('user_id', user.id).single()

  if (!profile || profile.role !== 'admin') redirect('/')

  const [{ data: immigrants }, { data: lawyers }] = await Promise.all([
    supabase
      .from('immigrants')
      .select('*')
      .order('created_at', { ascending: false }),
    supabase
      .from('lawyers')
      .select('user_id, full_name, email, approval_status, is_active')
      .eq('approval_status', 'approved')
      .order('full_name', { ascending: true }),
  ])

  // Build lawyer name lookup by user_id for the assigned_lawyer_id column
  const lawyerMap = new Map(
    (lawyers || []).map((l: any) => [l.user_id, l])
  )

  const hydratedImmigrants = (immigrants || []).map((imm: any) => ({
    ...imm,
    assignedLawyer: imm.assigned_lawyer_id ? lawyerMap.get(imm.assigned_lawyer_id) || null : null,
  }))

  return (
    <AdminLayout userEmail={user.email} userName={profile.full_name}>
      <AdminImmigrantsClient
        immigrants={hydratedImmigrants}
        lawyers={lawyers || []}
        adminUserId={user.id}
      />
    </AdminLayout>
  )
}
