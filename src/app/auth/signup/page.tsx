'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Eye, EyeOff, Users, Shield, ArrowLeft, Check } from 'lucide-react'
import type { UserRole } from '@/types'

function SignUpForm() {
  const searchParams = useSearchParams()
  const defaultRole = (searchParams.get('role') as UserRole) || 'immigrant'

  const [role, setRole] = useState<UserRole>(defaultRole)
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  // Extra fields
  const [nationality, setNationality] = useState('')
  const [licenseNumber, setLicenseNumber] = useState('')

  async function handleSignUp(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          role,
        },
      },
    })

    if (signUpError) {
      setError(signUpError.message)
      setLoading(false)
      return
    }

    if (data.user) {
      // Create profile
      const { error: profileError } = await supabase.from('profiles').insert({
        user_id: data.user.id,
        full_name: fullName,
        email,
        role,
      })

      if (!profileError) {
        // Create role-specific record
        if (role === 'immigrant') {
          await supabase.from('immigrants').insert({
            user_id: data.user.id,
            full_name: fullName,
            email,
            nationality: nationality || 'Pendiente',
            case_status: 'pending',
          })
        } else {
          await supabase.from('lawyers').insert({
            user_id: data.user.id,
            full_name: fullName,
            email,
            license_number: licenseNumber || 'Pendiente',
            is_active: true,
          })
        }
      }

      setSuccess(true)
    }

    setLoading(false)
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center max-w-md px-6">
          <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Check className="w-10 h-10 text-blue-600" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-3">¡Cuenta creada!</h2>
          <p className="text-slate-600 mb-4">
            Hemos enviado un correo de confirmación a:
          </p>
          <p className="font-semibold text-brand-700 bg-brand-50 px-4 py-2 rounded-lg mb-4">{email}</p>
          <p className="text-slate-500 text-sm">
            Revisa tu bandeja de entrada (y la carpeta de spam) y haz clic en el enlace de confirmación para activar tu cuenta. Después podrás iniciar sesión.
          </p>
          <Link
            href="/auth/login"
            className="inline-flex items-center justify-center mt-6 px-6 py-2.5 bg-brand-700 text-white font-medium rounded-lg hover:bg-brand-800 transition-colors text-sm"
          >
            Ir al inicio de sesión
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-brand-900 flex-col justify-between p-12 relative overflow-hidden">
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
            Comienza tu proceso de inmigración
          </h2>
          <p className="text-brand-200 text-lg leading-relaxed">
            Crea tu cuenta en menos de 2 minutos y conecta con abogados especializados.
          </p>
        </div>

        <div className="relative space-y-3">
          {[
            'Acceso seguro y privado a tus expedientes',
            'Abogados especializados en derecho de extranjería',
            'Seguimiento en tiempo real de tu caso',
          ].map((item) => (
            <div key={item} className="flex items-center gap-3">
              <div className="w-5 h-5 rounded-full bg-green-400/20 flex items-center justify-center flex-shrink-0">
                <Check className="w-3 h-3 text-green-400" />
              </div>
              <span className="text-brand-200 text-sm">{item}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex flex-col justify-center py-12 px-6 sm:px-12 bg-white overflow-y-auto">
        <div className="max-w-md w-full mx-auto">
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

          <h1 className="text-3xl font-bold text-slate-900 mb-2">Crear cuenta</h1>
          <p className="text-slate-500 mb-8">
            ¿Ya tienes cuenta?{' '}
            <Link href="/auth/login" className="text-brand-700 font-medium hover:underline">
              Inicia sesión
            </Link>
          </p>

          {/* Role selector */}
          <div className="grid grid-cols-2 gap-3 mb-8">
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
                Inmigrante
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
                Abogado
              </span>
            </button>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <form onSubmit={handleSignUp} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Nombre completo
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                placeholder="Juan García López"
                className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-600 focus:border-transparent transition-all"
              />
            </div>

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

            {role === 'immigrant' && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Nacionalidad
                </label>
                <input
                  type="text"
                  value={nationality}
                  onChange={(e) => setNationality(e.target.value)}
                  placeholder="Colombiana, Marroquí, etc."
                  className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-600 focus:border-transparent transition-all"
                />
              </div>
            )}

            {role === 'lawyer' && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Número de colegiado
                </label>
                <input
                  type="text"
                  value={licenseNumber}
                  onChange={(e) => setLicenseNumber(e.target.value)}
                  placeholder="28/12345"
                  className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-600 focus:border-transparent transition-all"
                />
              </div>
            )}

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
                  minLength={8}
                  placeholder="Mínimo 8 caracteres"
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
            </div>

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
                  Creando cuenta...
                </>
              ) : (
                `Crear cuenta como ${role === 'lawyer' ? 'abogado' : 'inmigrante'}`
              )}
            </button>

            <p className="text-xs text-slate-400 text-center">
              Al registrarte aceptas nuestros{' '}
              <Link href="#" className="text-brand-600 hover:underline">términos de uso</Link>{' '}
              y{' '}
              <Link href="#" className="text-brand-600 hover:underline">política de privacidad</Link>.
            </p>
          </form>
        </div>
      </div>
    </div>
  )
}

export default function SignUpPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-700" /></div>}>
      <SignUpForm />
    </Suspense>
  )
}
