'use client'

import Link from 'next/link'
import { useMemo, useState } from 'react'
import { ArrowRight, FolderOpen, Search, Users } from 'lucide-react'
import { useI18n } from '@/components/LanguageProvider'
import { caseStageValues, getCaseStageMeta } from '@/lib/cases'
import { formatDate } from '@/lib/utils'

interface ImmigrantRow {
  id: string
  full_name: string
  email: string
  nationality: string
  created_at: string
  totalCases: number
  latestCaseId: string | null
  latestCaseTitle: string | null
  latestCaseStage: string | null
}

interface Props {
  immigrants: ImmigrantRow[]
}

export default function AdminImmigrantsClient({ immigrants }: Props) {
  const { messages, locale } = useI18n()
  const t = messages.admin.immigrants

  const [search, setSearch] = useState('')
  const [filterStage, setFilterStage] = useState('')

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return immigrants.filter((immigrant) => {
      const matchSearch =
        !q ||
        [
          immigrant.full_name,
          immigrant.email,
          immigrant.nationality,
          immigrant.latestCaseTitle || '',
        ].some((value) => value?.toLowerCase().includes(q))

      const matchStage = !filterStage || immigrant.latestCaseStage === filterStage
      return matchSearch && matchStage
    })
  }, [filterStage, immigrants, search])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">{t.title}</h1>
        <p className="text-slate-500 mt-1">{t.subtitle}</p>
      </div>

      <div className="rounded-3xl border border-brand-200 bg-brand-50 p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="font-semibold text-brand-900">{t.directoryNoticeTitle}</h2>
            <p className="text-sm text-brand-700 mt-1">{t.directoryNoticeBody}</p>
          </div>
          <Link
            href="/admin/cases"
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-brand-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-800"
          >
            <FolderOpen className="w-4 h-4" />
            {t.openCaseQueue}
          </Link>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 p-4 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder={t.search}
            className="w-full pl-10 pr-4 py-2.5 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-600 bg-white"
          />
        </div>
        <select
          value={filterStage}
          onChange={(event) => setFilterStage(event.target.value)}
          className="px-3 py-2.5 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-600 bg-white"
        >
          <option value="">{t.allStages}</option>
          {caseStageValues.map((stage) => (
            <option key={stage} value={stage}>
              {getCaseStageMeta(stage, locale).label}
            </option>
          ))}
        </select>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
        {filtered.length === 0 ? (
          <div className="py-20 text-center">
            <Users className="w-10 h-10 text-slate-200 mx-auto mb-3" />
            <p className="text-sm text-slate-400">{t.empty}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr>
                  {[
                    t.columns.name,
                    t.columns.nationality,
                    t.columns.totalCases,
                    t.columns.latestCase,
                    t.columns.registered,
                    t.columns.actions,
                  ].map((column) => (
                    <th
                      key={column}
                      className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wide whitespace-nowrap"
                    >
                      {column}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filtered.map((immigrant) => {
                  const latestStage = immigrant.latestCaseStage
                    ? getCaseStageMeta(immigrant.latestCaseStage, locale)
                    : null

                  return (
                    <tr key={immigrant.id} className="hover:bg-slate-50/50">
                      <td className="px-6 py-4">
                        <div className="font-medium text-slate-900">{immigrant.full_name}</div>
                        <div className="text-xs text-slate-400">{immigrant.email}</div>
                      </td>
                      <td className="px-6 py-4 text-slate-600">{immigrant.nationality}</td>
                      <td className="px-6 py-4">
                        <div className="font-medium text-slate-900">{t.caseCount(immigrant.totalCases)}</div>
                        <div className="text-xs text-slate-400">
                          {immigrant.totalCases === 0 ? t.noCases : t.openCaseQueue}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {immigrant.latestCaseId && immigrant.latestCaseTitle ? (
                          <div className="space-y-2">
                            <div className="font-medium text-slate-900">{immigrant.latestCaseTitle}</div>
                            {latestStage && (
                              <span
                                className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${latestStage.color}`}
                              >
                                {latestStage.label}
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-slate-400">{t.noCases}</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-slate-500 whitespace-nowrap">
                        {formatDate(immigrant.created_at, locale)}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-2">
                          {immigrant.latestCaseId ? (
                            <Link
                              href={`/admin/cases/${immigrant.latestCaseId}`}
                              className="inline-flex items-center gap-1.5 rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-200 transition-colors"
                            >
                              {t.viewLatestCase}
                              <ArrowRight className="w-3.5 h-3.5" />
                            </Link>
                          ) : (
                            <Link
                              href="/admin/cases"
                              className="inline-flex items-center gap-1.5 rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-200 transition-colors"
                            >
                              {t.openCaseQueue}
                              <ArrowRight className="w-3.5 h-3.5" />
                            </Link>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
