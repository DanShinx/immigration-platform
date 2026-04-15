'use client'

import Link from 'next/link'
import { ArrowLeft, CreditCard, FileText, MessageSquare, TimerReset, User } from 'lucide-react'
import { useI18n } from '@/components/LanguageProvider'
import { getCaseContent } from '@/lib/case-content'
import { caseStageValues, getCaseStageMeta, getCaseTrackMeta, getPaymentMilestoneLabel, getPaymentStatusLabel } from '@/lib/cases'
import { getDocumentTypeLabel } from '@/lib/documents'
import { formatDate } from '@/lib/utils'
import type { CaseDocument, CaseEvent, CaseNote, CasePayment, CaseRecord } from '@/types'

interface Props {
  caseItem: CaseRecord
  immigrant: {
    full_name: string
    email: string
    nationality: string
    phone?: string | null
    passport_number?: string | null
    date_of_birth?: string | null
    address_in_spain?: string | null
  } | null
  lawyer: {
    user_id: string
    full_name: string
    email: string
    license_number: string
    specialization?: string | null
  } | null
  documents: CaseDocument[]
  payments: CasePayment[]
  events: CaseEvent[]
  notes: CaseNote[]
}

export default function AdminCaseDetailClient({
  caseItem,
  immigrant,
  lawyer,
  documents,
  payments,
  events,
  notes,
}: Props) {
  const { locale, messages } = useI18n()
  const copy = getCaseContent(locale)
  const t = messages.admin.cases.detail
  const stage = getCaseStageMeta(caseItem.stage, locale)
  const track = getCaseTrackMeta(caseItem.track_code, locale)

  return (
    <div className="space-y-8">
      <div>
        <Link
          href="/admin/cases"
          className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          {t.back}
        </Link>

        <div className="flex flex-wrap items-center gap-2 mt-2">
          <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${stage.color}`}>
            {stage.label}
          </span>
          <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
            {track.shortTitle}
          </span>
          <span className="text-xs text-slate-400 font-mono">{caseItem.id.slice(0, 8).toUpperCase()}</span>
        </div>

        <h1 className="text-2xl font-bold text-slate-900 mt-4">{caseItem.title}</h1>
        {caseItem.summary && (
          <p className="text-slate-500 mt-2 leading-relaxed">{caseItem.summary}</p>
        )}
      </div>

      <div className="grid lg:grid-cols-2 gap-5">
        <div className="rounded-3xl border border-slate-200 bg-white p-6">
          <div className="flex items-center gap-2 mb-5">
            <User className="w-4 h-4 text-brand-600" />
            <h2 className="font-semibold text-slate-900">{t.immigrant}</h2>
          </div>
          {immigrant ? (
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-slate-400">{t.name}</dt>
                <dd className="font-medium text-slate-900">{immigrant.full_name}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-slate-400">{t.email}</dt>
                <dd className="text-slate-700">{immigrant.email}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-slate-400">{t.nationality}</dt>
                <dd className="text-slate-700">{immigrant.nationality}</dd>
              </div>
              {immigrant.phone && (
                <div className="flex justify-between">
                  <dt className="text-slate-400">{t.phone}</dt>
                  <dd className="text-slate-700">{immigrant.phone}</dd>
                </div>
              )}
              {immigrant.passport_number && (
                <div className="flex justify-between">
                  <dt className="text-slate-400">{t.passport}</dt>
                  <dd className="text-slate-700 font-mono">{immigrant.passport_number}</dd>
                </div>
              )}
              {immigrant.date_of_birth && (
                <div className="flex justify-between">
                  <dt className="text-slate-400">{t.birthDate}</dt>
                  <dd className="text-slate-700">{immigrant.date_of_birth}</dd>
                </div>
              )}
            </dl>
          ) : (
            <p className="text-sm text-slate-400">{t.noImmigrant}</p>
          )}
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6">
          <div className="flex items-center gap-2 mb-5">
            <User className="w-4 h-4 text-brand-600" />
            <h2 className="font-semibold text-slate-900">{t.lawyer}</h2>
          </div>
          {lawyer ? (
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-slate-400">{t.name}</dt>
                <dd className="font-medium text-slate-900">{lawyer.full_name}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-slate-400">{t.email}</dt>
                <dd className="text-slate-700">{lawyer.email}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-slate-400">{t.license}</dt>
                <dd className="text-slate-700 font-mono">{lawyer.license_number}</dd>
              </div>
              {lawyer.specialization && (
                <div className="flex justify-between">
                  <dt className="text-slate-400">{t.specialization}</dt>
                  <dd className="text-slate-700">{lawyer.specialization}</dd>
                </div>
              )}
            </dl>
          ) : (
            <p className="text-sm text-slate-400">{copy.caseDetail.noLawyer}</p>
          )}
        </div>
      </div>

      <div className="grid xl:grid-cols-[1fr,1fr] gap-6">
        <div className="rounded-3xl border border-slate-200 bg-white p-6">
          <div className="flex items-center gap-2 mb-5">
            <FileText className="w-4 h-4 text-brand-600" />
            <h2 className="font-semibold text-slate-900">{copy.caseDetail.documents}</h2>
            <span className="ml-auto text-xs text-slate-400">{documents.length}</span>
          </div>
          {documents.length === 0 ? (
            <p className="text-sm text-slate-400">{copy.caseDetail.noDocuments}</p>
          ) : (
            <div className="space-y-3">
              {documents.map((doc) => (
                <div key={doc.id} className="rounded-2xl bg-slate-50 p-4">
                  <div className="font-medium text-slate-900 text-sm truncate">{doc.file_name}</div>
                  <div className="text-xs text-slate-400 mt-1">
                    {getDocumentTypeLabel(doc.document_type, locale)} · {formatDate(doc.uploaded_at, locale)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="rounded-3xl border border-slate-200 bg-white p-6">
            <div className="flex items-center gap-2 mb-5">
              <CreditCard className="w-4 h-4 text-brand-600" />
              <h2 className="font-semibold text-slate-900">{copy.caseDetail.payments}</h2>
            </div>
            {payments.length === 0 ? (
              <p className="text-sm text-slate-400">{copy.caseDetail.noPayments}</p>
            ) : (
              <div className="space-y-3">
                {payments.map((p) => (
                  <div key={p.id} className="rounded-2xl bg-slate-50 p-4 flex justify-between items-center">
                    <div>
                      <div className="font-medium text-slate-900 text-sm">
                        {p.label || getPaymentMilestoneLabel(p.milestone_type, locale)}
                      </div>
                      {p.amount_eur != null && (
                        <div className="text-xs text-slate-400 mt-0.5">€{p.amount_eur.toFixed(2)}</div>
                      )}
                    </div>
                    <span className="text-xs text-slate-500">{getPaymentStatusLabel(p.status, locale)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6">
            <div className="flex items-center gap-2 mb-5">
              <MessageSquare className="w-4 h-4 text-brand-600" />
              <h2 className="font-semibold text-slate-900">{t.lawyerNotes}</h2>
              <span className="ml-auto text-xs text-slate-400">{notes.length}</span>
            </div>
            {notes.length === 0 ? (
              <p className="text-sm text-slate-400">{t.noPrivateNotes}</p>
            ) : (
              <div className="space-y-3">
                {notes.map((note) => (
                  <div key={note.id} className="rounded-2xl bg-slate-50 p-4">
                    <p className="text-sm text-slate-700 leading-relaxed">{note.content}</p>
                    <div className="text-xs text-slate-400 mt-2">{formatDate(note.created_at, locale)}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-6">
        <div className="flex items-center gap-2 mb-5">
          <TimerReset className="w-4 h-4 text-brand-600" />
          <h2 className="font-semibold text-slate-900">{copy.caseDetail.timeline}</h2>
        </div>
        {events.length === 0 ? (
          <p className="text-sm text-slate-400">{copy.caseDetail.noEvents}</p>
        ) : (
          <div className="space-y-3">
            {events.map((event) => (
              <div key={event.id} className="rounded-2xl bg-slate-50 p-4">
                <div className="font-medium text-slate-900 text-sm">{event.title}</div>
                {event.description && (
                  <div className="text-sm text-slate-500 mt-1">{event.description}</div>
                )}
                <div className="text-xs text-slate-400 mt-2">
                  {event.event_type} · {formatDate(event.created_at, locale)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
