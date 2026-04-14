'use client'

import Link from 'next/link'
import { AlertTriangle, Briefcase, Clock, FileText, Flag, Users } from 'lucide-react'
import { useI18n } from '@/components/LanguageProvider'
import { formatDate, getCaseStatusMeta } from '@/lib/utils'

interface Stats {
  totalImmigrants: number
  totalLawyers: number
  pendingApproval: number
  openFlags: number
  pendingRequests: number
  casesInReview: number
}

interface Props {
  stats: Stats
  recentFlags: any[]
  recentPendingLawyers: any[]
}

export default function AdminDashboardClient({ stats, recentFlags, recentPendingLawyers }: Props) {
  const { messages, locale } = useI18n()
  const t = messages.admin.dashboard

  const statCards = [
    { label: t.stats.totalImmigrants, value: stats.totalImmigrants, icon: Users, color: 'bg-blue-50 text-blue-600' },
    { label: t.stats.totalLawyers, value: stats.totalLawyers, icon: Briefcase, color: 'bg-green-50 text-green-600' },
    { label: t.stats.pendingApproval, value: stats.pendingApproval, icon: Clock, color: 'bg-amber-50 text-amber-600', href: '/admin/lawyers' },
    { label: t.stats.openFlags, value: stats.openFlags, icon: Flag, color: 'bg-red-50 text-red-600', href: '/admin/flags' },
    { label: t.stats.pendingRequests, value: stats.pendingRequests, icon: AlertTriangle, color: 'bg-orange-50 text-orange-600' },
    { label: t.stats.casesInReview, value: stats.casesInReview, icon: FileText, color: 'bg-purple-50 text-purple-600' },
  ]

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">{t.title}</h1>
        <p className="text-slate-500 mt-1">{t.subtitle}</p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {statCards.map((card) => (
          <div key={card.label} className={`bg-white rounded-2xl border border-slate-100 p-6 ${card.href ? 'cursor-pointer hover:border-brand-200 transition-colors' : ''}`}>
            {card.href ? (
              <Link href={card.href} className="block">
                <StatCardContent card={card} />
              </Link>
            ) : (
              <StatCardContent card={card} />
            )}
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-slate-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-slate-900">{t.recentFlags}</h2>
            <Link href="/admin/flags" className="text-sm text-brand-600 hover:text-brand-800 font-medium">{t.viewAll}</Link>
          </div>
          {recentFlags.length === 0 ? (
            <p className="text-sm text-slate-400 py-6 text-center">{t.noFlags}</p>
          ) : (
            <div className="space-y-3">
              {recentFlags.map((flag: any) => (
                <div key={flag.id} className="flex items-start justify-between gap-3 p-3 rounded-xl bg-slate-50">
                  <div className="min-w-0">
                    <div className="text-sm font-medium text-slate-900 truncate">
                      {messages.admin.flags.categories[flag.category as keyof typeof messages.admin.flags.categories]}
                    </div>
                    <div className="text-xs text-slate-400 mt-0.5 truncate">{flag.description}</div>
                    <div className="text-xs text-slate-400 mt-0.5">{flag.reporter?.full_name || flag.reporter?.email}</div>
                  </div>
                  <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full whitespace-nowrap">
                    {messages.admin.flags.statuses[flag.status as keyof typeof messages.admin.flags.statuses]}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-slate-900">{t.recentLawyers}</h2>
            <Link href="/admin/lawyers" className="text-sm text-brand-600 hover:text-brand-800 font-medium">{t.viewAll}</Link>
          </div>
          {recentPendingLawyers.length === 0 ? (
            <p className="text-sm text-slate-400 py-6 text-center">{t.noLawyers}</p>
          ) : (
            <div className="space-y-3">
              {recentPendingLawyers.map((lawyer: any) => (
                <div key={lawyer.id} className="flex items-center justify-between gap-3 p-3 rounded-xl bg-slate-50">
                  <div className="min-w-0">
                    <div className="text-sm font-medium text-slate-900 truncate">{lawyer.full_name}</div>
                    <div className="text-xs text-slate-400 mt-0.5">{lawyer.email} · {lawyer.license_number}</div>
                  </div>
                  <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full whitespace-nowrap">
                    {formatDate(lawyer.created_at, locale)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function StatCardContent({ card }: { card: { label: string; value: number; icon: React.ElementType; color: string } }) {
  return (
    <>
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${card.color}`}>
        <card.icon className="w-5 h-5" />
      </div>
      <div className="text-3xl font-bold text-slate-900 mt-4">{card.value}</div>
      <div className="text-sm text-slate-500 mt-1">{card.label}</div>
    </>
  )
}
