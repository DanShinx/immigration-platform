'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { ArrowLeft, FileText, MessageSquare, User, Globe, Calendar, Upload, Plus, Save } from 'lucide-react'
import { documentsBucket, isAbsoluteUrl } from '@/lib/documents'
import { caseStatusLabels, formatDate } from '@/lib/utils'
import { useRouter } from 'next/navigation'

interface Props {
  immigrant: any
  documents: any[]
  notes: any[]
  lawyerId: string
}

const STATUS_OPTIONS = [
  { value: 'pending', label: 'Pendiente' },
  { value: 'in_review', label: 'En revisión' },
  { value: 'documents_required', label: 'Documentos requeridos' },
  { value: 'submitted', label: 'Enviado' },
  { value: 'approved', label: 'Aprobado' },
  { value: 'rejected', label: 'Rechazado' },
]

export default function ImmigrantDetailClient({ immigrant, documents, notes, lawyerId }: Props) {
  const [activeTab, setActiveTab] = useState<'overview' | 'documents' | 'notes'>('overview')
  const [newNote, setNewNote] = useState('')
  const [savingNote, setSavingNote] = useState(false)
  const [currentStatus, setCurrentStatus] = useState(immigrant.case_status)
  const [savingStatus, setSavingStatus] = useState(false)
  const [localNotes, setLocalNotes] = useState(notes)
  const supabase = createClient()
  const router = useRouter()

  const status = caseStatusLabels[currentStatus] || { label: currentStatus, color: 'bg-slate-100 text-slate-600' }

  async function updateStatus(newStatus: string) {
    setSavingStatus(true)
    const { error } = await supabase
      .from('immigrants')
      .update({ case_status: newStatus })
      .eq('id', immigrant.id)

    if (!error) {
      setCurrentStatus(newStatus)
      router.refresh()
    }
    setSavingStatus(false)
  }

  async function addNote() {
    if (!newNote.trim()) return
    setSavingNote(true)

    const { data, error } = await supabase
      .from('case_notes')
      .insert({
        immigrant_id: immigrant.id,
        lawyer_id: lawyerId,
        content: newNote.trim(),
        is_private: true,
      })
      .select()
      .single()

    if (!error && data) {
      setLocalNotes([data, ...localNotes])
      setNewNote('')
    }
    setSavingNote(false)
  }

  async function openDocument(fileUrl: string) {
    if (isAbsoluteUrl(fileUrl)) {
      window.open(fileUrl, '_blank', 'noopener,noreferrer')
      return
    }

    const { data, error } = await supabase.storage
      .from(documentsBucket)
      .createSignedUrl(fileUrl, 60 * 10)

    if (!error && data?.signedUrl) {
      window.open(data.signedUrl, '_blank', 'noopener,noreferrer')
    }
  }

  return (
    <div className="space-y-6">
      {/* Back button + header */}
      <div>
        <Link
          href="/lawyer/immigrants"
          className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-brand-700 mb-4 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver a expedientes
        </Link>

        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-brand-100 flex items-center justify-center text-brand-700 font-bold text-xl">
              {immigrant.full_name?.charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">{immigrant.full_name}</h1>
              <p className="text-slate-500">{immigrant.nationality} · {immigrant.email}</p>
            </div>
          </div>
          <div className="sm:ml-auto flex items-center gap-3">
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${status.color}`}>
              {status.label}
            </span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-slate-200">
        {[
          { id: 'overview', label: 'Resumen', icon: User },
          { id: 'documents', label: `Documentos (${documents.length})`, icon: FileText },
          { id: 'notes', label: `Notas (${localNotes.length})`, icon: MessageSquare },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === tab.id
                ? 'border-brand-600 text-brand-700'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === 'overview' && (
        <div className="grid md:grid-cols-2 gap-6">
          {/* Personal info */}
          <div className="bg-white rounded-2xl border border-slate-100 p-6 space-y-4">
            <h3 className="font-semibold text-slate-900">Información personal</h3>
            {[
              { label: 'Nombre completo', value: immigrant.full_name, icon: User },
              { label: 'Correo electrónico', value: immigrant.email, icon: MessageSquare },
              { label: 'Teléfono', value: immigrant.phone || 'No indicado', icon: MessageSquare },
              { label: 'Nacionalidad', value: immigrant.nationality, icon: Globe },
              { label: 'Nº de pasaporte', value: immigrant.passport_number || 'No indicado', icon: FileText },
              { label: 'Alta en la plataforma', value: formatDate(immigrant.created_at), icon: Calendar },
            ].map((field) => (
              <div key={field.label} className="flex gap-3">
                <field.icon className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
                <div>
                  <div className="text-xs text-slate-400">{field.label}</div>
                  <div className="text-sm text-slate-900 font-medium">{field.value}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Case management */}
          <div className="bg-white rounded-2xl border border-slate-100 p-6 space-y-4">
            <h3 className="font-semibold text-slate-900">Gestión del caso</h3>
            <div>
              <label className="block text-xs text-slate-400 mb-2">Estado actual del expediente</label>
              <div className="flex gap-2">
                <select
                  value={currentStatus}
                  onChange={(e) => updateStatus(e.target.value)}
                  disabled={savingStatus}
                  className="flex-1 text-sm border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-600 bg-white"
                >
                  {STATUS_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
                {savingStatus && (
                  <div className="flex items-center justify-center w-10">
                    <svg className="animate-spin h-4 w-4 text-brand-600" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className="block text-xs text-slate-400 mb-1">Domicilio en España</label>
              <p className="text-sm text-slate-900">{immigrant.address_in_spain || 'No indicado'}</p>
            </div>

            <div>
              <label className="block text-xs text-slate-400 mb-1">Fecha de nacimiento</label>
              <p className="text-sm text-slate-900">
                {immigrant.date_of_birth ? formatDate(immigrant.date_of_birth) : 'No indicada'}
              </p>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'documents' && (
        <div className="bg-white rounded-2xl border border-slate-100">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-semibold text-slate-900">Documentos del expediente</h3>
          </div>
          {documents.length === 0 ? (
            <div className="py-16 text-center">
              <FileText className="w-12 h-12 text-slate-200 mx-auto mb-4" />
              <p className="text-slate-400 font-medium">No hay documentos subidos aún</p>
              <p className="text-sm text-slate-300 mt-1">El inmigrante puede subir documentos desde su portal</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-50">
              {documents.map((doc) => (
                <div key={doc.id} className="flex items-center gap-4 px-6 py-4">
                  <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                    <FileText className="w-4 h-4 text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-slate-900 text-sm">{doc.file_name}</div>
                    <div className="text-xs text-slate-400">{doc.document_type} · {formatDate(doc.uploaded_at)}</div>
                  </div>
                  <button
                    type="button"
                    onClick={() => openDocument(doc.file_url)}
                    className="text-sm text-brand-600 hover:text-brand-800 font-medium transition-colors"
                  >
                    Ver
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'notes' && (
        <div className="space-y-4">
          {/* Add note */}
          <div className="bg-white rounded-2xl border border-slate-100 p-6">
            <h3 className="font-semibold text-slate-900 mb-3">Añadir nota privada</h3>
            <textarea
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              placeholder="Escribe una nota sobre este expediente (solo visible para ti)..."
              rows={3}
              className="w-full text-sm border border-slate-300 rounded-lg px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand-600 resize-none"
            />
            <div className="flex justify-end mt-3">
              <button
                onClick={addNote}
                disabled={savingNote || !newNote.trim()}
                className="flex items-center gap-2 px-4 py-2 bg-brand-700 hover:bg-brand-800 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {savingNote ? (
                  <svg className="animate-spin h-3.5 w-3.5" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                ) : (
                  <Save className="w-3.5 h-3.5" />
                )}
                Guardar nota
              </button>
            </div>
          </div>

          {/* Notes list */}
          {localNotes.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-100 py-12 text-center">
              <MessageSquare className="w-10 h-10 text-slate-200 mx-auto mb-3" />
              <p className="text-slate-400 text-sm">No hay notas aún</p>
            </div>
          ) : (
            <div className="space-y-3">
              {localNotes.map((note) => (
                <div key={note.id} className="bg-white rounded-xl border border-slate-100 p-5">
                  <p className="text-sm text-slate-700 leading-relaxed">{note.content}</p>
                  <p className="text-xs text-slate-400 mt-3">{formatDate(note.created_at)}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
