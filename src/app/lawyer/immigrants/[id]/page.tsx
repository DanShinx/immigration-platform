import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export default async function ImmigrantDetailRedirectPage({
  params,
}: {
  params: { id: string }
}) {
  const supabase = createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/auth/login')

  const { data: cases } = await supabase
    .from('cases')
    .select('id')
    .eq('immigrant_id', params.id)
    .eq('assigned_lawyer_user_id', user.id)
    .order('updated_at', { ascending: false })
    .limit(1)

  if (cases?.[0]) {
    redirect(`/lawyer/cases/${cases[0].id}`)
  }

  redirect('/lawyer/cases')
}
