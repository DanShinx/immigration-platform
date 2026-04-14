'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import LanguageSwitcher from '@/components/LanguageSwitcher'
import { useI18n } from '@/components/LanguageProvider'
import { createClient } from '@/lib/supabase/client'
import { ArrowLeft, Check, Shield, Users } from 'lucide-react'
import type { UserRole } from '@/types'

interface Props {
  initialEmail: string
  initialFullName: string
  initialRole: UserRole
}

export default function CompleteProfileClient({
  initialEmail,
  initialFullName,
  initialRole,
}: Props) {
  const [role, setRole] = useState<UserRole>(initialRole)
  const [fullName, setFullName] = useState(initialFullName)
  const [nationality, setNationality] = useState('')
  const [licenseNumber, setLicenseNumber] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const router = useRouter()
  const supabase = createClient()
  const { messages } = useI18n()
  const signupT = messages.auth.signup
  const t = messages.auth.onboarding

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user?.email) {
      setError(t.errors.missingEmail)
      setLoading(false)
      return
    }

    const normalizedFullName = fullName.trim()

    const { error: profileError } = await supabase.from('profiles').upsert(
      {
        user_id: user.id,
        full_name: normalizedFullName,
        email: user.email,
        role,
      },
      { onConflict: 'user_id' }
    )

    if (profileError) {
      setError(profileError.message)
      setLoading(false)
      return
    }

    if (role === 'immigrant') {
      const { error: immigrantError } = await supabase.from('immigrants').upsert(
        {
          user_id: user.id,
          full_name: normalizedFullName,
          email: user.email,
          nationality: nationality.trim() || messages.shared.placeholders.pending,
          case_status: 'pending',
        },
        { onConflict: 'user_id' }
      )

      if (immigrantError) {
        setError(immigrantError.message)
        setLoading(false)
        return
      }
    } else {
      const { error: lawyerError } = await supabase.from('lawyers').upsert(
        {
          user_id: user.id,
          full_name: normalizedFullName,
          email: user.email,
          license_number: licenseNumber.trim() || messages.shared.placeholders.pending,
          is_active: false,
          approval_status: 'pending_approval',
        },
        { onConflict: 'user_id' }
      )

      if (lawyerError) {
        setError(lawyerError.message)
        setLoading(false)
        return
      }
    }

    router.push(role === 'lawyer' ? '/lawyer/dashboard' : '/immigrant/dashboard')
    router.refresh()
  }

  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex lg:w-1/2 bg-brand-900 flex-col justify-between p-12 relative overflow-hidden">
        <Link href="/" className="relative flex items-center gap-3">
          <div className="flex items-center gap-1">
            <div className="w-3 h-8 bg-spain-red rounded-sm" />
            <div className="w-3 h-8 bg-spain-yellow rounded-sm" />
            <div className="w-3 h-8 bg-spain-red rounded-sm" />
          </div>
          <div>
            <span className="font-bold text-white text-lg block leading-tight">{messages.shared.appName}</span>
            <span className="text-xs text-brand-300 uppercase tracking-wide">
              {messages.shared.appNameSpain.split(' ').pop()}
            </span>
          </div>
        </Link>

        <div className="relative">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm text-brand-100 mb-4">
            <Check className="w-4 h-4 text-green-300" />
            {t.connectedWithGoogle}
          </div>
          <h2 className="text-4xl font-bold text-white mb-4 leading-tight">{t.panelTitle}</h2>
          <p className="text-brand-200 text-lg leading-relaxed">{t.panelSubtitle}</p>
        </div>

        <div className="relative space-y-3">
          {signupT.bullets.map((item) => (
            <div key={item} className="flex items-center gap-3">
              <div className="w-5 h-5 rounded-full bg-green-400/20 flex items-center justify-center flex-shrink-0">
                <Check className="w-3 h-3 text-green-400" />
              </div>
              <span className="text-brand-200 text-sm">{item}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="flex-1 flex flex-col justify-center py-12 px-6 sm:px-12 bg-white overflow-y-auto">
        <div className="max-w-md w-full mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div className="lg:hidden">
              <Link href="/" className="flex items-center gap-3">
                <div className="flex items-center gap-1">
                  <div className="w-2.5 h-7 bg-spain-red rounded-sm" />
                  <div className="w-2.5 h-7 bg-spain-yellow rounded-sm" />
                  <div className="w-2.5 h-7 bg-spain-red rounded-sm" />
                </div>
                <span className="font-bold text-brand-900 text-lg">{messages.shared.appNameSpain}</span>
              </Link>
            </div>
            <LanguageSwitcher />
          </div>

          <Link href="/" className="hidden lg:inline-flex items-center gap-2 text-sm text-slate-500 hover:text-brand-700 mb-8 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            {messages.shared.actions.backHome}
          </Link>

          <div className="inline-flex items-center gap-2 rounded-full bg-brand-50 px-4 py-2 text-sm text-brand-700 mb-4">
            <Check className="w-4 h-4" />
            {t.connectedWithGoogle}
          </div>

          <h1 className="text-3xl font-bold text-slate-900 mb-2">{t.title}</h1>
          <p className="text-slate-500 mb-8">{t.subtitle}</p>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setRole('immigrant')}
                className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                  role === 'immigrant'
                    ? 'border-brand-600 bg-brand-50'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <Users className={`w-6 h-6 ${role === 'immigrant' ? 'text-brand-700' : 'text-slate-400'}`} />
                <span className={`text-sm font-medium ${role === 'immigrant' ? 'text-brand-700' : 'text-slate-600'}`}>
                  {signupT.roles.immigrant}
                </span>
              </button>
              <button
                type="button"
                onClick={() => setRole('lawyer')}
                className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                  role === 'lawyer'
                    ? 'border-brand-600 bg-brand-50'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <Shield className={`w-6 h-6 ${role === 'lawyer' ? 'text-brand-700' : 'text-slate-400'}`} />
                <span className={`text-sm font-medium ${role === 'lawyer' ? 'text-brand-700' : 'text-slate-600'}`}>
                  {signupT.roles.lawyer}
                </span>
              </button>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                {signupT.fullName}
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                placeholder={signupT.placeholders.fullName}
                className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-600 focus:border-transparent transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                {t.emailLocked}
              </label>
              <input
                type="email"
                value={initialEmail}
                readOnly
                className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-600"
              />
            </div>

            {role === 'immigrant' && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  {signupT.nationality}
                </label>
                <input
                  type="text"
                  value={nationality}
                  onChange={(e) => setNationality(e.target.value)}
                  placeholder={signupT.placeholders.nationality}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-600 focus:border-transparent transition-all"
                />
              </div>
            )}

            {role === 'lawyer' && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  {signupT.licenseNumber}
                </label>
                <input
                  type="text"
                  value={licenseNumber}
                  onChange={(e) => setLicenseNumber(e.target.value)}
                  placeholder={signupT.placeholders.licenseNumber}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-600 focus:border-transparent transition-all"
                />
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-brand-700 hover:bg-brand-800 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-sm mt-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  {t.submitting}
                </>
              ) : role === 'lawyer' ? t.submitLawyer : t.submitImmigrant}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
