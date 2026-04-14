'use client'

import Link from 'next/link'
import { Users, Clock, FileSearch, TrendingUp, ArrowRight, Calendar } from 'lucide-react'
import { caseStatusLabels, formatDate } from '@/lib/utils'

interface Props {
  stats: { total: number; pending: number; inReview: number }
  recentImmigrants: any[]
  lawyerName: string
}

export default function LawyerDashboardClient({ stats, recentImmigrants, lawyerName }: Props) {
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Buenos días' : hour < 20 ? 'Buenas tardes' : 'Buenas noches'

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">
          {greeting}, {lawyerName.split(' ')[0]} 👋
        </h1>
        <p className="text-slate-500 mt-1">
          {new Date().toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        {[
          {
            label: 'Expedientes asignados',
            value: stats.total,
            icon: Users,
            color: 'bg-blue-50 text-blue-600',
            change: 'Total de inmigrantes',
          },
          {
            label: 'Casos pendientes',
            value: stats.pending,
            icon: Clock,
            color: 'bg-yellow-50 text-yellow-600',
            change: 'Requieren atención',
          },
          {
            label: 'En revisión',
            value: stats.inReview,
            icon: FileSearch,
            color: 'bg-purple-50 text-purple-600',
            change: 'En proceso activo',
          },
        ].map((stat) => (
          <div key={stat.label} className="bg-white rounded-2xl border border-slate-100 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${stat.color}`}>
                <stat.icon className="w-5 h-5" />
              </div>
              <TrendingUp className="w-4 h-4 text-slate-300" />
            </div>
            <div className="text-3xl font-bold text-slate-900 mb-1">{stat.value}</div>
            <div className="text-sm font-medium text-slate-700">{stat.label}</div>
            <div className="text-xs text-slate-400 mt-0.5">{stat.change}</div>
          </div>
        ))}
      </div>

      {/* Recent cases */}
      <div className="bg-white rounded-2xl border border-slate-100">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h2 className="font-semibold text-slate-900">Expedientes recientes</h2>
          <Link
            href="/lawyer/immigrants"
            className="flex items-center gap-1.5 text-sm text-brand-600 hover:text-brand-800 font-medium transition-colors"
          >
            Ver todos
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {recentImmigrants.length === 0 ? (
          <div className="py-16 text-center">
            <Users className="w-12 h-12 text-slate-200 mx-auto mb-4" />
            <p className="text-slate-400 font-medium">No tienes expedientes asignados aún</p>
            <p className="text-sm text-slate-300 mt-1">Los expedientes asignados aparecerán aquí</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-50">
            {recentImmigrants.map((immigrant) => {
              const status = caseStatusLabels[immigrant.case_status] || { label: immigrant.case_status, color: 'bg-slate-100 text-slate-600' }
              return (
                <Link
                  key={immigrant.id}
                  href={`/lawyer/immigrants/${immigrant.id}`}
                  className="flex items-center gap-4 px-6 py-4 hover:bg-slate-50 transition-colors group"
                >
                  <div className="w-9 h-9 rounded-full bg-brand-100 flex items-center justify-center text-brand-700 font-semibold text-sm flex-shrink-0">
                    {immigrant.full_name?.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-slate-900 group-hover:text-brand-700 transition-colors truncate">
                      {immigrant.full_name}
                    </div>
                    <div className="text-xs text-slate-400 mt-0.5">{immigrant.nationality}</div>
                  </div>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${status.color}`}>
                    {status.label}
                  </span>
                  <div className="text-xs text-slate-400 hidden sm:block flex-shrink-0">
                    {formatDate(immigrant.created_at)}
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-brand-500 transition-colors flex-shrink-0" />
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
