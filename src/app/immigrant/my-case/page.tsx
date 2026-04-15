import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { filterVisibleCases } from '@/lib/cases'

export default async function ImmigrantMyCaseRedirectPage() {
  const supabase = createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/auth/login')

  const { data: immigrant } = await supabase
    .from('immigrants')
    .select('id')
    .eq('user_id', user.id)
    .single()

  if (!immigrant) redirect('/immigrant/cases')

  const { data: cases } = await supabase
    .from('cases')
    .select('id, stage, updated_at, created_at')
    .eq('immigrant_id', immigrant.id)
    .order('updated_at', { ascending: false })
    .limit(10)

  const visibleCases = filterVisibleCases(cases || [])
  const activeCase = visibleCases.find(
    (caseItem) => !['approved', 'rejected', 'closed'].includes(caseItem.stage)
  )

  if (activeCase) {
    redirect(`/immigrant/cases/${activeCase.id}`)
  }

  if (visibleCases[0]) {
    redirect(`/immigrant/cases/${visibleCases[0].id}`)
  }

  redirect('/immigrant/cases')
}
