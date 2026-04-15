'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { Eye, FileText, Filter, Search, Shield, Users } from 'lucide-react'
import Button from '@/components/ui/Button'
import { createClient } from '@/lib/supabase/client'
import { useI18n } from '@/components/LanguageProvider'
import { getCaseStageMeta, getCaseTrackMeta } from '@/lib/cases'
import {
  documentsBucket,
  getDocumentTypeLabel,
  getDocumentTypeOptions,
  isAbsoluteUrl,
} from '@/lib/documents'
import { formatDate } from '@/lib/utils'

interface DocumentRecord {
  id: string
  case_id?: string | null
  immigrant_id: string
  document_type: string
  file_name: string
  file_url: string
  uploaded_at: string
  notes?: string | null
}

interface CaseRecord {
  id: string
  title: string
  track_code: string
  stage: string
  immigrant_id: string
}

interface ImmigrantRecord {
  id: string
  full_name: string
  email: string
  nationality: string
}

interface Props {
  documents: DocumentRecord[]
  cases: CaseRecord[]
  immigrants: ImmigrantRecord[]
}

export default function LawyerDocumentsClient({ documents, cases, immigrants }: Props) {
  const supabase = createClient()
  const [search, setSearch] = useState('')
  const [selectedCaseId, setSelectedCaseId] = useState('')
  const [activeDocumentId, setActiveDocumentId] = useState<string | null>(null)
  const [selectedType, setSelectedType] = useState('')
  const { messages, locale } = useI18n()

  const caseMap = useMemo(() => new Map(cases.map((caseItem) => [caseItem.id, caseItem])), [cases])
  const immigrantMap = useMemo(
    () => new Map(immigrants.map((immigrant) => [immigrant.id, immigrant])),
    [immigrants]
  )

  const documentTypeOptions = useMemo(
    () =>
      getDocumentTypeOptions(locale).filter((option) =>
        documents.some((document) => document.document_type === option.value)
      ),
    [documents, locale]
  )

  const filteredDocuments = useMemo(() => {
    return documents.filter((document) => {
      const caseItem = document.case_id ? caseMap.get(document.case_id) : null
      const immigrant = immigrantMap.get(document.immigrant_id)
      const normalizedSearch = search.trim().toLowerCase()

      const matchesSearch =
        !normalizedSearch ||
        document.file_name.toLowerCase().includes(normalizedSearch) ||
        caseItem?.title?.toLowerCase().includes(normalizedSearch) ||
        immigrant?.full_name?.toLowerCase().includes(normalizedSearch) ||
        immigrant?.email?.toLowerCase().includes(normalizedSearch) ||
        immigrant?.nationality?.toLowerCase().includes(normalizedSearch)

      const matchesCase = !selectedCaseId || document.case_id === selectedCaseId
      const matchesType = !selectedType || document.document_type === selectedType

      return matchesSearch && matchesCase && matchesType
    })
  }, [documents, caseMap, immigrantMap, search, selectedCaseId, selectedType])

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

  return (
    <div className="space-y-8">
      <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{messages.lawyerDocuments.title}</h1>
          <p className="text-slate-500 mt-1">{messages.lawyerDocuments.subtitle}</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-slate-500 bg-white border border-slate-200 rounded-xl px-4 py-3">
          <Shield className="w-4 h-4 text-brand-600" />
          {messages.lawyerDocuments.privacy}
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 p-4 sm:p-5">
        <div className="grid lg:grid-cols-[1fr,240px,220px] gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder={messages.lawyerDocuments.filters.search}
              className="w-full pl-10 pr-4 py-2.5 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-600 bg-white"
            />
          </div>

          <div className="relative">
            <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            <select
              value={selectedCaseId}
              onChange={(event) => setSelectedCaseId(event.target.value)}
              className="w-full pl-10 pr-8 py-2.5 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-600 bg-white appearance-none"
            >
              <option value="">All cases</option>
              {cases.map((caseItem) => (
                <option key={caseItem.id} value={caseItem.id}>
                  {caseItem.title}
                </option>
              ))}
            </select>
          </div>

          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            <select
              value={selectedType}
              onChange={(event) => setSelectedType(event.target.value)}
              className="w-full pl-10 pr-8 py-2.5 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-600 bg-white appearance-none"
            >
              <option value="">{messages.lawyerDocuments.filters.allTypes}</option>
              {documentTypeOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {filteredDocuments.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-100 py-20 text-center">
          <FileText className="w-12 h-12 text-slate-200 mx-auto mb-4" />
          <p className="text-slate-500 font-medium">
            {documents.length === 0
              ? messages.lawyerDocuments.empty.noDocuments
              : messages.lawyerDocuments.empty.noMatches}
          </p>
          <p className="text-sm text-slate-400 mt-1">
            {documents.length === 0
              ? messages.lawyerDocuments.empty.noDocumentsBody
              : messages.lawyerDocuments.empty.noMatchesBody}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
          <div className="divide-y divide-slate-50">
            {filteredDocuments.map((document) => {
              const caseItem = document.case_id ? caseMap.get(document.case_id) : null
              const immigrant = immigrantMap.get(document.immigrant_id)
              const stage = caseItem ? getCaseStageMeta(caseItem.stage, locale) : null
              const track = caseItem ? getCaseTrackMeta(caseItem.track_code as any, locale) : null

              return (
                <div key={document.id} className="px-6 py-5 flex flex-col xl:flex-row xl:items-center gap-4">
                  <div className="w-11 h-11 rounded-2xl bg-brand-50 flex items-center justify-center flex-shrink-0">
                    <FileText className="w-5 h-5 text-brand-700" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                      <h3 className="font-medium text-slate-900">{document.file_name}</h3>
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700 w-fit">
                        {getDocumentTypeLabel(document.document_type, locale)}
                      </span>
                      {stage && (
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium w-fit ${stage.color}`}>
                          {stage.label}
                        </span>
                      )}
                    </div>

                    <div className="text-sm text-slate-500 mt-1 flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4">
                      <span>{immigrant?.full_name || messages.lawyerDocuments.unknownImmigrant}</span>
                      <span>{track?.shortTitle || '—'}</span>
                      <span>{caseItem?.title || '—'}</span>
                      <span>{messages.lawyerDocuments.uploadedOn} {formatDate(document.uploaded_at, locale)}</span>
                    </div>

                    {document.notes && (
                      <p className="text-sm text-slate-600 mt-2">{document.notes}</p>
                    )}
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      disabled={activeDocumentId === document.id}
                      onClick={() => openDocument(document.file_url, document.id)}
                    >
                      <Eye className="w-4 h-4" />
                      {messages.lawyerDocuments.viewFile}
                    </Button>
                    {caseItem && (
                      <Link
                        href={`/lawyer/cases/${caseItem.id}`}
                        className="inline-flex items-center justify-center text-sm px-4 py-2 rounded-lg bg-brand-700 hover:bg-brand-800 text-white transition-colors"
                      >
                        {messages.lawyerDocuments.viewCase}
                      </Link>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
