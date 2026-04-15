import { redirect } from 'next/navigation'
import AdminLayout from '@/components/AdminLayout'
import { createClient } from '@/lib/supabase/server'
import { sortCasesByRecency } from '@/lib/cases'
import AdminImmigrantsClient from './AdminImmigrantsClient'

export default async function AdminImmigrantsPage() {
  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: profile } = await supabase
    .from('profiles').select('*').eq('user_id', user.id).single()

  if (!profile || profile.role !== 'admin') redirect('/')

  const [{ data: immigrants }, { data: cases }] = await Promise.all([
    supabase
      .from('immigrants')
      .select('*')
      .order('created_at', { ascending: false }),
    supabase
      .from('cases')
      .select('id, immigrant_id, title, stage, created_at, updated_at'),
  ])

  const casesByImmigrant = new Map<string, any[]>()
  for (const caseItem of cases || []) {
    const existing = casesByImmigrant.get(caseItem.immigrant_id) || []
    existing.push(caseItem)
    casesByImmigrant.set(caseItem.immigrant_id, existing)
  }

  const hydratedImmigrants = (immigrants || []).map((imm: any) => ({
    ...imm,
    totalCases: (casesByImmigrant.get(imm.id) || []).length,
    ...(function () {
      const latestCase = sortCasesByRecency(casesByImmigrant.get(imm.id) || [])[0] || null
      return {
        latestCaseId: latestCase?.id || null,
        latestCaseTitle: latestCase?.title || null,
        latestCaseStage: latestCase?.stage || null,
      }
    })(),
  }))

  return (
    <AdminLayout userEmail={user.email} userName={profile.full_name}>
      <AdminImmigrantsClient immigrants={hydratedImmigrants} />
    </AdminLayout>
  )
}
