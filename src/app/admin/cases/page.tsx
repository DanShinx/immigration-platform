import { redirect } from 'next/navigation'
import AdminLayout from '@/components/AdminLayout'
import { createClient } from '@/lib/supabase/server'
import { filterVisibleCases, sortCasesByRecency } from '@/lib/cases'
import AdminCasesClient from './AdminCasesClient'

export default async function AdminCasesPage() {
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

  if (!profile || profile.role !== 'admin') redirect('/')

  const { data: rawCases } = await supabase
    .from('cases')
    .select('*')
    .order('updated_at', { ascending: false })

  const visibleCases = filterVisibleCases(rawCases || [])
  const immigrantIds = Array.from(new Set(visibleCases.map((c) => c.immigrant_id).filter(Boolean)))
  const lawyerIds = Array.from(
    new Set(visibleCases.map((c) => c.assigned_lawyer_user_id).filter(Boolean))
  )

  const [{ data: immigrants }, { data: lawyers }] = await Promise.all([
    immigrantIds.length
      ? supabase
          .from('immigrants')
          .select('id, full_name, email')
          .in('id', immigrantIds)
      : Promise.resolve({ data: [] as any[] }),
    lawyerIds.length
      ? supabase
          .from('lawyers')
          .select('user_id, full_name')
          .in('user_id', lawyerIds)
      : Promise.resolve({ data: [] as any[] }),
  ])

  const immigrantMap = new Map((immigrants || []).map((i: any) => [i.id, i]))
  const lawyerMap = new Map((lawyers || []).map((l: any) => [l.user_id, l]))

  const cases = sortCasesByRecency(
    visibleCases.map((c) => ({
      ...c,
      immigrant: immigrantMap.get(c.immigrant_id) || null,
      lawyer: c.assigned_lawyer_user_id ? lawyerMap.get(c.assigned_lawyer_user_id) || null : null,
    }))
  )

  return (
    <AdminLayout userEmail={user.email} userName={profile.full_name}>
      <AdminCasesClient cases={cases} />
    </AdminLayout>
  )
}
