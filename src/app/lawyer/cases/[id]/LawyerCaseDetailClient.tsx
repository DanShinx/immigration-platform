'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { FileText, MessageSquare, Save, User } from 'lucide-react'
import { useI18n } from '@/components/LanguageProvider'
import { getCaseContent } from '@/lib/case-content'
import { caseStageValues, getCaseStageMeta, getCaseTrackMeta } from '@/lib/cases'
import { getDocumentTypeLabel } from '@/lib/documents'
import { formatDate } from '@/lib/utils'
import type { CaseDocument, CaseNote, CasePayment, CaseRecord } from '@/types'

interface Props {
  caseItem: CaseRecord
  immigrant: { full_name: string; email: string; nationality: string } | null
  documents: CaseDocument[]
  notes: CaseNote[]
  payments: CasePayment[]
  lawyerId: string
}

export default function LawyerCaseDetailClient({
  caseItem,
  immigrant,
  documents,
  notes,
  payments,
  lawyerId,
}: Props) {
  const supabase = createClient()
  const router = useRouter()
  const { locale } = useI18n()
  const copy = getCaseContent(locale)
  const stageMeta = getCaseStageMeta(caseItem.stage, locale)
  const trackMeta = getCaseTrackMeta(caseItem.track_code, locale)

  const [currentStage, setCurrentStage] = useState(caseItem.stage)
  const [savingStage, setSavingStage] = useState(false)
  const [newNote, setNewNote] = useState('')
  const [savingNote, setSavingNote] = useState(false)
  const [localNotes, setLocalNotes] = useState(notes)

  async function updateStage(nextStage: string) {
    setSavingStage(true)
    await supabase
      .from('cases')
      .update({ stage: nextStage, updated_at: new Date().toISOString() })
      .eq('id', caseItem.id)

    await supabase.from('case_events').insert({
      case_id: caseItem.id,
      actor_user_id: lawyerId,
      event_type: 'stage_updated',
      title: 'Case stage updated',
      description: `Stage changed to ${nextStage}.`,
    })

    setCurrentStage(nextStage as any)
    setSavingStage(false)
    router.refresh()
  }

  async function addNote() {
    if (!newNote.trim()) return

    setSavingNote(true)
    const { data } = await supabase
      .from('case_notes')
      .insert({
        case_id: caseItem.id,
        immigrant_id: caseItem.immigrant_id,
        lawyer_id: lawyerId,
        content: newNote.trim(),
        is_private: true,
      })
      .select('*')
      .single()

    if (data) {
      setLocalNotes([data, ...localNotes])
      setNewNote('')
    }

    setSavingNote(false)
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${stageMeta.color}`}>
              {stageMeta.label}
            </span>
            <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
              {trackMeta.shortTitle}
            </span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mt-4">{caseItem.title}</h1>
          <p className="text-slate-500 mt-2 leading-relaxed">{caseItem.summary || trackMeta.description}</p>
        </div>
        <div className="rounded-3xl border border-slate-200 bg-white p-5 min-w-[280px]">
          <label className="block text-sm font-medium text-slate-700 mb-2">{copy.lawyerCases.stage}</label>
          <div className="flex gap-2">
            <select
              value={currentStage}
              onChange={(event) => updateStage(event.target.value)}
              disabled={savingStage}
              className="flex-1 rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-600"
            >
              {caseStageValues.map((stage) => (
                <option key={stage} value={stage}>
                  {getCaseStageMeta(stage, locale).label}
                </option>
              ))}
            </select>
            <div className="inline-flex items-center justify-center rounded-xl bg-slate-100 px-3">
              <Save className={`w-4 h-4 ${savingStage ? 'animate-pulse text-brand-700' : 'text-slate-400'}`} />
            </div>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-[1fr,1fr] gap-6">
        <div className="rounded-3xl border border-slate-200 bg-white p-6">
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-brand-600" />
            <h2 className="font-semibold text-slate-900">{copy.lawyerCases.caseOwner}</h2>
          </div>
          {immigrant ? (
            <div className="space-y-2 mt-5 text-sm">
              <div className="font-medium text-slate-900">{immigrant.full_name}</div>
              <div className="text-slate-500">{immigrant.email}</div>
              <div className="text-slate-500">{immigrant.nationality}</div>
              <div className="text-slate-400">{formatDate(caseItem.created_at, locale)}</div>
            </div>
          ) : null}
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-brand-600" />
            <h2 className="font-semibold text-slate-900">Payments</h2>
          </div>
          {payments.length === 0 ? (
            <p className="text-sm text-slate-500 mt-5">{copy.caseDetail.noPayments}</p>
          ) : (
            <div className="space-y-3 mt-5">
              {payments.map((payment) => (
                <div key={payment.id} className="rounded-2xl bg-slate-50 p-4">
                  <div className="font-medium text-slate-900">{payment.label || payment.milestone_type}</div>
                  <div className="text-sm text-slate-500 mt-1">{payment.status}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="grid xl:grid-cols-[1fr,1fr] gap-6">
        <div className="rounded-3xl border border-slate-200 bg-white p-6">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-brand-600" />
            <h2 className="font-semibold text-slate-900">{copy.caseDetail.documents}</h2>
          </div>
          {documents.length === 0 ? (
            <p className="text-sm text-slate-500 mt-5">{copy.caseDetail.noDocuments}</p>
          ) : (
            <div className="space-y-3 mt-5">
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

        <div className="rounded-3xl border border-slate-200 bg-white p-6">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-brand-600" />
            <h2 className="font-semibold text-slate-900">Private notes</h2>
          </div>

          <div className="mt-5 space-y-3">
            <textarea
              rows={4}
              value={newNote}
              onChange={(event) => setNewNote(event.target.value)}
              placeholder="Add a lawyer-only note for this case..."
              className="w-full rounded-2xl border border-slate-300 bg-white px-3.5 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-600 resize-none"
            />
            <button
              type="button"
              onClick={addNote}
              disabled={savingNote || !newNote.trim()}
              className="inline-flex items-center justify-center rounded-2xl bg-brand-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-800 disabled:opacity-60"
            >
              {savingNote ? 'Saving...' : 'Save note'}
            </button>
          </div>

          {localNotes.length === 0 ? (
            <p className="text-sm text-slate-500 mt-5">No private notes yet.</p>
          ) : (
            <div className="space-y-3 mt-5">
              {localNotes.map((note) => (
                <div key={note.id} className="rounded-2xl bg-slate-50 p-4">
                  <div className="text-sm text-slate-700 leading-relaxed">{note.content}</div>
                  <div className="text-xs text-slate-400 mt-2">{formatDate(note.created_at, locale)}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
