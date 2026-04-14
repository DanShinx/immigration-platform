'use client'

import Link from 'next/link'
import {
  AlertCircle,
  ArrowRight,
  CheckCircle,
  Clock,
  FileText,
  Mail,
  MapPin,
  Phone,
  Shield,
  User,
} from 'lucide-react'
import { getDocumentTypeLabel } from '@/lib/documents'
import { formatDate, getCaseStatusMeta } from '@/lib/utils'
import { useI18n } from '@/components/LanguageProvider'

interface ImmigrantRecord {
  id: string
  full_name: string
  email: string
  nationality: string
  phone?: string | null
  date_of_birth?: string | null
  address_in_spain?: string | null
  passport_number?: string | null
  case_status: string
  created_at: string
}

interface LawyerRecord {
  full_name: string
  email: string
  phone?: string | null
  specialization?: string | null
  bar_association?: string | null
}

interface DocumentRecord {
  id: string
  document_type: string
  file_name: string
  uploaded_at: string
}

interface Props {
  immigrant: ImmigrantRecord | null
  lawyer: LawyerRecord | null
  documents: DocumentRecord[]
}

function StatusTimeline({
  status,
  labels,
}: {
  status: string
  labels: {
    registered: string
    review: string
    documents: string
    submitted: string
    resolved: string
  }
}) {
  const steps = [
    { id: 'pending', label: labels.registered },
    { id: 'in_review', label: labels.review },
    { id: 'documents_required', label: labels.documents },
    { id: 'submitted', label: labels.submitted },
    { id: 'approved', label: labels.resolved },
  ]

  const order = ['pending', 'in_review', 'documents_required', 'submitted', 'approved', 'rejected']
  const currentIndex = order.indexOf(status)

  return (
    <div className="flex items-center gap-0 mt-5">
      {steps.map((step, index) => {
        const stepIndex = order.indexOf(step.id)
        const isDone = currentIndex > stepIndex
        const isCurrent = currentIndex === stepIndex

        return (
          <div key={step.id} className="flex items-center flex-1">
            <div className="flex flex-col items-center gap-1.5">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
                  isDone
                    ? 'bg-green-500 border-green-500 text-white'
                    : isCurrent
                    ? 'bg-brand-700 border-brand-700 text-white'
                    : 'bg-white border-slate-200 text-slate-300'
                }`}
              >
                {isDone ? (
                  <CheckCircle className="w-4 h-4" />
                ) : isCurrent ? (
                  <Clock className="w-4 h-4" />
                ) : (
                  <div className="w-2 h-2 rounded-full bg-current" />
                )}
              </div>
              <span
                className={`text-xs font-medium ${
                  isCurrent
                    ? 'text-brand-700'
                    : isDone
                    ? 'text-green-600'
                    : 'text-slate-400'
                }`}
              >
                {step.label}
              </span>
            </div>
            {index < steps.length - 1 && (
              <div className={`flex-1 h-0.5 mb-5 ${isDone ? 'bg-green-400' : 'bg-slate-200'}`} />
            )}
          </div>
        )
      })}
    </div>
  )
}

function getNextStepMessage(
  status: string | null | undefined,
  nextSteps: {
    pending: string
    in_review: string
    documents_required: string
    submitted: string
    approved: string
    rejected: string
    default: string
  }
) {
  switch (status) {
    case 'pending':
      return nextSteps.pending
    case 'in_review':
      return nextSteps.in_review
    case 'documents_required':
      return nextSteps.documents_required
    case 'submitted':
      return nextSteps.submitted
    case 'approved':
      return nextSteps.approved
    case 'rejected':
      return nextSteps.rejected
    default:
      return nextSteps.default
  }
}

export default function ImmigrantMyCaseClient({ immigrant, lawyer, documents }: Props) {
  const { locale, messages } = useI18n()
  const status = immigrant ? getCaseStatusMeta(immigrant.case_status, locale) : null
  const uploadedDocuments = documents.length
  const fields = messages.immigrantMyCase.fields

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">{messages.immigrantMyCase.title}</h1>
        <p className="text-slate-500 mt-1">{messages.immigrantMyCase.subtitle}</p>
      </div>

      {immigrant ? (
        <div className="bg-white rounded-2xl border border-slate-100 p-6">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
            <div>
              <h2 className="font-semibold text-slate-900">
                {messages.immigrantMyCase.casePrefix} #{immigrant.id.slice(0, 8).toUpperCase()}
              </h2>
              <p className="text-sm text-slate-500 mt-1">
                {messages.immigrantMyCase.createdOn} {formatDate(immigrant.created_at, locale)}
              </p>
            </div>
            {status && (
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium w-fit ${status.color}`}>
                {status.label}
              </span>
            )}
          </div>

          {immigrant.case_status !== 'rejected' ? (
            <StatusTimeline status={immigrant.case_status} labels={messages.immigrantMyCase.timeline} />
          ) : (
            <div className="mt-5 p-4 bg-red-50 rounded-xl flex gap-3">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-red-700">{messages.immigrantMyCase.rejectedTitle}</p>
                <p className="text-sm text-red-600 mt-0.5">{messages.immigrantMyCase.rejectedBody}</p>
              </div>
            </div>
          )}

          <div className="mt-6 p-4 bg-slate-50 rounded-xl">
            <div className="text-sm font-medium text-slate-900">{messages.immigrantMyCase.whatNow}</div>
            <p className="text-sm text-slate-600 mt-1">
              {getNextStepMessage(immigrant.case_status, messages.immigrantMyCase.nextSteps)}
            </p>
          </div>
        </div>
      ) : (
        <div className="bg-brand-50 rounded-2xl border border-brand-100 p-6">
          <AlertCircle className="w-8 h-8 text-brand-600 mb-3" />
          <h3 className="font-semibold text-brand-900">{messages.immigrantMyCase.setupTitle}</h3>
          <p className="text-sm text-brand-600 mt-1">{messages.immigrantMyCase.setupBody}</p>
        </div>
      )}

      <div className="grid md:grid-cols-3 gap-5">
        <div className="bg-white rounded-2xl border border-slate-100 p-6">
          <div className="text-sm text-slate-500">{messages.immigrantMyCase.stats.uploadedDocuments}</div>
          <div className="text-3xl font-bold text-slate-900 mt-2">{uploadedDocuments}</div>
        </div>
        <div className="bg-white rounded-2xl border border-slate-100 p-6">
          <div className="text-sm text-slate-500">{messages.immigrantMyCase.stats.assignedLawyer}</div>
          <div className="text-lg font-semibold text-slate-900 mt-2">
            {lawyer ? lawyer.full_name : messages.shared.placeholders.pending}
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-slate-100 p-6">
          <div className="text-sm text-slate-500">{messages.immigrantMyCase.stats.currentStatus}</div>
          <div className="text-lg font-semibold text-slate-900 mt-2">
            {status ? status.label : messages.immigrantMyCase.setupTitle}
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-[1.2fr,0.8fr] gap-6">
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-100 p-6">
            <h2 className="font-semibold text-slate-900 mb-4">{messages.immigrantMyCase.caseData}</h2>
            {immigrant ? (
              <div className="grid sm:grid-cols-2 gap-4">
                {[
                  { label: fields.fullName, value: immigrant.full_name, icon: User },
                  { label: fields.email, value: immigrant.email, icon: Mail },
                  { label: fields.phone, value: immigrant.phone || messages.shared.placeholders.unavailable, icon: Phone },
                  { label: fields.nationality, value: immigrant.nationality, icon: Shield },
                  { label: fields.passport, value: immigrant.passport_number || messages.shared.placeholders.unavailable, icon: FileText },
                  {
                    label: fields.birthDate,
                    value: immigrant.date_of_birth
                      ? formatDate(immigrant.date_of_birth, locale)
                      : messages.shared.placeholders.unavailable,
                    icon: Clock,
                  },
                  { label: fields.address, value: immigrant.address_in_spain || messages.shared.placeholders.unavailable, icon: MapPin },
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
            ) : (
              <p className="text-sm text-slate-500">{messages.immigrantMyCase.noCaseData}</p>
            )}
          </div>

          <div className="bg-white rounded-2xl border border-slate-100 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-slate-900">{messages.immigrantMyCase.caseDocuments}</h2>
              <Link
                href="/immigrant/documents"
                className="text-sm text-brand-600 hover:text-brand-800 font-medium inline-flex items-center gap-1.5"
              >
                {messages.immigrantMyCase.manageDocuments}
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {documents.length === 0 ? (
              <div className="bg-slate-50 rounded-xl p-5">
                <p className="text-sm text-slate-600">{messages.immigrantMyCase.noDocuments}</p>
              </div>
            ) : (
              <div className="space-y-3">
                {documents.slice(0, 5).map((document) => (
                  <div key={document.id} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50">
                    <FileText className="w-4 h-4 text-slate-400 flex-shrink-0" />
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-medium text-slate-800 truncate">{document.file_name}</div>
                      <div className="text-xs text-slate-400">
                        {getDocumentTypeLabel(document.document_type, locale)} · {formatDate(document.uploaded_at, locale)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-100 p-6">
            <h2 className="font-semibold text-slate-900 mb-4">{messages.immigrantMyCase.yourLawyer}</h2>
            {lawyer ? (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-brand-700 flex items-center justify-center text-white font-bold text-lg">
                    {lawyer.full_name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="font-semibold text-slate-900">{lawyer.full_name}</div>
                    <div className="text-sm text-slate-500">
                      {lawyer.specialization || messages.immigrantMyCase.defaultSpecialization}
                    </div>
                  </div>
                </div>
                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <div className="text-sm text-slate-600">
                    <span className="text-slate-400">{fields.email}:</span> {lawyer.email}
                  </div>
                  {lawyer.phone && (
                    <div className="text-sm text-slate-600">
                      <span className="text-slate-400">{fields.phone}:</span> {lawyer.phone}
                    </div>
                  )}
                  {lawyer.bar_association && (
                    <div className="text-sm text-slate-600">
                      <span className="text-slate-400">{fields.barAssociation}:</span> {lawyer.bar_association}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-slate-50 rounded-xl p-5">
                <p className="text-sm text-slate-600">{messages.immigrantMyCase.noLawyer}</p>
              </div>
            )}
          </div>

          <div className="bg-white rounded-2xl border border-slate-100 p-6">
            <h2 className="font-semibold text-slate-900 mb-4">{messages.immigrantMyCase.recommendedActions}</h2>
            <div className="space-y-3">
              <Link
                href="/immigrant/documents"
                className="flex items-center justify-between rounded-xl border border-slate-200 px-4 py-3 hover:border-brand-300 hover:bg-brand-50 transition-colors"
              >
                <div>
                  <div className="text-sm font-medium text-slate-900">{messages.immigrantMyCase.reviewDocuments}</div>
                  <div className="text-xs text-slate-500 mt-0.5">{messages.immigrantMyCase.reviewDocumentsBody}</div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400" />
              </Link>
              <Link
                href="/immigrant/dashboard"
                className="flex items-center justify-between rounded-xl border border-slate-200 px-4 py-3 hover:border-brand-300 hover:bg-brand-50 transition-colors"
              >
                <div>
                  <div className="text-sm font-medium text-slate-900">{messages.immigrantMyCase.backToDashboard}</div>
                  <div className="text-xs text-slate-500 mt-0.5">{messages.immigrantMyCase.backToDashboardBody}</div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
