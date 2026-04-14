'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Eye, EyeOff, ArrowLeft } from 'lucide-react'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

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
        setError('Tu cuenta está pendiente de confirmación. Revisa tu correo electrónico y haz clic en el enlace de activación.')
      } else if (signInError.message.toLowerCase().includes('invalid login credentials')) {
        setError('Correo o contraseña incorrectos. Por favor, inténtalo de nuevo.')
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
      {/* Left panel */}
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
            <span className="font-bold text-white text-lg block leading-tight">Immigration Platform</span>
            <span className="text-xs text-brand-300 uppercase tracking-wide">España</span>
          </div>
        </Link>

        <div className="relative">
          <h2 className="text-4xl font-bold text-white mb-4 leading-tight">
            Bienvenido de vuelta
          </h2>
          <p className="text-brand-200 text-lg leading-relaxed">
            Accede a tu panel para gestionar tu proceso de inmigración en España.
          </p>
        </div>

        <div className="relative grid grid-cols-3 gap-4">
          {[
            { value: '500+', label: 'Casos' },
            { value: '50+', label: 'Abogados' },
            { value: '98%', label: 'Satisfacción' },
          ].map((s) => (
            <div key={s.label} className="bg-white/10 rounded-2xl p-4 text-center">
              <div className="text-2xl font-bold text-white">{s.value}</div>
              <div className="text-xs text-brand-300 mt-1">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex flex-col justify-center py-12 px-6 sm:px-12 bg-white">
        <div className="max-w-md w-full mx-auto">
          {/* Mobile logo */}
          <div className="lg:hidden mb-8">
            <Link href="/" className="flex items-center gap-3">
              <div className="flex items-center gap-1">
                <div className="w-2.5 h-7 bg-spain-red rounded-sm" />
                <div className="w-2.5 h-7 bg-spain-yellow rounded-sm" />
                <div className="w-2.5 h-7 bg-spain-red rounded-sm" />
              </div>
              <span className="font-bold text-brand-900 text-lg">Immigration Platform España</span>
            </Link>
          </div>

          <Link href="/" className="hidden lg:inline-flex items-center gap-2 text-sm text-slate-500 hover:text-brand-700 mb-8 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Volver al inicio
          </Link>

          <h1 className="text-3xl font-bold text-slate-900 mb-2">Iniciar sesión</h1>
          <p className="text-slate-500 mb-8">
            ¿No tienes cuenta?{' '}
            <Link href="/auth/signup" className="text-brand-700 font-medium hover:underline">
              Regístrate aquí
            </Link>
          </p>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Correo electrónico
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="tu@email.com"
                className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-600 focus:border-transparent transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Contraseña
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
                  ¿Olvidaste tu contraseña?
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
                  Iniciando sesión...
                </>
              ) : (
                'Iniciar sesión'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
