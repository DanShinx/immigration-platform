'use client'

import { FileText, User, Shield, AlertCircle, CheckCircle, Clock, ArrowRight, Upload } from 'lucide-react'
import Link from 'next/link'
import { caseStatusLabels, formatDate } from '@/lib/utils'

interface Props {
  immigrant: any
  lawyer: any
  recentDocuments: any[]
  userName: string
}

function StatusTimeline({ status }: { status: string }) {
  const steps = [
    { id: 'pending', label: 'Registrado' },
    { id: 'in_review', label: 'En revisión' },
    { id: 'documents_required', label: 'Documentos' },
    { id: 'submitted', label: 'Enviado' },
    { id: 'approved', label: 'Resuelto' },
  ]

  const ORDER = ['pending', 'in_review', 'documents_required', 'submitted', 'approved', 'rejected']
  const currentIndex = ORDER.indexOf(status)

  return (
    <div className="flex items-center gap-0 mt-4">
      {steps.map((step, idx) => {
        const stepIndex = ORDER.indexOf(step.id)
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

export default function ImmigrantDashboardClient({ immigrant, lawyer, recentDocuments, userName }: Props) {
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Buenos días' : hour < 20 ? 'Buenas tardes' : 'Buenas noches'
  const status = immigrant ? caseStatusLabels[immigrant.case_status] : null

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">
          {greeting}, {userName.split(' ')[0]} 👋
        </h1>
        <p className="text-slate-500 mt-1">
          Aquí puedes ver el estado de tu proceso de inmigración en España.
        </p>
      </div>

      {/* Case status card */}
      {immigrant ? (
        <div className="bg-white rounded-2xl border border-slate-100 p-6">
          <div className="flex items-center justify-between mb-2">
            <h2 className="font-semibold text-slate-900">Estado de tu expediente</h2>
            {status && (
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${status.color}`}>
                {status.label}
              </span>
            )}
          </div>
          <p className="text-sm text-slate-500">Expediente #{immigrant.id?.slice(0, 8).toUpperCase()}</p>

          {immigrant.case_status !== 'rejected' && (
            <StatusTimeline status={immigrant.case_status} />
          )}

          {immigrant.case_status === 'rejected' && (
            <div className="mt-4 p-4 bg-red-50 rounded-xl flex gap-3">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-red-700">Expediente rechazado</p>
                <p className="text-sm text-red-600 mt-0.5">Contacta con tu abogado para conocer los próximos pasos.</p>
              </div>
            </div>
          )}

          {immigrant.case_status === 'documents_required' && (
            <div className="mt-4 p-4 bg-orange-50 rounded-xl flex gap-3">
              <AlertCircle className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-orange-700">Se requieren documentos</p>
                <p className="text-sm text-orange-600 mt-0.5">Tu abogado necesita que subas documentación adicional.</p>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-brand-50 rounded-2xl border border-brand-100 p-6">
          <AlertCircle className="w-8 h-8 text-brand-600 mb-3" />
          <h3 className="font-semibold text-brand-900">Expediente en configuración</h3>
          <p className="text-sm text-brand-600 mt-1">Tu expediente está siendo preparado. Pronto un abogado será asignado a tu caso.</p>
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-6">
        {/* Lawyer card */}
        <div className="bg-white rounded-2xl border border-slate-100 p-6">
          <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <Shield className="w-4 h-4 text-brand-600" />
            Tu abogado
          </h3>
          {lawyer ? (
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-brand-700 flex items-center justify-center text-white font-bold text-lg">
                  {lawyer.full_name?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="font-semibold text-slate-900">{lawyer.full_name}</div>
                  <div className="text-sm text-slate-500">{lawyer.specialization || 'Derecho de extranjería'}</div>
                </div>
              </div>
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <div className="flex gap-2 text-sm">
                  <span className="text-slate-400 w-16 flex-shrink-0">Email</span>
                  <span className="text-slate-700">{lawyer.email}</span>
                </div>
                {lawyer.phone && (
                  <div className="flex gap-2 text-sm">
                    <span className="text-slate-400 w-16 flex-shrink-0">Teléfono</span>
                    <span className="text-slate-700">{lawyer.phone}</span>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="py-6 text-center">
              <User className="w-10 h-10 text-slate-200 mx-auto mb-3" />
              <p className="text-sm text-slate-400 font-medium">Sin abogado asignado aún</p>
              <p className="text-xs text-slate-300 mt-1">Serás notificado cuando se asigne uno</p>
            </div>
          )}
        </div>

        {/* Documents card */}
        <div className="bg-white rounded-2xl border border-slate-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-slate-900 flex items-center gap-2">
              <FileText className="w-4 h-4 text-brand-600" />
              Documentos
            </h3>
            <Link href="/immigrant/documents" className="text-xs text-brand-600 hover:underline font-medium">
              Ver todos
            </Link>
          </div>

          {recentDocuments.length === 0 ? (
            <div className="py-6 text-center">
              <FileText className="w-10 h-10 text-slate-200 mx-auto mb-3" />
              <p className="text-sm text-slate-400 font-medium">No has subido documentos</p>
              <Link
                href="/immigrant/documents"
                className="inline-flex items-center gap-1.5 mt-3 text-sm text-brand-600 font-medium hover:underline"
              >
                <Upload className="w-3.5 h-3.5" />
                Subir primer documento
              </Link>
            </div>
          ) : (
            <div className="space-y-2">
              {recentDocuments.map((doc) => (
                <div key={doc.id} className="flex items-center gap-3 p-3 rounded-lg bg-slate-50">
                  <FileText className="w-4 h-4 text-slate-400 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-slate-700 truncate">{doc.file_name}</div>
                    <div className="text-xs text-slate-400">{formatDate(doc.uploaded_at)}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Personal info summary */}
      {immigrant && (
        <div className="bg-white rounded-2xl border border-slate-100 p-6">
          <h3 className="font-semibold text-slate-900 mb-4">Mis datos</h3>
          <div className="grid sm:grid-cols-3 gap-4">
            {[
              { label: 'Nombre', value: immigrant.full_name },
              { label: 'Nacionalidad', value: immigrant.nationality },
              { label: 'Email', value: immigrant.email },
              { label: 'Teléfono', value: immigrant.phone || '—' },
              { label: 'Domicilio en España', value: immigrant.address_in_spain || '—' },
              { label: 'Pasaporte', value: immigrant.passport_number || '—' },
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
