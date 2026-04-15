'use client'

import Link from 'next/link'
import { ArrowRight, Briefcase, Clock3, Send } from 'lucide-react'
import { useI18n } from '@/components/LanguageProvider'
import { getCaseContent } from '@/lib/case-content'
import { getCaseStageMeta, getCaseTrackMeta } from '@/lib/cases'
import { formatDate } from '@/lib/utils'
import type { CaseRecord } from '@/types'

interface Props {
  stats: {
    total: number
    pending: number
    readyToFile: number
  }
  recentCases: (CaseRecord & {
    immigrantName?: string | null
  })[]
  lawyerName: string
}

export default function LawyerDashboardClient({ stats, recentCases, lawyerName }: Props) {
  const { locale } = useI18n()
  const copy = getCaseContent(locale)

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">{copy.lawyerDashboard.title}, {lawyerName.split(' ')[0]}</h1>
        <p className="text-slate-500 mt-1">{copy.lawyerDashboard.subtitle}</p>
      </div>

      <div className="grid md:grid-cols-3 gap-5">
        {[
          { label: copy.lawyerDashboard.assignedCases, value: stats.total, icon: Briefcase, color: 'bg-brand-50 text-brand-700' },
          { label: copy.lawyerDashboard.pendingRequests, value: stats.pending, icon: Clock3, color: 'bg-amber-50 text-amber-700' },
          { label: copy.lawyerDashboard.readyToFile, value: stats.readyToFile, icon: Send, color: 'bg-cyan-50 text-cyan-700' },
        ].map((stat) => (
          <div key={stat.label} className="rounded-3xl border border-slate-200 bg-white p-6">
            <div className={`w-11 h-11 rounded-2xl flex items-center justify-center ${stat.color}`}>
              <stat.icon className="w-5 h-5" />
            </div>
            <div className="text-3xl font-bold text-slate-900 mt-4">{stat.value}</div>
            <div className="text-sm text-slate-500 mt-1">{stat.label}</div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-5">
        {[
          { href: '/lawyer/cases', title: copy.lawyerCases.title, body: copy.lawyerCases.subtitle },
          { href: '/lawyer/requests', title: copy.lawyerDashboard.pendingRequests, body: 'Review new case assignment requests.' },
          { href: '/lawyer/documents', title: 'Documents', body: 'Review uploaded files across assigned cases.' },
        ].map((action) => (
          <Link
            key={action.href}
            href={action.href}
            className="rounded-3xl border border-slate-200 bg-white p-6 hover:border-brand-300 hover:shadow-lg transition-all"
          >
            <div className="font-semibold text-slate-900">{action.title}</div>
            <div className="text-sm text-slate-500 mt-2 leading-relaxed">{action.body}</div>
          </Link>
        ))}
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-6">
        <div className="flex items-center justify-between gap-3">
          <h2 className="font-semibold text-slate-900">{copy.lawyerDashboard.recentCases}</h2>
          <Link href="/lawyer/cases" className="inline-flex items-center gap-2 text-sm font-semibold text-brand-700">
            {copy.lawyerCases.viewCase}
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {recentCases.length === 0 ? (
          <p className="text-sm text-slate-500 mt-5">{copy.lawyerCases.empty}</p>
        ) : (
          <div className="space-y-4 mt-5">
            {recentCases.map((caseItem) => {
              const stage = getCaseStageMeta(caseItem.stage, locale)
              const track = getCaseTrackMeta(caseItem.track_code, locale)
              return (
                <Link key={caseItem.id} href={`/lawyer/cases/${caseItem.id}`} className="block rounded-2xl bg-slate-50 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <div className="font-medium text-slate-900">{caseItem.title}</div>
                      <div className="text-sm text-slate-500 mt-1">
                        {caseItem.immigrantName} · {track.shortTitle} · {formatDate(caseItem.created_at, locale)}
                      </div>
                    </div>
                    <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${stage.color}`}>
                      {stage.label}
                    </span>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
