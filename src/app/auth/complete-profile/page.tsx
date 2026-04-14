import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import CompleteProfileClient from './CompleteProfileClient'
import type { UserRole } from '@/types'

interface PageProps {
  searchParams?: {
    role?: string
  }
}

export default async function CompleteProfilePage({ searchParams }: PageProps) {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('user_id', user.id)
    .single()

  if (profile?.role === 'lawyer') {
    redirect('/lawyer/dashboard')
  }

  if (profile?.role === 'immigrant') {
    redirect('/immigrant/dashboard')
  }

  const initialRole: UserRole = searchParams?.role === 'lawyer' ? 'lawyer' : 'immigrant'
  const initialFullName =
    user.user_metadata?.full_name ||
    user.user_metadata?.name ||
    [user.user_metadata?.given_name, user.user_metadata?.family_name].filter(Boolean).join(' ') ||
    user.email?.split('@')[0] ||
    ''

  return (
    <CompleteProfileClient
      initialEmail={user.email || ''}
      initialFullName={initialFullName}
      initialRole={initialRole}
    />
  )
}
