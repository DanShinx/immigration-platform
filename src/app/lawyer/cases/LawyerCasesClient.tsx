'use client'

import Link from 'next/link'
import { ArrowRight, Briefcase } from 'lucide-react'
import { useI18n } from '@/components/LanguageProvider'
import { getCaseContent } from '@/lib/case-content'
import { getCaseStageMeta, getCaseTrackMeta } from '@/lib/cases'
import { formatDate } from '@/lib/utils'
import type { CaseRecord } from '@/types'

interface Props {
  cases: (CaseRecord & {
    immigrantName?: string | null
    immigrantEmail?: string | null
  })[]
}

export default function LawyerCasesClient({ cases }: Props) {
  const { locale } = useI18n()
  const copy = getCaseContent(locale)

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">{copy.lawyerCases.title}</h1>
        <p className="text-slate-500 mt-1">{copy.lawyerCases.subtitle}</p>
      </div>

      {cases.length === 0 ? (
        <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center">
          <Briefcase className="w-10 h-10 text-slate-200 mx-auto mb-4" />
          <p className="text-slate-500 font-medium">{copy.lawyerCases.empty}</p>
        </div>
      ) : (
        <div className="grid xl:grid-cols-2 gap-5">
          {cases.map((caseItem) => {
            const stage = getCaseStageMeta(caseItem.stage, locale)
            const track = getCaseTrackMeta(caseItem.track_code, locale)

            return (
              <div key={caseItem.id} className="rounded-3xl border border-slate-200 bg-white p-6">
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${stage.color}`}>
                    {stage.label}
                  </span>
                  <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                    {track.shortTitle}
                  </span>
                </div>
                <h2 className="text-xl font-semibold text-slate-900 mt-5">{caseItem.title}</h2>
                <p className="text-sm text-slate-500 mt-2 leading-relaxed">
                  {caseItem.summary || track.description}
                </p>

                <div className="grid sm:grid-cols-2 gap-4 mt-6 text-sm">
                  <div className="rounded-2xl bg-slate-50 p-4">
                    <div className="text-slate-400">{copy.lawyerCases.caseOwner}</div>
                    <div className="font-medium text-slate-900 mt-1">{caseItem.immigrantName || '—'}</div>
                    {caseItem.immigrantEmail ? (
                      <div className="text-slate-500 mt-1">{caseItem.immigrantEmail}</div>
                    ) : null}
                  </div>
                  <div className="rounded-2xl bg-slate-50 p-4">
                    <div className="text-slate-400">{copy.lawyerCases.opened}</div>
                    <div className="font-medium text-slate-900 mt-1">{formatDate(caseItem.created_at, locale)}</div>
                  </div>
                </div>

                <Link
                  href={`/lawyer/cases/${caseItem.id}`}
                  className="inline-flex items-center gap-2 mt-6 text-sm font-semibold text-brand-700"
                >
                  {copy.lawyerCases.viewCase}
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
