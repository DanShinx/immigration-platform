'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowRight, CheckCircle2, Clock3, Mail, ShieldX, UserSquare2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useI18n } from '@/components/LanguageProvider'
import { getCaseContent } from '@/lib/case-content'
import { getCaseStageMeta, getCaseTrackMeta } from '@/lib/cases'
import { formatDate } from '@/lib/utils'

interface RequestRecord {
  id: string
  immigrant_id: string
  case_id?: string | null
  lawyer_user_id: string
  status: 'pending' | 'accepted' | 'rejected' | 'withdrawn'
  created_at: string
  responded_at?: string | null
  caseItem: {
    id: string
    title: string
    track_code: string
    stage: string
  } | null
  immigrant: {
    id: string
    full_name: string
    email: string
    nationality: string
  } | null
}

interface Props {
  requests: RequestRecord[]
  lawyerUserId: string
}

export default function LawyerRequestsClient({ requests, lawyerUserId }: Props) {
  const supabase = createClient()
  const { locale, messages } = useI18n()
  const copy = getCaseContent(locale)
  const t = messages.lawyerRequests

  const [localRequests, setLocalRequests] = useState(requests)
  const [processingId, setProcessingId] = useState<string | null>(null)
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

  const pendingRequests = localRequests.filter((request) => request.status === 'pending')
  const reviewedRequests = localRequests.filter((request) => request.status !== 'pending')
  const stats = {
    pending: pendingRequests.length,
    accepted: localRequests.filter((request) => request.status === 'accepted').length,
    rejected: localRequests.filter((request) => request.status === 'rejected').length,
  }

  async function handleRequestAction(request: RequestRecord, nextStatus: 'accepted' | 'rejected') {
    if (!request.case_id) return

    setProcessingId(request.id)
    setFeedback(null)

    const respondedAt = new Date().toISOString()

    const { error: requestError } = await supabase
      .from('lawyer_assignment_requests')
      .update({ status: nextStatus, responded_at: respondedAt })
      .eq('id', request.id)

    if (requestError) {
      setFeedback({ type: 'error', message: t.messages.error })
      setProcessingId(null)
      return
    }

    if (nextStatus === 'accepted') {
      await supabase
        .from('cases')
        .update({
          assigned_lawyer_user_id: lawyerUserId,
          stage: 'lawyer_review',
          updated_at: respondedAt,
        })
        .eq('id', request.case_id)

      await supabase.from('case_events').insert({
        case_id: request.case_id,
        actor_user_id: lawyerUserId,
        event_type: 'lawyer_assigned',
        title: 'Lawyer assigned',
        description: 'A lawyer accepted the assignment request for this case.',
      })
    }

    setLocalRequests((current) =>
      current.map((item) =>
        item.id === request.id
          ? { ...item, status: nextStatus, responded_at: respondedAt }
          : item
      )
    )

    setFeedback({
      type: 'success',
      message: nextStatus === 'accepted' ? t.messages.accepted : t.messages.rejected,
    })
    setProcessingId(null)
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">{t.title}</h1>
        <p className="text-slate-500 mt-1">{t.subtitle}</p>
      </div>

      {feedback && (
        <div
          className={`rounded-2xl border px-4 py-3 text-sm ${
            feedback.type === 'success'
              ? 'border-green-200 bg-green-50 text-green-700'
              : 'border-red-200 bg-red-50 text-red-700'
          }`}
        >
          {feedback.message}
        </div>
      )}

      <div className="grid sm:grid-cols-3 gap-5">
        {[
          { label: t.stats.pending, value: stats.pending, icon: Clock3, color: 'bg-amber-50 text-amber-600' },
          { label: t.stats.accepted, value: stats.accepted, icon: CheckCircle2, color: 'bg-green-50 text-green-600' },
          { label: t.stats.rejected, value: stats.rejected, icon: ShieldX, color: 'bg-rose-50 text-rose-600' },
        ].map((stat) => (
          <div key={stat.label} className="bg-white rounded-2xl border border-slate-100 p-6">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${stat.color}`}>
              <stat.icon className="w-5 h-5" />
            </div>
            <div className="text-3xl font-bold text-slate-900 mt-4">{stat.value}</div>
            <div className="text-sm text-slate-500 mt-1">{stat.label}</div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 p-6">
        <h2 className="font-semibold text-slate-900 mb-4">{t.pendingTitle}</h2>

        {pendingRequests.length === 0 ? (
          <div className="py-10 text-center">
            <Clock3 className="w-10 h-10 text-slate-200 mx-auto mb-3" />
            <p className="text-sm text-slate-400">{t.emptyPending}</p>
          </div>
        ) : (
          <div className="space-y-4">
            {pendingRequests.map((request) => {
              const stage = request.caseItem ? getCaseStageMeta(request.caseItem.stage, locale) : null
              const track = request.caseItem ? getCaseTrackMeta(request.caseItem.track_code as any, locale) : null

              return (
                <div key={request.id} className="rounded-2xl border border-slate-200 p-5 bg-slate-50/70">
                  <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                    <div className="space-y-3">
                      <div>
                        <div className="font-semibold text-slate-900">
                          {request.caseItem?.title || request.immigrant?.full_name || messages.dashboardLayout.userFallback}
                        </div>
                        <div className="text-xs text-slate-400 mt-1">
                          {t.requestedOn} {formatDate(request.created_at, locale)}
                        </div>
                      </div>

                      <div className="grid sm:grid-cols-2 gap-3 text-sm text-slate-600">
                        <div>
                          <span className="text-slate-400">{copy.lawyerRequests.caseLabel}:</span>{' '}
                          {request.caseItem?.title || '—'}
                        </div>
                        <div>
                          <span className="text-slate-400">{copy.lawyerRequests.linkedTrack}:</span>{' '}
                          {track?.title || '—'}
                        </div>
                        <div className="flex items-center gap-2">
                          <Mail className="w-4 h-4 text-slate-400" />
                          <span>{request.immigrant?.email || '—'}</span>
                        </div>
                        <div>
                          <span className="text-slate-400">{t.immigrantDetails.nationality}:</span>{' '}
                          {request.immigrant?.nationality || '—'}
                        </div>
                      </div>

                      {stage && (
                        <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${stage.color}`}>
                          {stage.label}
                        </span>
                      )}
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 lg:w-auto">
                      <button
                        type="button"
                        onClick={() => handleRequestAction(request, 'accepted')}
                        disabled={processingId === request.id}
                        className="rounded-xl bg-green-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-green-700 disabled:opacity-50"
                      >
                        {processingId === request.id ? t.processing : t.accept}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRequestAction(request, 'rejected')}
                        disabled={processingId === request.id}
                        className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 disabled:opacity-50"
                      >
                        {t.reject}
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 p-6">
        <h2 className="font-semibold text-slate-900 mb-4">{t.reviewedTitle}</h2>

        {reviewedRequests.length === 0 ? (
          <div className="py-10 text-center">
            <UserSquare2 className="w-10 h-10 text-slate-200 mx-auto mb-3" />
            <p className="text-sm text-slate-400">{t.emptyReviewed}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {reviewedRequests.map((request) => (
              <div key={request.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 rounded-xl border border-slate-200 p-4">
                <div>
                  <div className="font-medium text-slate-900">
                    {request.caseItem?.title || request.immigrant?.full_name || messages.dashboardLayout.userFallback}
                  </div>
                  <div className="text-xs text-slate-400 mt-1">
                    {request.responded_at
                      ? `${t.respondedOn} ${formatDate(request.responded_at, locale)}`
                      : `${t.requestedOn} ${formatDate(request.created_at, locale)}`}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                    {request.status === 'accepted'
                      ? t.accepted
                      : request.status === 'rejected'
                      ? t.rejected
                      : t.withdrawn}
                  </span>
                  {request.status === 'accepted' && request.caseItem && (
                    <Link
                      href={`/lawyer/cases/${request.caseItem.id}`}
                      className="inline-flex items-center gap-1 text-sm text-brand-600 hover:text-brand-800 font-medium"
                    >
                      {copy.lawyerCases.viewCase}
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
