import type { ImmigrantProfile, Profile } from '@/types'

interface AuthUserLike {
  id: string
  email?: string | null
}

export async function ensureImmigrantProfile(
  supabase: any,
  user: AuthUserLike,
  profile: Pick<Profile, 'full_name' | 'email'>
): Promise<ImmigrantProfile | null> {
  const { data: existingImmigrant } = await supabase
    .from('immigrants')
    .select('*')
    .eq('user_id', user.id)
    .maybeSingle()

  if (existingImmigrant) {
    return existingImmigrant
  }

  const fullName = profile.full_name?.trim() || user.email?.split('@')[0] || 'Pending'
  const email = profile.email || user.email || ''

  const { data: createdImmigrant } = await supabase
    .from('immigrants')
    .insert({
      user_id: user.id,
      full_name: fullName,
      email,
      nationality: 'Pending',
      // Preserve the legacy compatibility field until the last old surfaces are removed.
      case_status: 'pending',
    })
    .select('*')
    .single()

  return createdImmigrant
}
