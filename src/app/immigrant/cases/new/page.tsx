import { redirect } from 'next/navigation'
import DashboardLayout from '@/components/DashboardLayout'
import NewCaseClient from './NewCaseClient'
import { createClient } from '@/lib/supabase/server'
import { filterVisibleCases } from '@/lib/cases'
import { ensureImmigrantProfile } from '@/lib/immigrants'
import type { CaseTrackCode } from '@/types'

const allowedTracks: CaseTrackCode[] = ['nomad_holder', 'nomad_family', 'nomad_renewal']

export default async function NewCasePage({
  searchParams,
}: {
  searchParams?: { track?: string }
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

  const immigrant = await ensureImmigrantProfile(supabase, user, {
    full_name: profile.full_name,
    email: profile.email,
  })

  if (!immigrant) redirect('/immigrant/dashboard')

  const requestedTrack = searchParams?.track
  const initialTrack = allowedTracks.includes(requestedTrack as CaseTrackCode)
    ? (requestedTrack as CaseTrackCode)
    : 'nomad_holder'

  const { data: cases } = await supabase
    .from('cases')
    .select('id, title, track_code, stage')
    .eq('immigrant_id', immigrant.id)
    .order('created_at', { ascending: false })

  return (
    <DashboardLayout role="immigrant" userEmail={user.email} userName={profile.full_name}>
      <NewCaseClient
        immigrantId={immigrant.id}
        initialTrack={initialTrack}
        existingCases={filterVisibleCases(cases || [])}
      />
    </DashboardLayout>
  )
}
