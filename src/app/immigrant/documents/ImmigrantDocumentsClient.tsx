'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { AlertCircle, Eye, FileText, Shield, Trash2, Upload } from 'lucide-react'
import { useI18n } from '@/components/LanguageProvider'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { createClient } from '@/lib/supabase/client'
import {
  buildDocumentStoragePath,
  getDocumentTypeLabel,
  getDocumentTypeOptions,
  documentsBucket,
  formatFileSize,
  getStoragePathFromFileUrl,
  isAbsoluteUrl,
} from '@/lib/documents'
import { formatDate } from '@/lib/utils'

interface DocumentRecord {
  id: string
  immigrant_id: string
  document_type: string
  file_name: string
  file_url: string
  uploaded_at: string
  notes?: string | null
  file_size?: number | null
}

interface ImmigrantRecord {
  id: string
  assigned_lawyer_id?: string | null
}

interface Props {
  immigrant: ImmigrantRecord | null
  documents: DocumentRecord[]
}

const ACCEPTED_FILE_TYPES = '.pdf,.png,.jpg,.jpeg,.doc,.docx'

export default function ImmigrantDocumentsClient({ immigrant, documents }: Props) {
  const router = useRouter()
  const supabase = createClient()
  const { messages, locale } = useI18n()
  const t = messages.immigrantDocuments

  const documentTypeOptions = useMemo(() => getDocumentTypeOptions(locale), [locale])

  const [selectedType, setSelectedType] = useState<string>(documentTypeOptions[0].value)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [fileInputKey, setFileInputKey] = useState(0)
  const [notes, setNotes] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [activeDocumentId, setActiveDocumentId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const hasAssignedLawyer = Boolean(immigrant?.assigned_lawyer_id)

  const stats = useMemo(() => {
    const totalDocuments = documents.length
    const lastUpload = documents[0]?.uploaded_at
    const uniqueTypes = new Set(documents.map((document) => document.document_type)).size

    return {
      totalDocuments,
      uniqueTypes,
      lastUpload,
    }
  }, [documents])

  async function openDocument(fileUrl: string, documentId?: string) {
    setError(null)
    setSuccessMessage(null)
    setActiveDocumentId(documentId || null)

    try {
      if (isAbsoluteUrl(fileUrl)) {
        window.open(fileUrl, '_blank', 'noopener,noreferrer')
        return
      }

      const { data, error: signedUrlError } = await supabase.storage
        .from(documentsBucket)
        .createSignedUrl(fileUrl, 60 * 10)

      if (signedUrlError || !data?.signedUrl) {
        throw new Error(t.errors.open)
      }

      window.open(data.signedUrl, '_blank', 'noopener,noreferrer')
    } catch (err) {
      setError(err instanceof Error ? err.message : t.errors.open)
    } finally {
      setActiveDocumentId(null)
    }
  }

  async function handleUpload(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!immigrant) {
      setError(t.errors.noCase)
      return
    }

    if (!selectedFile) {
      setError(t.errors.noFile)
      return
    }

    setSubmitting(true)
    setError(null)
    setSuccessMessage(null)

    try {
      const storagePath = buildDocumentStoragePath(immigrant.id, selectedFile.name)

      const { error: uploadError } = await supabase.storage
        .from(documentsBucket)
        .upload(storagePath, selectedFile, {
          cacheControl: '3600',
          upsert: false,
        })

      if (uploadError) {
        throw new Error(
          uploadError.message.includes('Bucket not found')
            ? `${t.errors.missingBucketPrefix} "${documentsBucket}" in Supabase Storage.`
            : uploadError.message
        )
      }

      const { error: insertError } = await supabase
        .from('case_documents')
        .insert({
          immigrant_id: immigrant.id,
          document_type: selectedType,
          file_name: selectedFile.name,
          file_url: storagePath,
          uploaded_at: new Date().toISOString(),
          notes: notes.trim() || null,
        })

      if (insertError) {
        await supabase.storage.from(documentsBucket).remove([storagePath])
        throw new Error(insertError.message)
      }

      setSelectedFile(null)
      setFileInputKey((currentKey) => currentKey + 1)
      setNotes('')
      setSelectedType(documentTypeOptions[0].value)
      setSuccessMessage(t.successUpload)
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : t.errors.upload)
    } finally {
      setSubmitting(false)
    }
  }

  async function handleDelete(document: DocumentRecord) {
    const confirmed = window.confirm(`${t.errors.confirmDelete} "${document.file_name}"?`)
    if (!confirmed) return

    setActiveDocumentId(document.id)
    setError(null)
    setSuccessMessage(null)

    try {
      const storagePath = getStoragePathFromFileUrl(document.file_url)

      if (storagePath) {
        await supabase.storage.from(documentsBucket).remove([storagePath])
      }

      const { error: deleteError } = await supabase
        .from('case_documents')
        .delete()
        .eq('id', document.id)

      if (deleteError) {
        throw new Error(deleteError.message)
      }

      setSuccessMessage(t.successDelete)
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : t.errors.delete)
    } finally {
      setActiveDocumentId(null)
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{t.title}</h1>
          <p className="text-slate-500 mt-1">{t.subtitle}</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-slate-500 bg-white border border-slate-200 rounded-xl px-4 py-3">
          <Shield className="w-4 h-4 text-brand-600" />
          {t.privacy}
        </div>
      </div>

      {!immigrant && (
        <div className="bg-brand-50 border border-brand-100 rounded-2xl p-6">
          <AlertCircle className="w-6 h-6 text-brand-700 mb-3" />
          <h2 className="font-semibold text-brand-900">{t.setupTitle}</h2>
          <p className="text-sm text-brand-700 mt-1">{t.setupBody}</p>
        </div>
      )}

      {immigrant && !hasAssignedLawyer && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6">
          <AlertCircle className="w-6 h-6 text-amber-600 mb-3" />
          <h2 className="font-semibold text-amber-900">{t.noLawyerTitle}</h2>
          <p className="text-sm text-amber-700 mt-1">{t.noLawyerBody}</p>
        </div>
      )}

      {error && <div className="bg-red-50 border border-red-200 rounded-2xl p-4 text-sm text-red-700">{error}</div>}
      {successMessage && <div className="bg-green-50 border border-green-200 rounded-2xl p-4 text-sm text-green-700">{successMessage}</div>}

      <div className="grid md:grid-cols-3 gap-5">
        <div className="bg-white rounded-2xl border border-slate-100 p-6">
          <div className="text-sm text-slate-500">{t.stats.uploaded}</div>
          <div className="text-3xl font-bold text-slate-900 mt-2">{stats.totalDocuments}</div>
        </div>
        <div className="bg-white rounded-2xl border border-slate-100 p-6">
          <div className="text-sm text-slate-500">{t.stats.types}</div>
          <div className="text-3xl font-bold text-slate-900 mt-2">{stats.uniqueTypes}</div>
        </div>
        <div className="bg-white rounded-2xl border border-slate-100 p-6">
          <div className="text-sm text-slate-500">{t.stats.lastUpload}</div>
          <div className="text-lg font-semibold text-slate-900 mt-2">
            {stats.lastUpload ? formatDate(stats.lastUpload, locale) : messages.shared.placeholders.noDocuments}
          </div>
        </div>
      </div>

      <div className="grid xl:grid-cols-[420px,1fr] gap-6">
        <div className="bg-white rounded-2xl border border-slate-100 p-6 h-fit">
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
                className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-600 focus:border-transparent transition-all"
              >
                {documentTypeOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <Input
              key={fileInputKey}
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
                className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-600 focus:border-transparent transition-all resize-none"
              />
            </div>

            <Button type="submit" loading={submitting} disabled={!immigrant || !selectedFile}>
              {t.uploadCard.submit}
            </Button>
          </form>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
          <div className="px-6 py-5 border-b border-slate-100">
            <h2 className="font-semibold text-slate-900">{t.library.title}</h2>
            <p className="text-sm text-slate-500 mt-1">{t.library.subtitle}</p>
          </div>

          {documents.length === 0 ? (
            <div className="py-20 px-6 text-center">
              <FileText className="w-12 h-12 text-slate-200 mx-auto mb-4" />
              <p className="text-slate-500 font-medium">{t.library.emptyTitle}</p>
              <p className="text-sm text-slate-400 mt-1">{t.library.emptyBody}</p>
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
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                        <h3 className="font-medium text-slate-900 truncate">{document.file_name}</h3>
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700 w-fit">
                          {getDocumentTypeLabel(document.document_type, locale)}
                        </span>
                      </div>
                      <div className="text-sm text-slate-500 mt-1 flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4">
                        <span>{t.library.uploadedOn} {formatDate(document.uploaded_at, locale)}</span>
                        {document.file_size ? <span>{formatFileSize(document.file_size, locale)}</span> : null}
                      </div>
                      {document.notes && <p className="text-sm text-slate-600 mt-2">{document.notes}</p>}
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
    </div>
  )
}
