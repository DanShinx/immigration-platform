import Link from 'next/link'
import { ArrowLeft, ArrowRight, CheckCircle2, FileStack, RefreshCw, Users } from 'lucide-react'
import LanguageSwitcher from '@/components/LanguageSwitcher'
import { createClient } from '@/lib/supabase/server'
import { getCaseContent } from '@/lib/case-content'
import { getCaseTrackMeta } from '@/lib/cases'
import { resolveLocale } from '@/lib/translations'

export default async function NomadCategoryPage() {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const content = getCaseContent(resolveLocale())
  const cards = [
    { code: 'nomad_holder' as const, icon: FileStack, href: user ? '/immigrant/cases/new?track=nomad_holder' : '/auth/signup?role=immigrant' },
    { code: 'nomad_family' as const, icon: Users, href: user ? '/immigrant/cases/new?track=nomad_family' : '/auth/signup?role=immigrant' },
    { code: 'nomad_renewal' as const, icon: RefreshCw, href: user ? '/immigrant/cases/new?track=nomad_renewal' : '/auth/signup?role=immigrant' },
  ]

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#f8fafc_0%,#ffffff_45%,#f8fafc_100%)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between gap-4">
          <Link href="/" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-brand-700">
            <ArrowLeft className="w-4 h-4" />
            Back
          </Link>
          <LanguageSwitcher />
        </div>

        <section className="mt-10 rounded-[2rem] bg-brand-900 text-white overflow-hidden relative">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.2),transparent_35%)]" />
          <div className="relative px-8 py-14 lg:px-12 lg:py-16">
            <div className="max-w-3xl">
              <div className="inline-flex items-center rounded-full bg-white/10 px-4 py-2 text-sm text-brand-100">
                UGE / International Teleworkers
              </div>
              <h1 className="text-4xl lg:text-5xl font-bold mt-6">{content.nomadPage.title}</h1>
              <p className="text-lg text-brand-100 mt-5 leading-relaxed">
                {content.nomadPage.subtitle}
              </p>
            </div>
          </div>
        </section>

        <section className="mt-10 grid lg:grid-cols-3 gap-5">
          {cards.map((card) => {
            const meta = getCaseTrackMeta(card.code)
            const Icon = card.icon

            return (
              <Link
                key={card.code}
                href={card.href}
                className="rounded-3xl border border-slate-200 bg-white p-6 hover:border-brand-300 hover:shadow-xl transition-all"
              >
                <div className="w-12 h-12 rounded-2xl bg-brand-50 flex items-center justify-center">
                  <Icon className="w-6 h-6 text-brand-700" />
                </div>
                <h2 className="text-xl font-semibold text-slate-900 mt-5">{meta.title}</h2>
                <p className="text-sm text-slate-500 mt-3 leading-relaxed">{meta.description}</p>
                <div className="inline-flex items-center gap-2 mt-5 text-sm font-semibold text-brand-700">
                  {content.nomadPage.cards[card.code]}
                  <ArrowRight className="w-4 h-4" />
                </div>
              </Link>
            )
          })}
        </section>

        <section className="mt-12 rounded-3xl border border-slate-200 bg-white p-8">
          <h2 className="text-2xl font-semibold text-slate-900">{content.nomadPage.summaryTitle}</h2>
          <div className="grid md:grid-cols-3 gap-4 mt-6">
            {content.nomadPage.summaryBullets.map((item) => (
              <div key={item} className="rounded-2xl bg-slate-50 p-5 text-sm text-slate-600 leading-relaxed">
                {item}
              </div>
            ))}
          </div>
        </section>

        <section className="mt-8 grid xl:grid-cols-3 gap-5">
          {[
            { title: content.nomadPage.holderTitle, items: content.nomadPage.holderBullets },
            { title: content.nomadPage.familyTitle, items: content.nomadPage.familyBullets },
            { title: content.nomadPage.renewalTitle, items: content.nomadPage.renewalBullets },
          ].map((section) => (
            <div key={section.title} className="rounded-3xl border border-slate-200 bg-white p-6">
              <h3 className="text-xl font-semibold text-slate-900">{section.title}</h3>
              <div className="space-y-4 mt-5">
                {section.items.map((item) => (
                  <div key={item} className="flex gap-3">
                    <CheckCircle2 className="w-4 h-4 text-green-600 mt-1 flex-shrink-0" />
                    <p className="text-sm text-slate-600 leading-relaxed">{item}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </section>

        <section className="mt-8 rounded-3xl border border-slate-200 bg-white p-8">
          <h2 className="text-2xl font-semibold text-slate-900">{content.nomadPage.faqTitle}</h2>
          <div className="grid md:grid-cols-3 gap-4 mt-6">
            {content.nomadPage.faqBullets.map((item) => (
              <div key={item} className="rounded-2xl bg-slate-50 p-5 text-sm text-slate-600 leading-relaxed">
                {item}
              </div>
            ))}
          </div>
        </section>

        <section className="mt-8 rounded-3xl border border-slate-200 bg-white p-8">
          <h2 className="text-2xl font-semibold text-slate-900">Official sources</h2>
          <div className="grid md:grid-cols-2 gap-3 mt-6 text-sm">
            <a className="rounded-2xl border border-slate-200 px-4 py-3 hover:border-brand-300 hover:bg-brand-50" href={content.nomadPage.sources.categories} target="_blank" rel="noreferrer">UGE categories</a>
            <a className="rounded-2xl border border-slate-200 px-4 py-3 hover:border-brand-300 hover:bg-brand-50" href={content.nomadPage.sources.nomadFaq} target="_blank" rel="noreferrer">Teleworker FAQ</a>
            <a className="rounded-2xl border border-slate-200 px-4 py-3 hover:border-brand-300 hover:bg-brand-50" href={content.nomadPage.sources.nomadHolder} target="_blank" rel="noreferrer">Nomad holder requirements</a>
            <a className="rounded-2xl border border-slate-200 px-4 py-3 hover:border-brand-300 hover:bg-brand-50" href={content.nomadPage.sources.nomadFamily} target="_blank" rel="noreferrer">Nomad family requirements</a>
            <a className="rounded-2xl border border-slate-200 px-4 py-3 hover:border-brand-300 hover:bg-brand-50 md:col-span-2" href={content.nomadPage.sources.orientation} target="_blank" rel="noreferrer">Orientation and renewal documentation</a>
          </div>
        </section>
      </div>
    </div>
  )
}
