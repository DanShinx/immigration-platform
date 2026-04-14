'use client'

import { FileText, User, Shield, AlertCircle, CheckCircle, Clock, Upload, Briefcase, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { useI18n } from '@/components/LanguageProvider'
import { formatDate, getCaseStatusMeta } from '@/lib/utils'

interface Props {
  immigrant: any
  lawyer: any
  pendingRequest: any
  recentDocuments: any[]
  userName: string
}

function StatusTimeline({ status, labels }: { status: string; labels: { registered: string; review: string; documents: string; submitted: string; resolved: string } }) {
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
    <div className="flex items-center gap-0 mt-4">
      {steps.map((step, idx) => {
        const stepIndex = order.indexOf(step.id)
        const isDone = currentIndex > stepIndex
        const isCurrent = currentIndex === stepIndex

        return (
          <div key={step.id} className="flex items-center flex-1">
            <div className="flex flex-col items-center gap-1.5">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 border-2 transition-all ${
                isDone
                  ? 'bg-green-500 border-green-500 text-white'
                  : isCurrent
                  ? 'bg-brand-700 border-brand-700 text-white'
                  : 'bg-white border-slate-200 text-slate-300'
              }`}>
                {isDone ? (
                  <CheckCircle className="w-4 h-4" />
                ) : isCurrent ? (
                  <Clock className="w-3.5 h-3.5" />
                ) : (
                  <div className="w-2 h-2 rounded-full bg-current" />
                )}
              </div>
              <span className={`text-xs font-medium ${isCurrent ? 'text-brand-700' : isDone ? 'text-green-600' : 'text-slate-400'}`}>
                {step.label}
              </span>
            </div>
            {idx < steps.length - 1 && (
              <div className={`flex-1 h-0.5 mb-5 ${isDone ? 'bg-green-400' : 'bg-slate-200'}`} />
            )}
          </div>
        )
      })}
    </div>
  )
}

export default function ImmigrantDashboardClient({ immigrant, lawyer, pendingRequest, recentDocuments, userName }: Props) {
  const { messages, locale } = useI18n()
  const hour = new Date().getHours()
  const greeting =
    hour < 12
      ? messages.shared.greetings.morning
      : hour < 20
      ? messages.shared.greetings.afternoon
      : messages.shared.greetings.evening
  const status = immigrant ? getCaseStatusMeta(immigrant.case_status, locale) : null

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">
          {greeting}, {userName.split(' ')[0]} 👋
        </h1>
        <p className="text-slate-500 mt-1">
          {messages.immigrantDashboard.intro}
        </p>
      </div>

      {immigrant ? (
        <div className="bg-white rounded-2xl border border-slate-100 p-6">
          <div className="flex items-center justify-between mb-2">
            <h2 className="font-semibold text-slate-900">{messages.immigrantDashboard.caseTitle}</h2>
            {status && (
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${status.color}`}>
                {status.label}
              </span>
            )}
          </div>
          <p className="text-sm text-slate-500">{messages.immigrantDashboard.caseNumber} #{immigrant.id?.slice(0, 8).toUpperCase()}</p>

          {immigrant.case_status !== 'rejected' && (
            <StatusTimeline status={immigrant.case_status} labels={messages.immigrantDashboard.timeline} />
          )}

          {immigrant.case_status === 'rejected' && (
            <div className="mt-4 p-4 bg-red-50 rounded-xl flex gap-3">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-red-700">{messages.immigrantDashboard.rejectedTitle}</p>
                <p className="text-sm text-red-600 mt-0.5">{messages.immigrantDashboard.rejectedBody}</p>
              </div>
            </div>
          )}

          {immigrant.case_status === 'documents_required' && (
            <div className="mt-4 p-4 bg-orange-50 rounded-xl flex gap-3">
              <AlertCircle className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-orange-700">{messages.immigrantDashboard.docsRequiredTitle}</p>
                <p className="text-sm text-orange-600 mt-0.5">{messages.immigrantDashboard.docsRequiredBody}</p>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-brand-50 rounded-2xl border border-brand-100 p-6">
          <AlertCircle className="w-8 h-8 text-brand-600 mb-3" />
          <h3 className="font-semibold text-brand-900">{messages.immigrantDashboard.setupTitle}</h3>
          <p className="text-sm text-brand-600 mt-1">{messages.immigrantDashboard.setupBody}</p>
        </div>
      )}

      <div className="grid md:grid-cols-3 gap-5">
        <div className="bg-white rounded-2xl border border-slate-100 p-6">
          <div className="text-sm text-slate-500">{messages.immigrantDashboard.lawyerCard}</div>
          <div className="text-lg font-semibold text-slate-900 mt-2">
            {lawyer ? lawyer.full_name : messages.immigrantDashboard.noLawyer}
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-slate-100 p-6">
          <div className="text-sm text-slate-500">{messages.immigrantLawyers.pendingRequest}</div>
          <div className="text-lg font-semibold text-slate-900 mt-2">
            {pendingRequest?.lawyer?.full_name || messages.immigrantLawyers.noPendingRequest}
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-slate-100 p-6">
          <div className="text-sm text-slate-500">{messages.immigrantDashboard.documentsCard}</div>
          <div className="text-3xl font-bold text-slate-900 mt-2">{recentDocuments.length}</div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 p-6">
        <h3 className="font-semibold text-slate-900 mb-4">{messages.immigrantDashboard.quickActionsTitle}</h3>
        <div className="grid md:grid-cols-3 gap-4">
          {[
            {
              href: '/immigrant/lawyers',
              icon: Briefcase,
              title: messages.immigrantDashboard.quickActions.chooseLawyer.title,
              body: messages.immigrantDashboard.quickActions.chooseLawyer.body,
            },
            {
              href: '/immigrant/documents',
              icon: Upload,
              title: messages.immigrantDashboard.quickActions.documents.title,
              body: messages.immigrantDashboard.quickActions.documents.body,
            },
            {
              href: '/immigrant/my-case',
              icon: FileText,
              title: messages.immigrantDashboard.quickActions.case.title,
              body: messages.immigrantDashboard.quickActions.case.body,
            },
          ].map((action) => (
            <Link
              key={action.href}
              href={action.href}
              className="rounded-2xl border border-slate-200 bg-slate-50 p-4 hover:border-brand-300 hover:bg-brand-50 transition-colors"
            >
              <action.icon className="w-5 h-5 text-brand-600 mb-3" />
              <div className="font-semibold text-slate-900">{action.title}</div>
              <div className="text-sm text-slate-500 mt-1">{action.body}</div>
              <div className="inline-flex items-center gap-1 mt-3 text-sm text-brand-600 font-medium">
                {messages.shared.actions.view}
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </Link>
          ))}
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-slate-100 p-6">
          <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <Shield className="w-4 h-4 text-brand-600" />
            {messages.immigrantDashboard.lawyerCard}
          </h3>
          {lawyer ? (
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-brand-700 flex items-center justify-center text-white font-bold text-lg">
                  {lawyer.full_name?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="font-semibold text-slate-900">{lawyer.full_name}</div>
                  <div className="text-sm text-slate-500">
                    {lawyer.specialization || messages.immigrantDashboard.defaultSpecialization}
                  </div>
                </div>
              </div>
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <div className="flex gap-2 text-sm">
                  <span className="text-slate-400 w-16 flex-shrink-0">{messages.immigrantDashboard.fields.email}</span>
                  <span className="text-slate-700">{lawyer.email}</span>
                </div>
                {lawyer.phone && (
                  <div className="flex gap-2 text-sm">
                    <span className="text-slate-400 w-16 flex-shrink-0">{messages.immigrantDashboard.fields.phone}</span>
                    <span className="text-slate-700">{lawyer.phone}</span>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="py-6 text-center">
              <User className="w-10 h-10 text-slate-200 mx-auto mb-3" />
              <p className="text-sm text-slate-400 font-medium">{messages.immigrantDashboard.noLawyer}</p>
              <p className="text-xs text-slate-300 mt-1">{messages.immigrantDashboard.noLawyerBody}</p>
              <Link
                href="/immigrant/lawyers"
                className="inline-flex items-center gap-1.5 mt-3 text-sm text-brand-600 font-medium hover:underline"
              >
                <Shield className="w-3.5 h-3.5" />
                {messages.dashboardLayout.nav.immigrant.lawyers}
              </Link>
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-slate-900 flex items-center gap-2">
              <FileText className="w-4 h-4 text-brand-600" />
              {messages.immigrantDashboard.documentsCard}
            </h3>
            <Link href="/immigrant/documents" className="text-xs text-brand-600 hover:underline font-medium">
              {messages.immigrantDashboard.viewAll}
            </Link>
          </div>

          {recentDocuments.length === 0 ? (
            <div className="py-6 text-center">
              <FileText className="w-10 h-10 text-slate-200 mx-auto mb-3" />
              <p className="text-sm text-slate-400 font-medium">{messages.immigrantDashboard.noDocuments}</p>
              <Link
                href="/immigrant/documents"
                className="inline-flex items-center gap-1.5 mt-3 text-sm text-brand-600 font-medium hover:underline"
              >
                <Upload className="w-3.5 h-3.5" />
                {messages.immigrantDashboard.uploadFirst}
              </Link>
            </div>
          ) : (
            <div className="space-y-2">
              {recentDocuments.map((doc) => (
                <div key={doc.id} className="flex items-center gap-3 p-3 rounded-lg bg-slate-50">
                  <FileText className="w-4 h-4 text-slate-400 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-slate-700 truncate">{doc.file_name}</div>
                    <div className="text-xs text-slate-400">{formatDate(doc.uploaded_at, locale)}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {immigrant && (
        <div className="bg-white rounded-2xl border border-slate-100 p-6">
          <h3 className="font-semibold text-slate-900 mb-4">{messages.immigrantDashboard.myData}</h3>
          <div className="grid sm:grid-cols-3 gap-4">
            {[
              { label: messages.immigrantDashboard.fields.name, value: immigrant.full_name },
              { label: messages.immigrantDashboard.fields.nationality, value: immigrant.nationality },
              { label: messages.immigrantDashboard.fields.email, value: immigrant.email },
              { label: messages.immigrantDashboard.fields.phone, value: immigrant.phone || messages.shared.placeholders.unavailable },
              { label: messages.immigrantDashboard.fields.address, value: immigrant.address_in_spain || messages.shared.placeholders.unavailable },
              { label: messages.immigrantDashboard.fields.passport, value: immigrant.passport_number || messages.shared.placeholders.unavailable },
            ].map((field) => (
              <div key={field.label}>
                <div className="text-xs text-slate-400 mb-0.5">{field.label}</div>
                <div className="text-sm font-medium text-slate-800">{field.value}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
