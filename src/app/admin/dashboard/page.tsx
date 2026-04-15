import { redirect } from 'next/navigation'
import AdminLayout from '@/components/AdminLayout'
import { createClient } from '@/lib/supabase/server'
import AdminDashboardClient from './AdminDashboardClient'

export default async function AdminDashboardPage() {
  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: profile } = await supabase
    .from('profiles').select('*').eq('user_id', user.id).single()

  if (!profile || profile.role !== 'admin') redirect('/')

  const [
    { count: totalImmigrants },
    { count: totalLawyers },
    { count: pendingApproval },
    { count: openFlags },
    { count: pendingRequests },
    { count: casesInReview },
    { data: recentFlags },
    { data: recentPendingLawyers },
  ] = await Promise.all([
    supabase.from('immigrants').select('*', { count: 'exact', head: true }),
    supabase.from('lawyers').select('*', { count: 'exact', head: true }).eq('is_active', true).eq('approval_status', 'approved'),
    supabase.from('lawyers').select('*', { count: 'exact', head: true }).eq('approval_status', 'pending_approval'),
    supabase.from('admin_flags').select('*', { count: 'exact', head: true }).eq('status', 'open'),
    supabase.from('lawyer_assignment_requests').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
    supabase.from('cases').select('*', { count: 'exact', head: true }).eq('stage', 'lawyer_review'),
    supabase.from('admin_flags').select('*').eq('status', 'open').order('created_at', { ascending: false }).limit(5),
    supabase.from('lawyers').select('*').eq('approval_status', 'pending_approval').order('created_at', { ascending: false }).limit(5),
  ])

  // Hydrate flag reporter profiles
  const flagReporterIds = Array.from(new Set((recentFlags || []).map((f: any) => f.reporter_user_id)))
  const { data: flagProfiles } = flagReporterIds.length
    ? await supabase.from('profiles').select('user_id, full_name, email').in('user_id', flagReporterIds)
    : { data: [] as any[] }

  const profileById = new Map((flagProfiles || []).map((p: any) => [p.user_id, p]))

  const hydratedFlags = (recentFlags || []).map((f: any) => ({
    ...f,
    reporter: profileById.get(f.reporter_user_id) || null,
  }))

  return (
    <AdminLayout userEmail={user.email} userName={profile.full_name}>
      <AdminDashboardClient
        stats={{
          totalImmigrants: totalImmigrants ?? 0,
          totalLawyers: totalLawyers ?? 0,
          pendingApproval: pendingApproval ?? 0,
          openFlags: openFlags ?? 0,
          pendingRequests: pendingRequests ?? 0,
          casesInReview: casesInReview ?? 0,
        }}
        recentFlags={hydratedFlags}
        recentPendingLawyers={recentPendingLawyers || []}
      />
    </AdminLayout>
  )
}
