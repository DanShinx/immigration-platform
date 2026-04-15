import { redirect } from 'next/navigation'
import DashboardLayout from '@/components/DashboardLayout'
import ImmigrantDocumentsClient from './ImmigrantDocumentsClient'
import { createClient } from '@/lib/supabase/server'
import { filterVisibleCases, sortCasesByRecency } from '@/lib/cases'

export default async function ImmigrantDocumentsPage({
  searchParams,
}: {
  searchParams?: { case?: string }
}) {
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

  const { data: rawCases } = await supabase
    .from('cases')
    .select('id, title, track_code, updated_at, created_at')
    .eq('immigrant_id', immigrant.id)

  const cases = sortCasesByRecency(filterVisibleCases(rawCases || []))
  const currentCaseId =
    cases.find((caseItem) => caseItem.id === searchParams?.case)?.id || cases[0]?.id || null

  const { data: documents } = currentCaseId
    ? await supabase
        .from('case_documents')
        .select('*')
        .eq('case_id', currentCaseId)
        .order('uploaded_at', { ascending: false })
    : { data: [] as any[] }

  return (
    <DashboardLayout role="immigrant" userEmail={user.email} userName={profile.full_name}>
      <ImmigrantDocumentsClient
        cases={cases.map((caseItem) => ({
          id: caseItem.id,
          title: caseItem.title,
          track_code: caseItem.track_code,
        }))}
        currentCaseId={currentCaseId}
        documents={documents || []}
        immigrantId={immigrant.id}
      />
    </DashboardLayout>
  )
}
