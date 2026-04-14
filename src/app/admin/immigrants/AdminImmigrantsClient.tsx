'use client'

import { useMemo, useState } from 'react'
import { Search, Users } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useI18n } from '@/components/LanguageProvider'
import { formatDate, getCaseStatusMeta } from '@/lib/utils'

interface ImmigrantRow {
  id: string
  user_id: string
  full_name: string
  email: string
  nationality: string
  case_status: string
  assigned_lawyer_id?: string | null
  assignedLawyer?: { user_id: string; full_name: string } | null
  created_at: string
}

interface LawyerOption {
  user_id: string
  full_name: string
  email: string
}

interface Props {
  immigrants: ImmigrantRow[]
  lawyers: LawyerOption[]
  adminUserId: string
}

const CASE_STATUSES = ['pending', 'in_review', 'documents_required', 'submitted', 'approved', 'rejected']

export default function AdminImmigrantsClient({ immigrants: initial, lawyers, adminUserId }: Props) {
  const supabase = createClient()
  const { messages, locale } = useI18n()
  const t = messages.admin.immigrants

  const [immigrants, setImmigrants] = useState(initial)
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [activeRow, setActiveRow] = useState<string | null>(null)
  const [processingId, setProcessingId] = useState<string | null>(null)
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

  // Inline edit state
  const [pendingStatus, setPendingStatus] = useState<Record<string, string>>({})
  const [pendingLawyer, setPendingLawyer] = useState<Record<string, string>>({})

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return immigrants.filter((imm) => {
      const matchSearch = !q || [imm.full_name, imm.email, imm.nationality].some((v) => v?.toLowerCase().includes(q))
      const matchStatus = !filterStatus || imm.case_status === filterStatus
      return matchSearch && matchStatus
    })
  }, [immigrants, search, filterStatus])

  async function saveStatus(imm: ImmigrantRow) {
    const newStatus = pendingStatus[imm.id]
    if (!newStatus || newStatus === imm.case_status) { setActiveRow(null); return }
    setProcessingId(imm.id)

    const { error } = await supabase.from('immigrants').update({ case_status: newStatus }).eq('id', imm.id)
    if (error) { setFeedback({ type: 'error', message: t.messages.error }); setProcessingId(null); return }

    await supabase.from('audit_log').insert({
      actor_user_id: adminUserId, action: 'case_status_override',
      target_type: 'immigrant', target_id: imm.id,
      metadata: { from: imm.case_status, to: newStatus },
    })

    setImmigrants((prev) => prev.map((i) => i.id === imm.id ? { ...i, case_status: newStatus } : i))
    setFeedback({ type: 'success', message: t.messages.statusUpdated })
    setActiveRow(null)
    setProcessingId(null)
  }

  async function saveLawyer(imm: ImmigrantRow) {
    const newLawyerUserId = pendingLawyer[imm.id]
    if (!newLawyerUserId || newLawyerUserId === (imm.assigned_lawyer_id ?? '')) { setActiveRow(null); return }
    setProcessingId(imm.id)

    const { error } = await supabase.from('immigrants')
      .update({ assigned_lawyer_id: newLawyerUserId || null })
      .eq('id', imm.id)

    if (error) { setFeedback({ type: 'error', message: t.messages.error }); setProcessingId(null); return }

    await supabase.from('audit_log').insert({
      actor_user_id: adminUserId, action: 'manual_lawyer_assignment',
      target_type: 'immigrant', target_id: imm.id,
      metadata: { from: imm.assigned_lawyer_id, to: newLawyerUserId },
    })

    const lawyer = lawyers.find((l) => l.user_id === newLawyerUserId) || null
    setImmigrants((prev) => prev.map((i) => i.id === imm.id
      ? { ...i, assigned_lawyer_id: newLawyerUserId || null, assignedLawyer: lawyer as any }
      : i
    ))
    setFeedback({ type: 'success', message: t.messages.lawyerAssigned })
    setActiveRow(null)
    setProcessingId(null)
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

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-slate-100 p-4 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t.search}
            className="w-full pl-10 pr-4 py-2.5 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-600 bg-white"
          />
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-3 py-2.5 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-600 bg-white"
        >
          <option value="">{t.allStatuses}</option>
          {CASE_STATUSES.map((s) => (
            <option key={s} value={s}>{messages.shared.caseStatuses[s as keyof typeof messages.shared.caseStatuses]}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
        {filtered.length === 0 ? (
          <div className="py-20 text-center">
            <Users className="w-10 h-10 text-slate-200 mx-auto mb-3" />
            <p className="text-sm text-slate-400">{t.empty}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr>
                  {[t.columns.name, t.columns.nationality, t.columns.caseStatus, t.columns.lawyer, t.columns.registered, t.columns.actions].map((col) => (
                    <th key={col} className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wide whitespace-nowrap">{col}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filtered.map((imm) => {
                  const status = getCaseStatusMeta(imm.case_status, locale)
                  const isEditing = activeRow === imm.id
                  const isBusy = processingId === imm.id

                  return (
                    <tr key={imm.id} className="hover:bg-slate-50/50">
                      <td className="px-6 py-4">
                        <div className="font-medium text-slate-900">{imm.full_name}</div>
                        <div className="text-xs text-slate-400">{imm.email}</div>
                      </td>
                      <td className="px-6 py-4 text-slate-600">{imm.nationality}</td>
                      <td className="px-6 py-4">
                        {isEditing ? (
                          <select
                            value={pendingStatus[imm.id] ?? imm.case_status}
                            onChange={(e) => setPendingStatus((p) => ({ ...p, [imm.id]: e.target.value }))}
                            className="text-xs border border-slate-300 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-brand-600"
                          >
                            {CASE_STATUSES.map((s) => (
                              <option key={s} value={s}>{messages.shared.caseStatuses[s as keyof typeof messages.shared.caseStatuses]}</option>
                            ))}
                          </select>
                        ) : (
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${status.color}`}>
                            {status.label}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {isEditing ? (
                          <select
                            value={pendingLawyer[imm.id] ?? (imm.assigned_lawyer_id || '')}
                            onChange={(e) => setPendingLawyer((p) => ({ ...p, [imm.id]: e.target.value }))}
                            className="text-xs border border-slate-300 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-brand-600 max-w-[200px]"
                          >
                            <option value="">{t.selectLawyer}</option>
                            {lawyers.map((l) => (
                              <option key={l.user_id} value={l.user_id}>{l.full_name}</option>
                            ))}
                          </select>
                        ) : (
                          <span className="text-slate-600 text-sm">
                            {imm.assignedLawyer?.full_name || <span className="text-slate-400">{t.noLawyer}</span>}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-slate-500 whitespace-nowrap">{formatDate(imm.created_at, locale)}</td>
                      <td className="px-6 py-4">
                        {isEditing ? (
                          <div className="flex gap-2">
                            <button
                              onClick={() => { saveStatus(imm); saveLawyer(imm) }}
                              disabled={isBusy}
                              className="text-xs px-3 py-1.5 rounded-lg bg-brand-700 text-white hover:bg-brand-800 disabled:opacity-50 font-medium transition-colors"
                            >
                              {isBusy ? t.saving : messages.shared.actions.save}
                            </button>
                            <button
                              onClick={() => setActiveRow(null)}
                              disabled={isBusy}
                              className="text-xs px-3 py-1.5 rounded-lg border border-slate-300 text-slate-600 hover:bg-slate-50 disabled:opacity-50 transition-colors"
                            >
                              ✕
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => {
                              setActiveRow(imm.id)
                              setPendingStatus((p) => ({ ...p, [imm.id]: imm.case_status }))
                              setPendingLawyer((p) => ({ ...p, [imm.id]: imm.assigned_lawyer_id || '' }))
                            }}
                            className="text-xs px-3 py-1.5 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 font-medium transition-colors"
                          >
                            {t.overrideStatus}
                          </button>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
