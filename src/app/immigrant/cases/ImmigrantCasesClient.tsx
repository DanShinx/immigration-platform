'use client'

import Link from 'next/link'
import { ArrowRight, Briefcase, Clock3, FolderOpen, PlusCircle } from 'lucide-react'
import { useI18n } from '@/components/LanguageProvider'
import { getCaseContent } from '@/lib/case-content'
import { getCaseStageMeta, getCaseTrackMeta, isCaseActive } from '@/lib/cases'
import { formatDate } from '@/lib/utils'
import type { CaseRecord } from '@/types'

interface CaseWithLawyer extends CaseRecord {
  lawyerName?: string | null
}

interface Props {
  cases: CaseWithLawyer[]
}

export default function ImmigrantCasesClient({ cases }: Props) {
  const { locale } = useI18n()
  const copy = getCaseContent(locale)

  const activeCases = cases.filter((caseItem) => isCaseActive(caseItem))
  const archivedCases = cases.filter((caseItem) => !isCaseActive(caseItem))

  function renderCaseCard(caseItem: CaseWithLawyer) {
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

        <h3 className="text-xl font-semibold text-slate-900 mt-5">{caseItem.title}</h3>
        <p className="text-sm text-slate-500 mt-2 leading-relaxed">
          {caseItem.summary || track.description}
        </p>

        <div className="grid sm:grid-cols-2 gap-4 mt-6 text-sm">
          <div className="rounded-2xl bg-slate-50 p-4">
            <div className="text-slate-400">{copy.immigrantCases.relatedTo}</div>
            <div className="font-medium text-slate-900 mt-1">
              {caseItem.linked_primary_case_id ? caseItem.linked_primary_case_id.slice(0, 8).toUpperCase() : '—'}
            </div>
          </div>
          <div className="rounded-2xl bg-slate-50 p-4">
            <div className="text-slate-400">{copy.caseDetail.lawyer}</div>
            <div className="font-medium text-slate-900 mt-1">
              {caseItem.lawyerName || copy.immigrantCases.lawyerPending}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between mt-6 text-sm text-slate-500">
          <span>{copy.lawyerCases.opened}: {formatDate(caseItem.created_at, locale)}</span>
          <Link
            href={`/immigrant/cases/${caseItem.id}`}
            className="inline-flex items-center gap-2 font-semibold text-brand-700"
          >
            {copy.immigrantCases.viewCase}
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{copy.immigrantCases.title}</h1>
          <p className="text-slate-500 mt-1">{copy.immigrantCases.subtitle}</p>
        </div>
        <Link
          href="/immigrant/cases/new"
          className="inline-flex items-center justify-center gap-2 rounded-2xl bg-brand-700 px-5 py-3 text-sm font-semibold text-white hover:bg-brand-800"
        >
          <PlusCircle className="w-4 h-4" />
          {copy.immigrantCases.openNew}
        </Link>
      </div>

      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <Clock3 className="w-4 h-4 text-brand-600" />
          <h2 className="font-semibold text-slate-900">{copy.immigrantCases.activeSection}</h2>
        </div>

        {activeCases.length === 0 ? (
          <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center">
            <Briefcase className="w-10 h-10 text-slate-200 mx-auto mb-4" />
            <p className="font-medium text-slate-900">{copy.immigrantCases.emptyActive}</p>
          </div>
        ) : (
          <div className="grid xl:grid-cols-2 gap-5">
            {activeCases.map(renderCaseCard)}
          </div>
        )}
      </section>

      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <FolderOpen className="w-4 h-4 text-slate-500" />
          <h2 className="font-semibold text-slate-900">{copy.immigrantCases.archivedSection}</h2>
        </div>

        {archivedCases.length === 0 ? (
          <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center">
            <FolderOpen className="w-10 h-10 text-slate-200 mx-auto mb-4" />
            <p className="font-medium text-slate-900">{copy.immigrantCases.emptyArchived}</p>
          </div>
        ) : (
          <div className="grid xl:grid-cols-2 gap-5">
            {archivedCases.map(renderCaseCard)}
          </div>
        )}
      </section>
    </div>
  )
}
