'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Search, Filter, ArrowRight, Users, FileText } from 'lucide-react'
import { caseStatusLabels, formatDate } from '@/lib/utils'

interface Props {
  immigrants: any[]
}

const STATUS_OPTIONS = [
  { value: '', label: 'Todos los estados' },
  { value: 'pending', label: 'Pendiente' },
  { value: 'in_review', label: 'En revisión' },
  { value: 'documents_required', label: 'Documentos requeridos' },
  { value: 'submitted', label: 'Enviado' },
  { value: 'approved', label: 'Aprobado' },
  { value: 'rejected', label: 'Rechazado' },
]

export default function ImmigrantListClient({ immigrants }: Props) {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')

  const filtered = immigrants.filter((imm) => {
    const matchesSearch =
      !search ||
      imm.full_name?.toLowerCase().includes(search.toLowerCase()) ||
      imm.nationality?.toLowerCase().includes(search.toLowerCase()) ||
      imm.email?.toLowerCase().includes(search.toLowerCase())

    const matchesStatus = !statusFilter || imm.case_status === statusFilter

    return matchesSearch && matchesStatus
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Expedientes de inmigrantes</h1>
        <p className="text-slate-500 mt-1">{immigrants.length} expediente{immigrants.length !== 1 ? 's' : ''} asignado{immigrants.length !== 1 ? 's' : ''}</p>
      </div>

      {/* Search & filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por nombre, nacionalidad o email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-600 bg-white"
          />
        </div>
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="pl-10 pr-8 py-2.5 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-600 bg-white appearance-none cursor-pointer"
          >
            {STATUS_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-100 py-20 text-center">
          <Users className="w-12 h-12 text-slate-200 mx-auto mb-4" />
          <p className="text-slate-400 font-medium">
            {immigrants.length === 0 ? 'No tienes expedientes asignados' : 'No se encontraron resultados'}
          </p>
          <p className="text-sm text-slate-300 mt-1">
            {immigrants.length === 0 ? 'Los expedientes que te asignen aparecerán aquí' : 'Prueba con otros términos de búsqueda'}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
          <div className="hidden sm:grid grid-cols-12 gap-4 px-6 py-3 bg-slate-50 border-b border-slate-100 text-xs font-semibold text-slate-500 uppercase tracking-wide">
            <div className="col-span-4">Nombre</div>
            <div className="col-span-2">Nacionalidad</div>
            <div className="col-span-2">Estado</div>
            <div className="col-span-2">Alta</div>
            <div className="col-span-2">Acciones</div>
          </div>

          <div className="divide-y divide-slate-50">
            {filtered.map((immigrant) => {
              const status = caseStatusLabels[immigrant.case_status] || { label: immigrant.case_status, color: 'bg-slate-100 text-slate-600' }
              return (
                <div key={immigrant.id} className="grid grid-cols-12 gap-4 items-center px-6 py-4 hover:bg-slate-50 transition-colors group">
                  <div className="col-span-12 sm:col-span-4 flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-brand-100 flex items-center justify-center text-brand-700 font-semibold text-sm flex-shrink-0">
                      {immigrant.full_name?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="font-medium text-slate-900 text-sm">{immigrant.full_name}</div>
                      <div className="text-xs text-slate-400">{immigrant.email}</div>
                    </div>
                  </div>
                  <div className="hidden sm:block col-span-2 text-sm text-slate-600">{immigrant.nationality}</div>
                  <div className="hidden sm:block col-span-2">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${status.color}`}>
                      {status.label}
                    </span>
                  </div>
                  <div className="hidden sm:block col-span-2 text-xs text-slate-400">{formatDate(immigrant.created_at)}</div>
                  <div className="hidden sm:flex col-span-2">
                    <Link
                      href={`/lawyer/immigrants/${immigrant.id}`}
                      className="flex items-center gap-1.5 text-sm text-brand-600 hover:text-brand-800 font-medium transition-colors"
                    >
                      Ver expediente
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
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
