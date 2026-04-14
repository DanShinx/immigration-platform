'use client'

import Link from 'next/link'
import { Users, Clock, FileSearch, TrendingUp, ArrowRight, Inbox, FolderKanban } from 'lucide-react'
import { useI18n } from '@/components/LanguageProvider'
import { formatDate, getCaseStatusMeta } from '@/lib/utils'

interface Props {
  stats: { total: number; pending: number; inReview: number }
  recentImmigrants: any[]
  lawyerName: string
}

export default function LawyerDashboardClient({ stats, recentImmigrants, lawyerName }: Props) {
  const { messages, locale } = useI18n()
  const hour = new Date().getHours()
  const greeting =
    hour < 12
      ? messages.shared.greetings.morning
      : hour < 20
      ? messages.shared.greetings.afternoon
      : messages.shared.greetings.evening

  const cards = [
    {
      label: messages.lawyerDashboard.stats[0].label,
      value: stats.total,
      icon: Users,
      color: 'bg-blue-50 text-blue-600',
      change: messages.lawyerDashboard.stats[0].change,
    },
    {
      label: messages.lawyerDashboard.stats[1].label,
      value: stats.pending,
      icon: Clock,
      color: 'bg-yellow-50 text-yellow-600',
      change: messages.lawyerDashboard.stats[1].change,
    },
    {
      label: messages.lawyerDashboard.stats[2].label,
      value: stats.inReview,
      icon: FileSearch,
      color: 'bg-purple-50 text-purple-600',
      change: messages.lawyerDashboard.stats[2].change,
    },
  ]

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">
          {greeting}, {lawyerName.split(' ')[0]} 👋
        </h1>
        <p className="text-slate-500 mt-1">
          {messages.lawyerDashboard.intro}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        {cards.map((stat) => (
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

      <div className="bg-white rounded-2xl border border-slate-100 p-6">
        <h2 className="font-semibold text-slate-900 mb-4">{messages.lawyerDashboard.quickActionsTitle}</h2>
        <div className="grid md:grid-cols-3 gap-4">
          {[
            {
              href: '/lawyer/requests',
              icon: Inbox,
              title: messages.lawyerDashboard.quickActions.requests.title,
              body: messages.lawyerDashboard.quickActions.requests.body,
            },
            {
              href: '/lawyer/documents',
              icon: FileSearch,
              title: messages.lawyerDashboard.quickActions.documents.title,
              body: messages.lawyerDashboard.quickActions.documents.body,
            },
            {
              href: '/lawyer/immigrants',
              icon: FolderKanban,
              title: messages.lawyerDashboard.quickActions.cases.title,
              body: messages.lawyerDashboard.quickActions.cases.body,
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

      <div className="bg-white rounded-2xl border border-slate-100">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h2 className="font-semibold text-slate-900">{messages.lawyerDashboard.recentCases}</h2>
          <Link
            href="/lawyer/immigrants"
            className="flex items-center gap-1.5 text-sm text-brand-600 hover:text-brand-800 font-medium transition-colors"
          >
            {messages.lawyerDashboard.viewAll}
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {recentImmigrants.length === 0 ? (
          <div className="py-16 text-center">
            <Users className="w-12 h-12 text-slate-200 mx-auto mb-4" />
            <p className="text-slate-400 font-medium">{messages.lawyerDashboard.emptyTitle}</p>
            <p className="text-sm text-slate-300 mt-1">{messages.lawyerDashboard.emptyBody}</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-50">
            {recentImmigrants.map((immigrant) => {
              const status = getCaseStatusMeta(immigrant.case_status, locale)
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
                    {formatDate(immigrant.created_at, locale)}
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
