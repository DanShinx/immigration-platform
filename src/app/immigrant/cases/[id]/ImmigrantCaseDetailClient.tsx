'use client'

import Link from 'next/link'
import { CreditCard, FileText, FolderTree, Shield, TimerReset, Upload } from 'lucide-react'
import { useI18n } from '@/components/LanguageProvider'
import { getCaseContent } from '@/lib/case-content'
import {
  getCaseStageMeta,
  getCaseTrackMeta,
  getPaymentMilestoneLabel,
  getPaymentStatusLabel,
} from '@/lib/cases'
import { getDocumentTypeLabel } from '@/lib/documents'
import { formatDate } from '@/lib/utils'
import type { CaseDocument, CaseEvent, CasePayment, CaseRecord } from '@/types'

interface Props {
  caseItem: CaseRecord
  lawyer: { full_name: string; email: string } | null
  documents: CaseDocument[]
  payments: CasePayment[]
  events: CaseEvent[]
}

export default function ImmigrantCaseDetailClient({
  caseItem,
  lawyer,
  documents,
  payments,
  events,
}: Props) {
  const { locale } = useI18n()
  const copy = getCaseContent(locale)
  const stage = getCaseStageMeta(caseItem.stage, locale)
  const track = getCaseTrackMeta(caseItem.track_code, locale)

  return (
    <div className="space-y-8">
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${stage.color}`}>
              {stage.label}
            </span>
            <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
              {track.shortTitle}
            </span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mt-4">{caseItem.title}</h1>
          <p className="text-slate-500 mt-2 leading-relaxed">
            {caseItem.summary || track.description}
          </p>
        </div>
        <div className="flex gap-3">
          <Link
            href={`/immigrant/documents?case=${caseItem.id}`}
            className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            <Upload className="w-4 h-4" />
            {copy.caseDetail.documents}
          </Link>
          <Link
            href={`/immigrant/lawyers?case=${caseItem.id}`}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-brand-700 px-5 py-3 text-sm font-semibold text-white hover:bg-brand-800"
          >
            <Shield className="w-4 h-4" />
            {copy.caseDetail.requestLawyer}
          </Link>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-5">
        <div className="rounded-3xl border border-slate-200 bg-white p-6">
          <div className="text-sm text-slate-400">Opened</div>
          <div className="font-semibold text-slate-900 mt-2">{formatDate(caseItem.created_at, locale)}</div>
        </div>
        <div className="rounded-3xl border border-slate-200 bg-white p-6">
          <div className="text-sm text-slate-400">Lawyer</div>
          <div className="font-semibold text-slate-900 mt-2">
            {lawyer?.full_name || copy.caseDetail.noLawyer}
          </div>
          {lawyer?.email ? <div className="text-sm text-slate-500 mt-1">{lawyer.email}</div> : null}
        </div>
        <div className="rounded-3xl border border-slate-200 bg-white p-6">
          <div className="text-sm text-slate-400">{copy.caseDetail.relatedCase}</div>
          <div className="font-semibold text-slate-900 mt-2">
            {caseItem.linked_primary_case_id ? caseItem.linked_primary_case_id.slice(0, 8).toUpperCase() : '—'}
          </div>
        </div>
      </div>

      <div className="grid xl:grid-cols-[1.05fr,0.95fr] gap-6">
        <div className="rounded-3xl border border-slate-200 bg-white p-6">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-brand-600" />
            <h2 className="font-semibold text-slate-900">{copy.caseDetail.documents}</h2>
          </div>
          {documents.length === 0 ? (
            <p className="text-sm text-slate-500 mt-5">{copy.caseDetail.noDocuments}</p>
          ) : (
            <div className="space-y-4 mt-5">
              {documents.map((document) => (
                <div key={document.id} className="rounded-2xl bg-slate-50 p-4">
                  <div className="font-medium text-slate-900">{document.file_name}</div>
                  <div className="text-sm text-slate-500 mt-1">
                    {getDocumentTypeLabel(document.document_type, locale)} · {formatDate(document.uploaded_at, locale)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="rounded-3xl border border-slate-200 bg-white p-6">
            <div className="flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-brand-600" />
              <h2 className="font-semibold text-slate-900">{copy.caseDetail.payments}</h2>
            </div>
            {payments.length === 0 ? (
              <p className="text-sm text-slate-500 mt-5">{copy.caseDetail.noPayments}</p>
            ) : (
              <div className="space-y-3 mt-5">
                {payments.map((payment) => (
                  <div key={payment.id} className="rounded-2xl bg-slate-50 p-4">
                    <div className="font-medium text-slate-900">
                      {payment.label || getPaymentMilestoneLabel(payment.milestone_type, locale)}
                    </div>
                    <div className="text-sm text-slate-500 mt-1">
                      {getPaymentStatusLabel(payment.status, locale)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6">
            <div className="flex items-center gap-2">
              <TimerReset className="w-4 h-4 text-brand-600" />
              <h2 className="font-semibold text-slate-900">{copy.caseDetail.timeline}</h2>
            </div>
            {events.length === 0 ? (
              <p className="text-sm text-slate-500 mt-5">{copy.caseDetail.noEvents}</p>
            ) : (
              <div className="space-y-3 mt-5">
                {events.map((event) => (
                  <div key={event.id} className="rounded-2xl bg-slate-50 p-4">
                    <div className="font-medium text-slate-900">{event.title}</div>
                    <div className="text-sm text-slate-500 mt-1">{event.description || event.event_type}</div>
                    <div className="text-xs text-slate-400 mt-2">{formatDate(event.created_at, locale)}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {(caseItem.source_case_id || caseItem.linked_primary_case_id) && (
        <div className="rounded-3xl border border-slate-200 bg-white p-6">
          <div className="flex items-center gap-2">
            <FolderTree className="w-4 h-4 text-brand-600" />
            <h2 className="font-semibold text-slate-900">Linked history</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-4 mt-5 text-sm">
            <div className="rounded-2xl bg-slate-50 p-4">
              <div className="text-slate-400">{copy.caseDetail.sourceCase}</div>
              <div className="font-medium text-slate-900 mt-1">
                {caseItem.source_case_id ? caseItem.source_case_id.slice(0, 8).toUpperCase() : '—'}
              </div>
            </div>
            <div className="rounded-2xl bg-slate-50 p-4">
              <div className="text-slate-400">{copy.caseDetail.relatedCase}</div>
              <div className="font-medium text-slate-900 mt-1">
                {caseItem.linked_primary_case_id ? caseItem.linked_primary_case_id.slice(0, 8).toUpperCase() : '—'}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
