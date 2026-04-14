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
import { caseStatusLabels, formatDate } from '@/lib/utils'

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

function StatusTimeline({ status }: { status: string }) {
  const steps = [
    { id: 'pending', label: 'Registrado' },
    { id: 'in_review', label: 'En revisión' },
    { id: 'documents_required', label: 'Documentos' },
    { id: 'submitted', label: 'Enviado' },
    { id: 'approved', label: 'Resuelto' },
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

function getNextStepMessage(status?: string | null) {
  switch (status) {
    case 'pending':
      return 'Tu expediente ya existe en la plataforma. El siguiente paso es que tu abogado revise la información inicial.'
    case 'in_review':
      return 'Tu abogado está revisando la documentación e información de tu caso.'
    case 'documents_required':
      return 'Necesitas subir documentación adicional para que el expediente pueda avanzar.'
    case 'submitted':
      return 'Tu expediente ya fue enviado. Ahora toca esperar respuesta del organismo correspondiente.'
    case 'approved':
      return 'Tu caso está resuelto favorablemente. Revisa con tu abogado los pasos administrativos finales.'
    case 'rejected':
      return 'El expediente fue rechazado. Habla con tu abogado para valorar recursos o una nueva estrategia.'
    default:
      return 'Tu expediente se está preparando. Pronto verás más información aquí.'
  }
}

export default function ImmigrantMyCaseClient({ immigrant, lawyer, documents }: Props) {
  const status = immigrant ? caseStatusLabels[immigrant.case_status] : null
  const uploadedDocuments = documents.length

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Mi caso</h1>
        <p className="text-slate-500 mt-1">
          Vista completa de tu expediente, próximos pasos y persona responsable de tu proceso.
        </p>
      </div>

      {immigrant ? (
        <div className="bg-white rounded-2xl border border-slate-100 p-6">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
            <div>
              <h2 className="font-semibold text-slate-900">Expediente #{immigrant.id.slice(0, 8).toUpperCase()}</h2>
              <p className="text-sm text-slate-500 mt-1">
                Creado el {formatDate(immigrant.created_at)}
              </p>
            </div>
            {status && (
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium w-fit ${status.color}`}>
                {status.label}
              </span>
            )}
          </div>

          {immigrant.case_status !== 'rejected' ? (
            <StatusTimeline status={immigrant.case_status} />
          ) : (
            <div className="mt-5 p-4 bg-red-50 rounded-xl flex gap-3">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-red-700">Caso rechazado</p>
                <p className="text-sm text-red-600 mt-0.5">
                  Reúnete con tu abogado para definir la mejor siguiente acción.
                </p>
              </div>
            </div>
          )}

          <div className="mt-6 p-4 bg-slate-50 rounded-xl">
            <div className="text-sm font-medium text-slate-900">Qué pasa ahora</div>
            <p className="text-sm text-slate-600 mt-1">
              {getNextStepMessage(immigrant.case_status)}
            </p>
          </div>
        </div>
      ) : (
        <div className="bg-brand-50 rounded-2xl border border-brand-100 p-6">
          <AlertCircle className="w-8 h-8 text-brand-600 mb-3" />
          <h3 className="font-semibold text-brand-900">Expediente en preparación</h3>
          <p className="text-sm text-brand-600 mt-1">
            Tu caso todavía no está configurado. Cuando se active, verás aquí todo el detalle del proceso.
          </p>
        </div>
      )}

      <div className="grid md:grid-cols-3 gap-5">
        <div className="bg-white rounded-2xl border border-slate-100 p-6">
          <div className="text-sm text-slate-500">Documentos subidos</div>
          <div className="text-3xl font-bold text-slate-900 mt-2">{uploadedDocuments}</div>
        </div>
        <div className="bg-white rounded-2xl border border-slate-100 p-6">
          <div className="text-sm text-slate-500">Abogado asignado</div>
          <div className="text-lg font-semibold text-slate-900 mt-2">
            {lawyer ? lawyer.full_name : 'Pendiente'}
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-slate-100 p-6">
          <div className="text-sm text-slate-500">Estado actual</div>
          <div className="text-lg font-semibold text-slate-900 mt-2">
            {status ? status.label : 'En preparación'}
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-[1.2fr,0.8fr] gap-6">
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-100 p-6">
            <h2 className="font-semibold text-slate-900 mb-4">Datos del expediente</h2>
            {immigrant ? (
              <div className="grid sm:grid-cols-2 gap-4">
                {[
                  { label: 'Nombre completo', value: immigrant.full_name, icon: User },
                  { label: 'Email', value: immigrant.email, icon: Mail },
                  { label: 'Teléfono', value: immigrant.phone || '—', icon: Phone },
                  { label: 'Nacionalidad', value: immigrant.nationality, icon: Shield },
                  { label: 'Pasaporte', value: immigrant.passport_number || '—', icon: FileText },
                  { label: 'Fecha de nacimiento', value: immigrant.date_of_birth ? formatDate(immigrant.date_of_birth) : '—', icon: Clock },
                  { label: 'Dirección en España', value: immigrant.address_in_spain || '—', icon: MapPin },
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
              <p className="text-sm text-slate-500">Todavía no hay datos del expediente para mostrar.</p>
            )}
          </div>

          <div className="bg-white rounded-2xl border border-slate-100 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-slate-900">Documentación del caso</h2>
              <Link
                href="/immigrant/documents"
                className="text-sm text-brand-600 hover:text-brand-800 font-medium inline-flex items-center gap-1.5"
              >
                Gestionar documentos
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {documents.length === 0 ? (
              <div className="bg-slate-50 rounded-xl p-5">
                <p className="text-sm text-slate-600">
                  Todavía no has subido documentos. Empieza por compartir los archivos esenciales de tu expediente.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {documents.slice(0, 5).map((document) => (
                  <div key={document.id} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50">
                    <FileText className="w-4 h-4 text-slate-400 flex-shrink-0" />
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-medium text-slate-800 truncate">{document.file_name}</div>
                      <div className="text-xs text-slate-400">{formatDate(document.uploaded_at)}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-100 p-6">
            <h2 className="font-semibold text-slate-900 mb-4">Tu abogado</h2>
            {lawyer ? (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-brand-700 flex items-center justify-center text-white font-bold text-lg">
                    {lawyer.full_name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="font-semibold text-slate-900">{lawyer.full_name}</div>
                    <div className="text-sm text-slate-500">
                      {lawyer.specialization || 'Derecho de extranjería'}
                    </div>
                  </div>
                </div>
                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <div className="text-sm text-slate-600">
                    <span className="text-slate-400">Email:</span> {lawyer.email}
                  </div>
                  {lawyer.phone && (
                    <div className="text-sm text-slate-600">
                      <span className="text-slate-400">Teléfono:</span> {lawyer.phone}
                    </div>
                  )}
                  {lawyer.bar_association && (
                    <div className="text-sm text-slate-600">
                      <span className="text-slate-400">Colegio:</span> {lawyer.bar_association}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-slate-50 rounded-xl p-5">
                <p className="text-sm text-slate-600">
                  Aún no hay un abogado asignado a tu expediente. Te avisaremos en cuanto eso cambie.
                </p>
              </div>
            )}
          </div>

          <div className="bg-white rounded-2xl border border-slate-100 p-6">
            <h2 className="font-semibold text-slate-900 mb-4">Acciones recomendadas</h2>
            <div className="space-y-3">
              <Link
                href="/immigrant/documents"
                className="flex items-center justify-between rounded-xl border border-slate-200 px-4 py-3 hover:border-brand-300 hover:bg-brand-50 transition-colors"
              >
                <div>
                  <div className="text-sm font-medium text-slate-900">Revisar mis documentos</div>
                  <div className="text-xs text-slate-500 mt-0.5">
                    Comprueba si falta algo por subir
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400" />
              </Link>
              <Link
                href="/immigrant/dashboard"
                className="flex items-center justify-between rounded-xl border border-slate-200 px-4 py-3 hover:border-brand-300 hover:bg-brand-50 transition-colors"
              >
                <div>
                  <div className="text-sm font-medium text-slate-900">Volver al panel</div>
                  <div className="text-xs text-slate-500 mt-0.5">
                    Consulta el resumen general del proceso
                  </div>
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
