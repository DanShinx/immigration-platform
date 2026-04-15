'use client'

import { startTransition, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useI18n } from '@/components/LanguageProvider'
import { getCaseContent } from '@/lib/case-content'
import {
  getCaseTrackMeta,
  getDefaultCaseTitle,
  getDefaultPaymentPlan,
  getInitialCaseStage,
  getPaymentMilestoneLabel,
  nomadTrackValues,
} from '@/lib/cases'
import type { CaseRecord, CaseTrackCode } from '@/types'

interface Props {
  immigrantId: string
  initialTrack: CaseTrackCode
  existingCases: Pick<CaseRecord, 'id' | 'title' | 'track_code' | 'stage'>[]
}

export default function NewCaseClient({ immigrantId, initialTrack, existingCases }: Props) {
  const router = useRouter()
  const supabase = createClient()
  const { locale } = useI18n()
  const copy = getCaseContent(locale)

  const [trackCode, setTrackCode] = useState<CaseTrackCode>(initialTrack)
  const [summary, setSummary] = useState('')
  const [linkedCaseId, setLinkedCaseId] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

  const relatedOptions = existingCases.filter((caseItem) => caseItem.id !== linkedCaseId)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSubmitting(true)
    setFeedback(null)

    const stage = getInitialCaseStage(trackCode)
    const title = getDefaultCaseTitle(trackCode, locale)

    const { data: insertedCase, error } = await supabase
      .from('cases')
      .insert({
        immigrant_id: immigrantId,
        category_code: 'nomad',
        track_code: trackCode,
        title,
        summary: summary.trim() || null,
        stage,
        outcome: 'pending',
        linked_primary_case_id: linkedCaseId || null,
        source_case_id: linkedCaseId || null,
        metadata: {
          created_from: 'immigrant_portal',
        },
      })
      .select('id')
      .single()

    if (error || !insertedCase) {
      setFeedback({ type: 'error', message: copy.newCase.error })
      setSubmitting(false)
      return
    }

    const milestoneRows = getDefaultPaymentPlan(trackCode).map((milestone) => ({
      case_id: insertedCase.id,
      milestone_type: milestone,
      status: milestone === 'consultation' ? 'requested' : 'pending',
    }))

    await supabase.from('case_payments').insert(milestoneRows)

    await supabase.from('case_events').insert({
      case_id: insertedCase.id,
      event_type: 'case_created',
      title,
      description: summary.trim() || 'Case created from the immigrant portal.',
    })

    setFeedback({ type: 'success', message: copy.newCase.success })
    setSubmitting(false)

    startTransition(() => {
      router.push(`/immigrant/cases/${insertedCase.id}`)
      router.refresh()
    })
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">{copy.newCase.title}</h1>
        <p className="text-slate-500 mt-1">{copy.newCase.subtitle}</p>
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

      <form onSubmit={handleSubmit} className="grid lg:grid-cols-[1.1fr,0.9fr] gap-6">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              {copy.newCase.trackLabel}
            </label>
            <select
              value={trackCode}
              onChange={(event) => setTrackCode(event.target.value as CaseTrackCode)}
              className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-600"
            >
              {nomadTrackValues.map((track) => (
                <option key={track} value={track}>
                  {getCaseTrackMeta(track, locale).title}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              {copy.newCase.summaryLabel}
            </label>
            <textarea
              value={summary}
              onChange={(event) => setSummary(event.target.value)}
              placeholder={copy.newCase.summaryPlaceholder}
              rows={6}
              className="w-full rounded-2xl border border-slate-300 bg-white px-3.5 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-600 resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              {copy.newCase.linkedCaseLabel}
            </label>
            <select
              value={linkedCaseId}
              onChange={(event) => setLinkedCaseId(event.target.value)}
              className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-600"
            >
              <option value="">{copy.newCase.linkedCasePlaceholder}</option>
              {relatedOptions.map((caseItem) => (
                <option key={caseItem.id} value={caseItem.id}>
                  {caseItem.title}
                </option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center justify-center rounded-2xl bg-brand-700 px-5 py-3 text-sm font-semibold text-white hover:bg-brand-800 disabled:opacity-60"
          >
            {submitting ? copy.newCase.creating : copy.newCase.submit}
          </button>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6">
          <h2 className="text-lg font-semibold text-slate-900">
            {getCaseTrackMeta(trackCode, locale).title}
          </h2>
          <p className="text-sm text-slate-500 mt-2 leading-relaxed">
            {getCaseTrackMeta(trackCode, locale).description}
          </p>

          <div className="mt-6 space-y-3">
            {getDefaultPaymentPlan(trackCode).map((milestone) => (
              <div key={milestone} className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">
                {getPaymentMilestoneLabel(milestone, locale)}
              </div>
            ))}
          </div>
        </div>
      </form>
    </div>
  )
}
