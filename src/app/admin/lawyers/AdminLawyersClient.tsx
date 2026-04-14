'use client'

import { useState } from 'react'
import { CheckCircle2, Clock, ShieldX, Briefcase } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useI18n } from '@/components/LanguageProvider'
import { formatDate } from '@/lib/utils'

interface LawyerRecord {
  id: string
  user_id: string
  full_name: string
  email: string
  license_number: string
  specialization?: string | null
  bar_association?: string | null
  is_active: boolean
  approval_status: 'pending_approval' | 'approved' | 'rejected'
  created_at: string
}

interface Props {
  lawyers: LawyerRecord[]
  adminUserId: string
}

export default function AdminLawyersClient({ lawyers: initial, adminUserId }: Props) {
  const supabase = createClient()
  const { messages, locale } = useI18n()
  const t = messages.admin.lawyers

  const [lawyers, setLawyers] = useState(initial)
  const [processingId, setProcessingId] = useState<string | null>(null)
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

  const pending = lawyers.filter((l) => l.approval_status === 'pending_approval')
  const rest = lawyers.filter((l) => l.approval_status !== 'pending_approval')

  async function updateLawyer(
    lawyer: LawyerRecord,
    patch: Partial<{ approval_status: string; is_active: boolean }>,
    successMsg: string
  ) {
    setProcessingId(lawyer.id)
    setFeedback(null)

    const { error } = await supabase.from('lawyers').update(patch).eq('id', lawyer.id)

    if (error) {
      setFeedback({ type: 'error', message: t.messages.error })
      setProcessingId(null)
      return
    }

    // Write audit log
    await supabase.from('audit_log').insert({
      actor_user_id: adminUserId,
      action: Object.keys(patch)[0] === 'approval_status' ? `lawyer_${patch.approval_status}` : patch.is_active ? 'lawyer_activated' : 'lawyer_deactivated',
      target_type: 'lawyer',
      target_id: lawyer.id,
      metadata: { lawyer_user_id: lawyer.user_id, ...patch },
    })

    setLawyers((prev) =>
      prev.map((l) => (l.id === lawyer.id ? { ...l, ...patch } as LawyerRecord : l))
    )
    setFeedback({ type: 'success', message: successMsg })
    setProcessingId(null)
  }

  function approveLawyer(lawyer: LawyerRecord) {
    updateLawyer(lawyer, { approval_status: 'approved', is_active: true }, t.messages.approved)
  }

  function rejectLawyer(lawyer: LawyerRecord) {
    updateLawyer(lawyer, { approval_status: 'rejected', is_active: false }, t.messages.rejected)
  }

  function toggleActive(lawyer: LawyerRecord) {
    const msg = lawyer.is_active ? t.messages.deactivated : t.messages.activated
    updateLawyer(lawyer, { is_active: !lawyer.is_active }, msg)
  }

  const approvalBadge = (status: LawyerRecord['approval_status']) => {
    const map = {
      pending_approval: 'bg-amber-100 text-amber-700',
      approved: 'bg-green-100 text-green-700',
      rejected: 'bg-red-100 text-red-700',
    }
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${map[status]}`}>
        {t.approvalStatus[status]}
      </span>
    )
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">{t.title}</h1>
        <p className="text-slate-500 mt-1">{t.subtitle}</p>
      </div>

      {feedback && (
        <div className={`rounded-2xl border px-4 py-3 text-sm ${feedback.type === 'success' ? 'border-green-200 bg-green-50 text-green-700' : 'border-red-200 bg-red-50 text-red-700'}`}>
          {feedback.message}
        </div>
      )}

      {/* Approval queue */}
      <div className="bg-white rounded-2xl border border-slate-100 p-6">
        <div className="flex items-center gap-2 mb-4">
          <Clock className="w-4 h-4 text-amber-500" />
          <h2 className="font-semibold text-slate-900">{t.approvalQueue}</h2>
          {pending.length > 0 && (
            <span className="ml-1 inline-flex items-center justify-center w-5 h-5 rounded-full bg-amber-500 text-white text-xs font-bold">
              {pending.length}
            </span>
          )}
        </div>

        {pending.length === 0 ? (
          <div className="py-10 text-center">
            <CheckCircle2 className="w-10 h-10 text-slate-200 mx-auto mb-3" />
            <p className="text-sm text-slate-400">{t.emptyQueue}</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-50">
            {pending.map((lawyer) => (
              <div key={lawyer.id} className="py-4 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div className="space-y-1">
                  <div className="font-semibold text-slate-900">{lawyer.full_name}</div>
                  <div className="text-sm text-slate-500">{lawyer.email}</div>
                  <div className="text-sm text-slate-500">
                    {t.columns.license}: <span className="font-medium text-slate-700">{lawyer.license_number}</span>
                    {lawyer.specialization && <> · {lawyer.specialization}</>}
                    {lawyer.bar_association && <> · {lawyer.bar_association}</>}
                  </div>
                  <div className="text-xs text-slate-400">{formatDate(lawyer.created_at, locale)}</div>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <button
                    onClick={() => approveLawyer(lawyer)}
                    disabled={processingId === lawyer.id}
                    className="rounded-xl bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50 transition-colors"
                  >
                    {processingId === lawyer.id ? t.approving : t.approve}
                  </button>
                  <button
                    onClick={() => rejectLawyer(lawyer)}
                    disabled={processingId === lawyer.id}
                    className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50 transition-colors"
                  >
                    {t.reject}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* All lawyers */}
      <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Briefcase className="w-4 h-4 text-brand-600" />
            <h2 className="font-semibold text-slate-900">{t.allLawyers}</h2>
          </div>
        </div>

        {rest.length === 0 ? (
          <div className="py-16 text-center">
            <Briefcase className="w-10 h-10 text-slate-200 mx-auto mb-3" />
            <p className="text-sm text-slate-400">{t.emptyAll}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr>
                  {[t.columns.name, t.columns.license, t.columns.specialization, t.columns.status, t.columns.registered, t.columns.actions].map((col) => (
                    <th key={col} className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wide whitespace-nowrap">
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {rest.map((lawyer) => (
                  <tr key={lawyer.id} className="hover:bg-slate-50/50">
                    <td className="px-6 py-4">
                      <div className="font-medium text-slate-900">{lawyer.full_name}</div>
                      <div className="text-xs text-slate-400">{lawyer.email}</div>
                    </td>
                    <td className="px-6 py-4 text-slate-600">{lawyer.license_number}</td>
                    <td className="px-6 py-4 text-slate-600">{lawyer.specialization || '—'}</td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1">
                        {approvalBadge(lawyer.approval_status)}
                        {lawyer.approval_status === 'approved' && (
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${lawyer.is_active ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-500'}`}>
                            {lawyer.is_active ? 'Visible' : 'Hidden'}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-500 whitespace-nowrap">{formatDate(lawyer.created_at, locale)}</td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        {lawyer.approval_status === 'rejected' && (
                          <button
                            onClick={() => approveLawyer(lawyer)}
                            disabled={processingId === lawyer.id}
                            className="text-xs px-3 py-1.5 rounded-lg bg-green-50 text-green-700 hover:bg-green-100 disabled:opacity-50 font-medium transition-colors"
                          >
                            {t.approve}
                          </button>
                        )}
                        {lawyer.approval_status === 'approved' && (
                          <button
                            onClick={() => toggleActive(lawyer)}
                            disabled={processingId === lawyer.id}
                            className={`text-xs px-3 py-1.5 rounded-lg font-medium disabled:opacity-50 transition-colors ${lawyer.is_active ? 'bg-red-50 text-red-600 hover:bg-red-100' : 'bg-green-50 text-green-700 hover:bg-green-100'}`}
                          >
                            {processingId === lawyer.id ? t.processing : lawyer.is_active ? t.deactivate : t.activate}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
