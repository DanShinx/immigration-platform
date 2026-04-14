import Link from 'next/link'
import { Shield, Users, FileText, CheckCircle, Globe, Lock } from 'lucide-react'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-white/95 backdrop-blur-sm border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1">
                <div className="w-3 h-8 bg-spain-red rounded-sm" />
                <div className="w-3 h-8 bg-spain-yellow rounded-sm" />
                <div className="w-3 h-8 bg-spain-red rounded-sm" />
              </div>
              <div>
                <span className="font-bold text-brand-900 text-lg leading-tight block">
                  Immigration Platform
                </span>
                <span className="text-xs text-slate-500 font-medium tracking-wide uppercase">
                  España
                </span>
              </div>
            </div>

            {/* Nav links */}
            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-sm text-slate-600 hover:text-brand-700 font-medium transition-colors">
                Servicios
              </a>
              <a href="#how-it-works" className="text-sm text-slate-600 hover:text-brand-700 font-medium transition-colors">
                Cómo funciona
              </a>
              <a href="#portals" className="text-sm text-slate-600 hover:text-brand-700 font-medium transition-colors">
                Accesos
              </a>
            </div>

            {/* CTA */}
            <div className="flex items-center gap-3">
              <Link
                href="/auth/login"
                className="text-sm font-medium text-brand-700 hover:text-brand-900 transition-colors"
              >
                Iniciar sesión
              </Link>
              <Link
                href="/auth/signup"
                className="inline-flex items-center px-4 py-2 bg-brand-700 hover:bg-brand-800 text-white text-sm font-medium rounded-lg transition-colors shadow-sm"
              >
                Registrarse
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-16 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-900 via-brand-800 to-brand-700" />
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-72 h-72 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-brand-300 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-28 text-center">
          {/* Spain flag accent */}
          <div className="flex justify-center gap-1 mb-8">
            <div className="w-8 h-2 bg-spain-red rounded-full" />
            <div className="w-12 h-2 bg-spain-yellow rounded-full" />
            <div className="w-8 h-2 bg-spain-red rounded-full" />
          </div>

          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
            Tu proceso de inmigración,
            <br />
            <span className="text-brand-200">simplificado en España</span>
          </h1>
          <p className="text-xl text-brand-100 max-w-3xl mx-auto mb-10 leading-relaxed">
            Conectamos a inmigrantes con abogados especializados para gestionar permisos de
            residencia, visados y nacionalidad de forma segura y eficiente.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/auth/signup?role=immigrant"
              className="inline-flex items-center justify-center px-8 py-4 bg-white text-brand-800 font-semibold rounded-xl hover:bg-brand-50 transition-all shadow-lg hover:shadow-xl text-base"
            >
              <Users className="w-5 h-5 mr-2" />
              Soy inmigrante
            </Link>
            <Link
              href="/auth/signup?role=lawyer"
              className="inline-flex items-center justify-center px-8 py-4 bg-brand-600 text-white font-semibold rounded-xl hover:bg-brand-500 transition-all border border-brand-500 text-base"
            >
              <Shield className="w-5 h-5 mr-2" />
              Soy abogado
            </Link>
          </div>

          {/* Stats */}
          <div className="mt-20 grid grid-cols-3 gap-8 max-w-2xl mx-auto">
            {[
              { value: '500+', label: 'Casos gestionados' },
              { value: '50+', label: 'Abogados especializados' },
              { value: '98%', label: 'Satisfacción del cliente' },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-3xl font-bold text-white">{stat.value}</div>
                <div className="text-sm text-brand-200 mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Wave divider */}
        <div className="relative">
          <svg viewBox="0 0 1440 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
            <path d="M0 80L48 69.3C96 59 192 37 288 32C384 27 480 37 576 48C672 59 768 69 864 64C960 59 1056 37 1152 26.7C1248 16 1344 16 1392 16L1440 16V80H1392C1344 80 1248 80 1152 80C1056 80 960 80 864 80C768 80 672 80 576 80C480 80 384 80 288 80C192 80 96 80 48 80H0Z" fill="white"/>
          </svg>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">
              Todo lo que necesitas en un solo lugar
            </h2>
            <p className="text-lg text-slate-500 max-w-2xl mx-auto">
              Nuestra plataforma gestiona cada aspecto del proceso de inmigración con seguridad y transparencia.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: FileText,
                title: 'Gestión documental',
                desc: 'Sube, organiza y comparte documentos de forma segura con tu abogado.',
                color: 'bg-blue-50 text-blue-600',
              },
              {
                icon: Shield,
                title: 'Protección de datos',
                desc: 'Acceso restringido por roles. Los archivos de cada inmigrante son privados.',
                color: 'bg-green-50 text-green-600',
              },
              {
                icon: Globe,
                title: 'Seguimiento en tiempo real',
                desc: 'Consulta el estado de tu expediente en cualquier momento, desde cualquier lugar.',
                color: 'bg-purple-50 text-purple-600',
              },
              {
                icon: Users,
                title: 'Red de abogados expertos',
                desc: 'Accede a profesionales especializados en derecho de extranjería en España.',
                color: 'bg-orange-50 text-orange-600',
              },
              {
                icon: CheckCircle,
                title: 'Proceso guiado',
                desc: 'Te acompañamos en cada paso: visados, NIE, residencia y nacionalidad.',
                color: 'bg-teal-50 text-teal-600',
              },
              {
                icon: Lock,
                title: 'Confidencialidad garantizada',
                desc: 'Solo tu abogado asignado puede ver tus expedientes. Total privacidad.',
                color: 'bg-rose-50 text-rose-600',
              },
            ].map((feature) => (
              <div key={feature.title} className="p-6 rounded-2xl border border-slate-100 hover:border-brand-200 hover:shadow-md transition-all group">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${feature.color} group-hover:scale-110 transition-transform`}>
                  <feature.icon className="w-6 h-6" />
                </div>
                <h3 className="font-semibold text-slate-900 mb-2">{feature.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Cómo funciona</h2>
            <p className="text-lg text-slate-500">En tres pasos sencillos</p>
          </div>

          <div className="grid md:grid-cols-3 gap-12">
            {[
              {
                step: '01',
                title: 'Regístrate',
                desc: 'Crea tu cuenta como inmigrante o abogado. El proceso toma menos de 2 minutos.',
              },
              {
                step: '02',
                title: 'Conecta con tu abogado',
                desc: 'El abogado asignado accede a tu expediente y te contacta para comenzar.',
              },
              {
                step: '03',
                title: 'Gestiona tu caso',
                desc: 'Sigue el estado de tu expediente en tiempo real y comparte documentos de forma segura.',
              },
            ].map((item, idx) => (
              <div key={item.step} className="relative text-center">
                {idx < 2 && (
                  <div className="hidden md:block absolute top-8 left-1/2 w-full h-0.5 bg-brand-200" />
                )}
                <div className="relative inline-flex items-center justify-center w-16 h-16 rounded-full bg-brand-700 text-white font-bold text-xl mb-6 shadow-lg">
                  {item.step}
                </div>
                <h3 className="font-semibold text-xl text-slate-900 mb-3">{item.title}</h3>
                <p className="text-slate-500 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Portals */}
      <section id="portals" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Dos portales, una plataforma</h2>
            <p className="text-lg text-slate-500 max-w-2xl mx-auto">
              Cada usuario accede a su propio espacio privado. Los datos de inmigrantes y abogados están completamente separados.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Immigrant portal */}
            <div className="relative rounded-3xl overflow-hidden border-2 border-brand-100 p-8 hover:border-brand-300 transition-all hover:shadow-xl group">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-brand-600 to-brand-400" />
              <div className="w-14 h-14 rounded-2xl bg-brand-50 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Users className="w-7 h-7 text-brand-700" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-3">Portal del Inmigrante</h3>
              <p className="text-slate-500 mb-6 leading-relaxed">
                Gestiona tu expediente, sube documentos y sigue el progreso de tu caso de inmigración en España.
              </p>
              <ul className="space-y-2 mb-8">
                {['Ver estado de tu caso', 'Subir documentos', 'Comunicarte con tu abogado', 'Historial de notificaciones'].map((item) => (
                  <li key={item} className="flex items-center gap-2 text-sm text-slate-600">
                    <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
              <Link
                href="/auth/signup?role=immigrant"
                className="inline-flex items-center justify-center w-full px-6 py-3 bg-brand-700 text-white font-semibold rounded-xl hover:bg-brand-800 transition-colors"
              >
                Acceder como inmigrante
              </Link>
            </div>

            {/* Lawyer portal */}
            <div className="relative rounded-3xl overflow-hidden border-2 border-slate-100 p-8 hover:border-brand-300 transition-all hover:shadow-xl group bg-slate-900">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-spain-yellow to-spain-red" />
              <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Shield className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">Portal del Abogado</h3>
              <p className="text-slate-300 mb-6 leading-relaxed">
                Gestiona múltiples expedientes, revisa documentos y coordina con tus clientes desde un panel profesional.
              </p>
              <ul className="space-y-2 mb-8">
                {['Panel de expedientes asignados', 'Revisión de documentos', 'Anotaciones privadas por caso', 'Búsqueda entre miles de expedientes'].map((item) => (
                  <li key={item} className="flex items-center gap-2 text-sm text-slate-300">
                    <CheckCircle className="w-4 h-4 text-brand-300 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
              <Link
                href="/auth/signup?role=lawyer"
                className="inline-flex items-center justify-center w-full px-6 py-3 bg-white text-slate-900 font-semibold rounded-xl hover:bg-brand-50 transition-colors"
              >
                Acceder como abogado
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-brand-900">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <div className="flex justify-center gap-1 mb-8">
            <div className="w-6 h-1.5 bg-spain-red rounded-full" />
            <div className="w-10 h-1.5 bg-spain-yellow rounded-full" />
            <div className="w-6 h-1.5 bg-spain-red rounded-full" />
          </div>
          <h2 className="text-4xl font-bold text-white mb-6">
            Comienza hoy mismo
          </h2>
          <p className="text-xl text-brand-200 mb-10">
            Regístrate de forma gratuita y simplifica tu proceso de inmigración en España.
          </p>
          <div className="flex gap-4 justify-center">
            <Link
              href="/auth/signup"
              className="inline-flex items-center justify-center px-8 py-4 bg-white text-brand-800 font-bold rounded-xl hover:bg-brand-50 transition-all shadow-lg text-base"
            >
              Crear cuenta gratis
            </Link>
            <Link
              href="/auth/login"
              className="inline-flex items-center justify-center px-8 py-4 border border-white/30 text-white font-semibold rounded-xl hover:bg-white/10 transition-all text-base"
            >
              Ya tengo cuenta
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-950 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1">
                <div className="w-2.5 h-6 bg-spain-red rounded-sm" />
                <div className="w-2.5 h-6 bg-spain-yellow rounded-sm" />
                <div className="w-2.5 h-6 bg-spain-red rounded-sm" />
              </div>
              <span className="text-white font-semibold">Immigration Platform España</span>
            </div>
            <div className="flex gap-8 text-sm text-slate-400">
              <a href="#" className="hover:text-white transition-colors">Privacidad</a>
              <a href="#" className="hover:text-white transition-colors">Términos de uso</a>
              <a href="#" className="hover:text-white transition-colors">Contacto</a>
            </div>
            <p className="text-slate-500 text-sm">
              © 2026 Immigration Platform. Todos los derechos reservados.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
