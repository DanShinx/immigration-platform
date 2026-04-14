'use client'

import { useState } from 'react'
import { Flag } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useI18n } from '@/components/LanguageProvider'
import { formatDate } from '@/lib/utils'

type FlagStatus = 'open' | 'in_review' | 'resolved' | 'dismissed'
type FlagCategory = 'lawyer_misconduct' | 'document_issue' | 'technical_problem' | 'other'

interface FlagRow {
  id: string
  reporter_user_id: string
  category: FlagCategory
  description: string
  status: FlagStatus
  admin_notes?: string | null
  created_at: string
  resolved_at?: string | null
  reporter?: { full_name: string; email: string } | null
}

interface Props {
  flags: FlagRow[]
  adminUserId: string
}

const STATUS_COLORS: Record<FlagStatus, string> = {
  open: 'bg-red-100 text-red-700',
  in_review: 'bg-amber-100 text-amber-700',
  resolved: 'bg-green-100 text-green-700',
  dismissed: 'bg-slate-100 text-slate-500',
}

export default function AdminFlagsClient({ flags: initial, adminUserId }: Props) {
  const supabase = createClient()
  const { messages, locale } = useI18n()
  const t = messages.admin.flags

  const [flags, setFlags] = useState(initial)
  const [filterStatus, setFilterStatus] = useState<string>('')
  const [processingId, setProcessingId] = useState<string | null>(null)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [notes, setNotes] = useState<Record<string, string>>({})
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

  const filtered = flags.filter((f) => !filterStatus || f.status === filterStatus)

  async function updateFlag(flag: FlagRow, patch: Partial<FlagRow>) {
    setProcessingId(flag.id)
    setFeedback(null)

    const update: any = { ...patch }
    if (patch.status === 'resolved' || patch.status === 'dismissed') {
      update.resolved_at = new Date().toISOString()
    }

    const { error } = await supabase.from('admin_flags').update(update).eq('id', flag.id)
    if (error) {
      setFeedback({ type: 'error', message: t.messages.error })
      setProcessingId(null)
      return
    }

    setFlags((prev) => prev.map((f) => f.id === flag.id ? { ...f, ...update } : f))
    setFeedback({ type: 'success', message: t.messages.updated })
    setProcessingId(null)
  }

  async function saveNotes(flag: FlagRow) {
    const noteText = notes[flag.id] ?? flag.admin_notes ?? ''
    updateFlag(flag, { admin_notes: noteText })
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">{t.title}</h1>
        <p className="text-slate-500 mt-1">{t.subtitle}</p>
      </div>

      {feedback && (
        <div className={`rounded-2xl border px-4 py-3 text-sm ${feedback.type === 'success' ? 'border-green-200 bg-green-50 text-green-700' : 'border-red-200 bg-red-50 text-red-700'}`}>
          {feedback.message}
        </div>
      )}

      {/* Filter */}
      <div className="flex gap-2 flex-wrap">
        {(['', 'open', 'in_review', 'resolved', 'dismissed'] as const).map((s) => (
          <button
            key={s}
            onClick={() => setFilterStatus(s)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors border ${filterStatus === s ? 'bg-brand-700 text-white border-brand-700' : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-50'}`}
          >
            {s === '' ? t.allStatuses : t.statuses[s as FlagStatus]}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-100 py-20 text-center">
          <Flag className="w-10 h-10 text-slate-200 mx-auto mb-3" />
          <p className="text-sm text-slate-400">{t.empty}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((flag) => {
            const isExpanded = expandedId === flag.id
            const isBusy = processingId === flag.id

            return (
              <div key={flag.id} className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
                <div
                  className="px-6 py-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 cursor-pointer hover:bg-slate-50/50 transition-colors"
                  onClick={() => setExpandedId(isExpanded ? null : flag.id)}
                >
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className="font-semibold text-slate-900">
                        {t.categories[flag.category]}
                      </span>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[flag.status]}`}>
                        {t.statuses[flag.status]}
                      </span>
                    </div>
                    <p className="text-sm text-slate-600 truncate">{flag.description}</p>
                    <div className="text-xs text-slate-400">
                      {flag.reporter?.full_name || flag.reporter?.email} · {formatDate(flag.created_at, locale)}
                    </div>
                  </div>

                  <div className="flex gap-2 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                    {flag.status === 'open' && (
                      <button
                        onClick={() => updateFlag(flag, { status: 'in_review' })}
                        disabled={isBusy}
                        className="text-xs px-3 py-1.5 rounded-lg bg-amber-50 text-amber-700 hover:bg-amber-100 disabled:opacity-50 font-medium transition-colors"
                      >
                        {isBusy ? t.processing : t.markInReview}
                      </button>
                    )}
                    {(flag.status === 'open' || flag.status === 'in_review') && (
                      <>
                        <button
                          onClick={() => updateFlag(flag, { status: 'resolved' })}
                          disabled={isBusy}
                          className="text-xs px-3 py-1.5 rounded-lg bg-green-50 text-green-700 hover:bg-green-100 disabled:opacity-50 font-medium transition-colors"
                        >
                          {t.resolve}
                        </button>
                        <button
                          onClick={() => updateFlag(flag, { status: 'dismissed' })}
                          disabled={isBusy}
                          className="text-xs px-3 py-1.5 rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 disabled:opacity-50 font-medium transition-colors"
                        >
                          {t.dismiss}
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {isExpanded && (
                  <div className="px-6 pb-5 border-t border-slate-100 pt-4 space-y-4">
                    <div>
                      <div className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">{t.columns.description}</div>
                      <p className="text-sm text-slate-700 leading-relaxed">{flag.description}</p>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-500 uppercase tracking-wide mb-1.5">
                        {t.adminNotes}
                      </label>
                      <textarea
                        rows={3}
                        value={notes[flag.id] ?? (flag.admin_notes || '')}
                        onChange={(e) => setNotes((n) => ({ ...n, [flag.id]: e.target.value }))}
                        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-600 resize-none"
                        placeholder="Add internal notes..."
                      />
                      <button
                        onClick={() => saveNotes(flag)}
                        disabled={isBusy}
                        className="mt-2 text-xs px-3 py-1.5 rounded-lg bg-brand-700 text-white hover:bg-brand-800 disabled:opacity-50 font-medium transition-colors"
                      >
                        {isBusy ? t.processing : t.saveNotes}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
