'use client'

import Link from 'next/link'
import { ArrowRight, Briefcase, Clock3, FileText, PlusCircle, Shield } from 'lucide-react'
import { useI18n } from '@/components/LanguageProvider'
import { getCaseContent } from '@/lib/case-content'
import { getCaseStageMeta, getCaseTrackMeta, isCaseActive } from '@/lib/cases'
import { formatDate } from '@/lib/utils'
import type { CaseDocument, CaseRecord } from '@/types'

interface Props {
  cases: (CaseRecord & { lawyerName?: string | null })[]
  recentDocuments: CaseDocument[]
  pendingRequest: { caseId: string; lawyerName?: string | null } | null
  userName: string
}

export default function ImmigrantDashboardClient({
  cases,
  recentDocuments,
  pendingRequest,
  userName,
}: Props) {
  const { locale } = useI18n()
  const copy = getCaseContent(locale)
  const activeCases = cases.filter((caseItem) => isCaseActive(caseItem))
  const pastCases = cases.filter((caseItem) => !isCaseActive(caseItem))
  const primaryCase = activeCases[0] || cases[0] || null
  const primaryStage = primaryCase ? getCaseStageMeta(primaryCase.stage, locale) : null
  const primaryTrack = primaryCase ? getCaseTrackMeta(primaryCase.track_code, locale) : null

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">
          {copy.immigrantDashboard.title}, {userName.split(' ')[0]}
        </h1>
        <p className="text-slate-500 mt-1">{copy.immigrantDashboard.subtitle}</p>
      </div>

      {primaryCase ? (
        <div className="rounded-3xl border border-slate-200 bg-white p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                {primaryStage && (
                  <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${primaryStage.color}`}>
                    {primaryStage.label}
                  </span>
                )}
                {primaryTrack && (
                  <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                    {primaryTrack.shortTitle}
                  </span>
                )}
              </div>
              <h2 className="text-xl font-semibold text-slate-900 mt-4">{primaryCase.title}</h2>
              <p className="text-sm text-slate-500 mt-2">
                {primaryCase.summary || primaryTrack?.description}
              </p>
            </div>
            <Link
              href={`/immigrant/cases/${primaryCase.id}`}
              className="inline-flex items-center gap-2 text-sm font-semibold text-brand-700"
            >
              {copy.immigrantDashboard.openCases}
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      ) : (
        <div className="rounded-3xl border border-brand-200 bg-brand-50 p-6">
          <h2 className="font-semibold text-brand-900">{copy.immigrantDashboard.noCases}</h2>
          <p className="text-sm text-brand-700 mt-2">{copy.immigrantDashboard.noCasesBody}</p>
        </div>
      )}

      <div className="grid md:grid-cols-4 gap-5">
        <div className="rounded-3xl border border-slate-200 bg-white p-6">
          <div className="text-sm text-slate-500">{copy.immigrantDashboard.activeCases}</div>
          <div className="text-3xl font-bold text-slate-900 mt-2">{activeCases.length}</div>
        </div>
        <div className="rounded-3xl border border-slate-200 bg-white p-6">
          <div className="text-sm text-slate-500">{copy.immigrantDashboard.pastCases}</div>
          <div className="text-3xl font-bold text-slate-900 mt-2">{pastCases.length}</div>
        </div>
        <div className="rounded-3xl border border-slate-200 bg-white p-6">
          <div className="text-sm text-slate-500">{copy.immigrantDashboard.documents}</div>
          <div className="text-3xl font-bold text-slate-900 mt-2">{recentDocuments.length}</div>
        </div>
        <div className="rounded-3xl border border-slate-200 bg-white p-6">
          <div className="text-sm text-slate-500">{copy.immigrantDashboard.pendingRequest}</div>
          <div className="text-lg font-semibold text-slate-900 mt-2">
            {pendingRequest?.lawyerName || '—'}
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-5">
        {[
          {
            href: '/immigrant/cases/new',
            icon: PlusCircle,
            title: copy.immigrantDashboard.startNewCase,
            body: copy.immigrantDashboard.noCasesBody,
          },
          {
            href: '/immigrant/cases',
            icon: Briefcase,
            title: copy.immigrantDashboard.openCases,
            body: copy.immigrantCases.subtitle,
          },
          {
            href: primaryCase ? `/immigrant/documents?case=${primaryCase.id}` : '/immigrant/documents',
            icon: FileText,
            title: copy.immigrantDashboard.documents,
            body: recentDocuments[0]
              ? formatDate(recentDocuments[0].uploaded_at, locale)
              : copy.caseDetail.noDocuments,
          },
        ].map((action) => (
          <Link
            key={action.href}
            href={action.href}
            className="rounded-3xl border border-slate-200 bg-white p-6 hover:border-brand-300 hover:shadow-lg transition-all"
          >
            <action.icon className="w-5 h-5 text-brand-700" />
            <div className="font-semibold text-slate-900 mt-4">{action.title}</div>
            <div className="text-sm text-slate-500 mt-2 leading-relaxed">{action.body}</div>
          </Link>
        ))}
      </div>

      <div className="grid xl:grid-cols-[1fr,0.95fr] gap-6">
        <div className="rounded-3xl border border-slate-200 bg-white p-6">
          <div className="flex items-center gap-2">
            <Clock3 className="w-4 h-4 text-brand-600" />
            <h2 className="font-semibold text-slate-900">{copy.immigrantDashboard.activeCases}</h2>
          </div>
          {activeCases.length === 0 ? (
            <p className="text-sm text-slate-500 mt-5">{copy.immigrantCases.emptyActive}</p>
          ) : (
            <div className="space-y-4 mt-5">
              {activeCases.slice(0, 3).map((caseItem) => {
                const stage = getCaseStageMeta(caseItem.stage, locale)
                const track = getCaseTrackMeta(caseItem.track_code, locale)
                return (
                  <Link
                    key={caseItem.id}
                    href={`/immigrant/cases/${caseItem.id}`}
                    className="block rounded-2xl bg-slate-50 p-4"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <div className="font-medium text-slate-900">{caseItem.title}</div>
                        <div className="text-sm text-slate-500 mt-1">{track.shortTitle}</div>
                      </div>
                      <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${stage.color}`}>
                        {stage.label}
                      </span>
                    </div>
                  </Link>
                )
              })}
            </div>
          )}
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-brand-600" />
            <h2 className="font-semibold text-slate-900">Recent documents</h2>
          </div>
          {recentDocuments.length === 0 ? (
            <p className="text-sm text-slate-500 mt-5">{copy.caseDetail.noDocuments}</p>
          ) : (
            <div className="space-y-4 mt-5">
              {recentDocuments.slice(0, 4).map((document) => (
                <div key={document.id} className="rounded-2xl bg-slate-50 p-4">
                  <div className="font-medium text-slate-900">{document.file_name}</div>
                  <div className="text-sm text-slate-500 mt-1">{formatDate(document.uploaded_at, locale)}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
