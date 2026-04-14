'use client'

import Link from 'next/link'
import { Shield, Users, FileText, CheckCircle, Globe, Lock } from 'lucide-react'
import LanguageSwitcher from '@/components/LanguageSwitcher'
import { useI18n } from '@/components/LanguageProvider'

const featureIcons = [FileText, Shield, Globe, Users, CheckCircle, Lock]

export default function HomePage() {
  const { messages } = useI18n()
  const t = messages.home

  const featureColors = [
    'bg-blue-50 text-blue-600',
    'bg-green-50 text-green-600',
    'bg-purple-50 text-purple-600',
    'bg-orange-50 text-orange-600',
    'bg-teal-50 text-teal-600',
    'bg-rose-50 text-rose-600',
  ]

  return (
    <div className="min-h-screen bg-white">
      <nav className="fixed top-0 w-full z-50 bg-white/95 backdrop-blur-sm border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1">
                <div className="w-3 h-8 bg-spain-red rounded-sm" />
                <div className="w-3 h-8 bg-spain-yellow rounded-sm" />
                <div className="w-3 h-8 bg-spain-red rounded-sm" />
              </div>
              <div>
                <span className="font-bold text-brand-900 text-lg leading-tight block">
                  {messages.shared.appName}
                </span>
                <span className="text-xs text-slate-500 font-medium tracking-wide uppercase">
                  {messages.shared.appNameSpain.split(' ').pop()}
                </span>
              </div>
            </div>

            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-sm text-slate-600 hover:text-brand-700 font-medium transition-colors">
                {t.nav.features}
              </a>
              <a href="#how-it-works" className="text-sm text-slate-600 hover:text-brand-700 font-medium transition-colors">
                {t.nav.howItWorks}
              </a>
              <a href="#portals" className="text-sm text-slate-600 hover:text-brand-700 font-medium transition-colors">
                {t.nav.portals}
              </a>
            </div>

            <div className="flex items-center gap-3">
              <LanguageSwitcher className="hidden sm:inline-flex" />
              <Link
                href="/auth/login"
                className="text-sm font-medium text-brand-700 hover:text-brand-900 transition-colors"
              >
                {messages.shared.actions.login}
              </Link>
              <Link
                href="/auth/signup"
                className="inline-flex items-center px-4 py-2 bg-brand-700 hover:bg-brand-800 text-white text-sm font-medium rounded-lg transition-colors shadow-sm"
              >
                {messages.shared.actions.signup}
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <section className="pt-16 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-900 via-brand-800 to-brand-700" />
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-72 h-72 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-brand-300 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-28 text-center">
          <div className="flex justify-center gap-1 mb-8">
            <div className="w-8 h-2 bg-spain-red rounded-full" />
            <div className="w-12 h-2 bg-spain-yellow rounded-full" />
            <div className="w-8 h-2 bg-spain-red rounded-full" />
          </div>

          <div className="sm:hidden flex justify-center mb-6">
            <LanguageSwitcher />
          </div>

          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
            {t.hero.titleLine1}
            <br />
            <span className="text-brand-200">{t.hero.titleHighlight}</span>
          </h1>
          <p className="text-xl text-brand-100 max-w-3xl mx-auto mb-10 leading-relaxed">
            {t.hero.subtitle}
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/auth/signup?role=immigrant"
              className="inline-flex items-center justify-center px-8 py-4 bg-white text-brand-800 font-semibold rounded-xl hover:bg-brand-50 transition-all shadow-lg hover:shadow-xl text-base"
            >
              <Users className="w-5 h-5 mr-2" />
              {t.hero.immigrantCta}
            </Link>
            <Link
              href="/auth/signup?role=lawyer"
              className="inline-flex items-center justify-center px-8 py-4 bg-brand-600 text-white font-semibold rounded-xl hover:bg-brand-500 transition-all border border-brand-500 text-base"
            >
              <Shield className="w-5 h-5 mr-2" />
              {t.hero.lawyerCta}
            </Link>
          </div>

          <div className="mt-20 grid grid-cols-3 gap-8 max-w-2xl mx-auto">
            {t.stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-3xl font-bold text-white">{stat.value}</div>
                <div className="text-sm text-brand-200 mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="relative">
          <svg viewBox="0 0 1440 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
            <path d="M0 80L48 69.3C96 59 192 37 288 32C384 27 480 37 576 48C672 59 768 69 864 64C960 59 1056 37 1152 26.7C1248 16 1344 16 1392 16L1440 16V80H1392C1344 80 1248 80 1152 80C1056 80 960 80 864 80C768 80 672 80 576 80C480 80 384 80 288 80C192 80 96 80 48 80H0Z" fill="white"/>
          </svg>
        </div>
      </section>

      <section id="features" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">
              {t.features.title}
            </h2>
            <p className="text-lg text-slate-500 max-w-2xl mx-auto">
              {t.features.subtitle}
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {t.features.items.map((feature, index) => {
              const Icon = featureIcons[index]
              return (
                <div key={feature.title} className="p-6 rounded-2xl border border-slate-100 hover:border-brand-200 hover:shadow-md transition-all group">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${featureColors[index]} group-hover:scale-110 transition-transform`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="font-semibold text-slate-900 mb-2">{feature.title}</h3>
                  <p className="text-sm text-slate-500 leading-relaxed">{feature.desc}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      <section id="how-it-works" className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">{t.howItWorks.title}</h2>
            <p className="text-lg text-slate-500">{t.howItWorks.subtitle}</p>
          </div>

          <div className="grid md:grid-cols-3 gap-12">
            {t.howItWorks.steps.map((item, idx) => (
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

      <section id="portals" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">{t.portals.title}</h2>
            <p className="text-lg text-slate-500 max-w-2xl mx-auto">
              {t.portals.subtitle}
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="relative rounded-3xl overflow-hidden border-2 border-brand-100 p-8 hover:border-brand-300 transition-all hover:shadow-xl group">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-brand-600 to-brand-400" />
              <div className="w-14 h-14 rounded-2xl bg-brand-50 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Users className="w-7 h-7 text-brand-700" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-3">{t.portals.immigrant.title}</h3>
              <p className="text-slate-500 mb-6 leading-relaxed">
                {t.portals.immigrant.desc}
              </p>
              <ul className="space-y-2 mb-8">
                {t.portals.immigrant.bullets.map((item) => (
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
                {t.portals.immigrant.cta}
              </Link>
            </div>

            <div className="relative rounded-3xl overflow-hidden border-2 border-slate-100 p-8 hover:border-brand-300 transition-all hover:shadow-xl group bg-slate-900">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-spain-yellow to-spain-red" />
              <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Shield className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">{t.portals.lawyer.title}</h3>
              <p className="text-slate-300 mb-6 leading-relaxed">
                {t.portals.lawyer.desc}
              </p>
              <ul className="space-y-2 mb-8">
                {t.portals.lawyer.bullets.map((item) => (
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
                {t.portals.lawyer.cta}
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="py-24 bg-brand-900">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <div className="flex justify-center gap-1 mb-8">
            <div className="w-6 h-1.5 bg-spain-red rounded-full" />
            <div className="w-10 h-1.5 bg-spain-yellow rounded-full" />
            <div className="w-6 h-1.5 bg-spain-red rounded-full" />
          </div>
          <h2 className="text-4xl font-bold text-white mb-6">
            {t.cta.title}
          </h2>
          <p className="text-xl text-brand-200 mb-10">
            {t.cta.subtitle}
          </p>
          <div className="flex gap-4 justify-center">
            <Link
              href="/auth/signup"
              className="inline-flex items-center justify-center px-8 py-4 bg-white text-brand-800 font-bold rounded-xl hover:bg-brand-50 transition-all shadow-lg text-base"
            >
              {t.cta.signup}
            </Link>
            <Link
              href="/auth/login"
              className="inline-flex items-center justify-center px-8 py-4 border border-white/30 text-white font-semibold rounded-xl hover:bg-white/10 transition-all text-base"
            >
              {t.cta.login}
            </Link>
          </div>
        </div>
      </section>

      <footer className="bg-slate-950 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1">
                <div className="w-2.5 h-6 bg-spain-red rounded-sm" />
                <div className="w-2.5 h-6 bg-spain-yellow rounded-sm" />
                <div className="w-2.5 h-6 bg-spain-red rounded-sm" />
              </div>
              <span className="text-white font-semibold">{messages.shared.appNameSpain}</span>
            </div>
            <div className="flex gap-8 text-sm text-slate-400">
              <a href="#" className="hover:text-white transition-colors">{t.footer.privacy}</a>
              <a href="#" className="hover:text-white transition-colors">{t.footer.terms}</a>
              <a href="#" className="hover:text-white transition-colors">{t.footer.contact}</a>
            </div>
            <p className="text-slate-500 text-sm">
              {t.footer.rights}
            </p>
          </div>
          <div className="mt-8 flex justify-center">
            <Link
              href="/auth/login"
              className="text-slate-700 hover:text-slate-500 transition-colors"
              title="Admin"
            >
              <Lock className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
