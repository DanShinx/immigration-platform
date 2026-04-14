'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import LanguageSwitcher from '@/components/LanguageSwitcher'
import { useI18n } from '@/components/LanguageProvider'
import { createClient } from '@/lib/supabase/client'
import { Eye, EyeOff, ArrowLeft } from 'lucide-react'

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-5 h-5" xmlns="http://www.w3.org/2000/svg">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  )
}

export default function LoginPage() {
  const [googleLoading, setGoogleLoading] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()
  const { messages } = useI18n()
  const t = messages.auth.login

  async function handleGoogleLogin() {
    setGoogleLoading(true)
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })
    setGoogleLoading(false)
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { data, error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (signInError) {
      if (signInError.message.toLowerCase().includes('email not confirmed')) {
        setError(t.errors.emailNotConfirmed)
      } else if (signInError.message.toLowerCase().includes('invalid login credentials')) {
        setError(t.errors.invalidCredentials)
      } else {
        setError(signInError.message)
      }
      setLoading(false)
      return
    }

    if (data.user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('user_id', data.user.id)
        .single()

      if (profile?.role === 'lawyer') {
        router.push('/lawyer/dashboard')
      } else {
        router.push('/immigrant/dashboard')
      }
    }

    setLoading(false)
  }

  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex lg:w-1/2 bg-brand-900 flex-col justify-between p-12 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-brand-600 to-transparent" />
        </div>

        <Link href="/" className="relative flex items-center gap-3">
          <div className="flex items-center gap-1">
            <div className="w-3 h-8 bg-spain-red rounded-sm" />
            <div className="w-3 h-8 bg-spain-yellow rounded-sm" />
            <div className="w-3 h-8 bg-spain-red rounded-sm" />
          </div>
          <div>
            <span className="font-bold text-white text-lg block leading-tight">{messages.shared.appName}</span>
            <span className="text-xs text-brand-300 uppercase tracking-wide">{messages.shared.appNameSpain.split(' ').pop()}</span>
          </div>
        </Link>

        <div className="relative">
          <h2 className="text-4xl font-bold text-white mb-4 leading-tight">
            {t.panelTitle}
          </h2>
          <p className="text-brand-200 text-lg leading-relaxed">
            {t.panelSubtitle}
          </p>
        </div>

        <div className="relative grid grid-cols-3 gap-4">
          {t.stats.map((s) => (
            <div key={s.label} className="bg-white/10 rounded-2xl p-4 text-center">
              <div className="text-2xl font-bold text-white">{s.value}</div>
              <div className="text-xs text-brand-300 mt-1">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex-1 flex flex-col justify-center py-12 px-6 sm:px-12 bg-white">
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

          <h1 className="text-3xl font-bold text-slate-900 mb-2">{t.title}</h1>
          <p className="text-slate-500 mb-8">
            {t.signupPrompt}{' '}
            <Link href="/auth/signup" className="text-brand-700 font-medium hover:underline">
              {t.signupLink}
            </Link>
          </p>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={googleLoading}
            className="w-full flex items-center justify-center gap-3 px-4 py-2.5 border border-slate-300 rounded-lg bg-white hover:bg-slate-50 transition-colors text-sm font-medium text-slate-700 shadow-sm disabled:opacity-50 mb-6"
          >
            {googleLoading ? (
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            ) : (
              <GoogleIcon />
            )}
            {t.google}
          </button>

          <div className="flex items-center gap-3 mb-6">
            <div className="flex-1 h-px bg-slate-200" />
            <span className="text-xs text-slate-400 font-medium">{t.orEmail}</span>
            <div className="flex-1 h-px bg-slate-200" />
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                {t.email}
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder={messages.auth.signup.placeholders.email}
                className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-600 focus:border-transparent transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                {t.password}
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 pr-11 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-600 focus:border-transparent transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <div className="text-right mt-1.5">
                <Link href="/auth/reset-password" className="text-xs text-brand-600 hover:underline">
                  {t.forgotPassword}
                </Link>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-brand-700 hover:bg-brand-800 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-sm"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  {t.submitting}
                </>
              ) : (
                t.submit
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
