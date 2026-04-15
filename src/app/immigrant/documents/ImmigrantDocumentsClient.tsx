'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Eye, FileText, Shield, Trash2, Upload } from 'lucide-react'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { useI18n } from '@/components/LanguageProvider'
import { createClient } from '@/lib/supabase/client'
import { getCaseContent } from '@/lib/case-content'
import { getCaseTrackMeta } from '@/lib/cases'
import {
  buildDocumentStoragePath,
  documentsBucket,
  formatFileSize,
  getDocumentTypeLabel,
  getDocumentTypeOptions,
  getStoragePathFromFileUrl,
  isAbsoluteUrl,
} from '@/lib/documents'
import { formatDate } from '@/lib/utils'

interface CaseOption {
  id: string
  title: string
  track_code: string
}

interface DocumentRecord {
  id: string
  case_id?: string | null
  immigrant_id: string
  document_type: string
  file_name: string
  file_url: string
  uploaded_at: string
  notes?: string | null
  file_size?: number | null
}

interface Props {
  cases: CaseOption[]
  currentCaseId: string | null
  documents: DocumentRecord[]
  immigrantId: string
}

const ACCEPTED_FILE_TYPES = '.pdf,.png,.jpg,.jpeg,.doc,.docx'

export default function ImmigrantDocumentsClient({
  cases,
  currentCaseId,
  documents,
  immigrantId,
}: Props) {
  const router = useRouter()
  const supabase = createClient()
  const { locale, messages } = useI18n()
  const copy = getCaseContent(locale)
  const t = messages.immigrantDocuments

  const documentTypeOptions = useMemo(() => getDocumentTypeOptions(locale), [locale])
  const currentCase = cases.find((caseItem) => caseItem.id === currentCaseId) || null

  const [selectedType, setSelectedType] = useState<string>(documentTypeOptions[0]?.value || 'passport')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [notes, setNotes] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [activeDocumentId, setActiveDocumentId] = useState<string | null>(null)
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

  async function openDocument(fileUrl: string, documentId: string) {
    setActiveDocumentId(documentId)

    try {
      if (isAbsoluteUrl(fileUrl)) {
        window.open(fileUrl, '_blank', 'noopener,noreferrer')
        return
      }

      const { data } = await supabase.storage.from(documentsBucket).createSignedUrl(fileUrl, 60 * 10)
      if (data?.signedUrl) {
        window.open(data.signedUrl, '_blank', 'noopener,noreferrer')
      }
    } finally {
      setActiveDocumentId(null)
    }
  }

  async function handleUpload(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!currentCaseId || !selectedFile) return

    setSubmitting(true)
    setFeedback(null)

    const storagePath = buildDocumentStoragePath(currentCaseId, selectedFile.name)

    const { error: uploadError } = await supabase.storage
      .from(documentsBucket)
      .upload(storagePath, selectedFile, {
        cacheControl: '3600',
        upsert: false,
      })

    if (uploadError) {
      setSubmitting(false)
      setFeedback({ type: 'error', message: t.errors.upload })
      return
    }

    const { error: insertError } = await supabase.from('case_documents').insert({
      immigrant_id: immigrantId,
      case_id: currentCaseId,
      document_type: selectedType,
      file_name: selectedFile.name,
      file_url: storagePath,
      uploaded_at: new Date().toISOString(),
      notes: notes.trim() || null,
      file_size: selectedFile.size,
    })

    if (insertError) {
      await supabase.storage.from(documentsBucket).remove([storagePath])
      setSubmitting(false)
      setFeedback({ type: 'error', message: insertError.message })
      return
    }

    setSubmitting(false)
    setSelectedFile(null)
    setNotes('')
    setFeedback({ type: 'success', message: t.successUpload })
    router.refresh()
  }

  async function handleDelete(document: DocumentRecord) {
    setActiveDocumentId(document.id)
    setFeedback(null)

    const storagePath = getStoragePathFromFileUrl(document.file_url)
    if (storagePath) {
      await supabase.storage.from(documentsBucket).remove([storagePath])
    }

    const { error } = await supabase.from('case_documents').delete().eq('id', document.id)
    setActiveDocumentId(null)

    if (error) {
      setFeedback({ type: 'error', message: t.errors.delete })
      return
    }

    setFeedback({ type: 'success', message: t.successDelete })
    router.refresh()
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{t.title}</h1>
          <p className="text-slate-500 mt-1">{t.subtitle}</p>
        </div>
        <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-500">
          <Shield className="w-4 h-4 text-brand-600" />
          {t.privacy}
        </div>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-6">
        <label className="block text-sm font-medium text-slate-700 mb-1.5">Case</label>
        <select
          value={currentCaseId || ''}
          onChange={(event) => {
            const value = event.target.value
            router.push(value ? `/immigrant/documents?case=${value}` : '/immigrant/documents')
          }}
          className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-600"
        >
          <option value="">Select a case</option>
          {cases.map((caseItem) => (
            <option key={caseItem.id} value={caseItem.id}>
              {caseItem.title}
            </option>
          ))}
        </select>
        {currentCase ? (
          <p className="text-sm text-slate-500 mt-3">
            {getCaseTrackMeta(currentCase.track_code as any, locale).title}
          </p>
        ) : null}
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

      {!currentCaseId ? (
        <div className="rounded-3xl border border-brand-200 bg-brand-50 p-6">
          <h2 className="font-semibold text-brand-900">{copy.caseDetail.noDocuments}</h2>
          <p className="text-sm text-brand-700 mt-2">{copy.immigrantDashboard.startNewCase}</p>
        </div>
      ) : (
        <div className="grid xl:grid-cols-[420px,1fr] gap-6">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 h-fit">
            <div className="flex items-center gap-2 mb-2">
              <Upload className="w-4 h-4 text-brand-600" />
              <h2 className="font-semibold text-slate-900">{t.uploadCard.title}</h2>
            </div>
            <p className="text-sm text-slate-500 mb-6">{t.uploadCard.subtitle}</p>

            <form onSubmit={handleUpload} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  {t.uploadCard.documentType}
                </label>
                <select
                  value={selectedType}
                  onChange={(event) => setSelectedType(event.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-600"
                >
                  {documentTypeOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <Input
                type="file"
                accept={ACCEPTED_FILE_TYPES}
                label={t.uploadCard.file}
                onChange={(event) => setSelectedFile(event.target.files?.[0] || null)}
                helperText={selectedFile ? formatFileSize(selectedFile.size, locale) : t.uploadCard.fileHelper}
              />

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  {t.uploadCard.note}
                </label>
                <textarea
                  rows={4}
                  value={notes}
                  onChange={(event) => setNotes(event.target.value)}
                  placeholder={t.uploadCard.notePlaceholder}
                  className="w-full rounded-2xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-600 resize-none"
                />
              </div>

              <Button type="submit" loading={submitting} disabled={!selectedFile}>
                {t.uploadCard.submit}
              </Button>
            </form>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-100">
              <h2 className="font-semibold text-slate-900">{copy.caseDetail.documents}</h2>
              <p className="text-sm text-slate-500 mt-1">{documents.length} files in this case</p>
            </div>

            {documents.length === 0 ? (
              <div className="py-20 px-6 text-center">
                <FileText className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                <p className="text-slate-500 font-medium">{copy.caseDetail.noDocuments}</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-50">
                {documents.map((document) => {
                  const isBusy = activeDocumentId === document.id

                  return (
                    <div key={document.id} className="px-6 py-5 flex flex-col lg:flex-row lg:items-center gap-4">
                      <div className="w-11 h-11 rounded-2xl bg-brand-50 flex items-center justify-center flex-shrink-0">
                        <FileText className="w-5 h-5 text-brand-700" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-slate-900">{document.file_name}</div>
                        <div className="text-sm text-slate-500 mt-1">
                          {getDocumentTypeLabel(document.document_type, locale)} · {formatDate(document.uploaded_at, locale)}
                        </div>
                        {document.notes ? <p className="text-sm text-slate-600 mt-2">{document.notes}</p> : null}
                      </div>

                      <div className="flex items-center gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          disabled={isBusy}
                          onClick={() => openDocument(document.file_url, document.id)}
                        >
                          <Eye className="w-4 h-4" />
                          {messages.shared.actions.view}
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          disabled={isBusy}
                          onClick={() => handleDelete(document)}
                          className="text-red-600 hover:bg-red-50 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                          {messages.shared.actions.delete}
                        </Button>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
