'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { ArrowRight, FolderOpen } from 'lucide-react'
import { useI18n } from '@/components/LanguageProvider'
import { caseStageValues, caseTrackValues, getCaseStageMeta, getCaseTrackMeta } from '@/lib/cases'
import { formatDate } from '@/lib/utils'
import type { CaseRecord } from '@/types'

interface HydratedCase extends CaseRecord {
  immigrant: { id: string; full_name: string; email: string } | null
  lawyer: { user_id: string; full_name: string } | null
}

interface Props {
  cases: HydratedCase[]
}

export default function AdminCasesClient({ cases }: Props) {
  const { messages, locale } = useI18n()
  const t = messages.admin.cases

  const [search, setSearch] = useState('')
  const [stageFilter, setStageFilter] = useState('')
  const [trackFilter, setTrackFilter] = useState('')

  const filtered = useMemo(() => {
    const query = search.toLowerCase().trim()

    return cases.filter((c) => {
      const matchesSearch =
        !query ||
        c.title.toLowerCase().includes(query) ||
        (c.immigrant?.full_name || '').toLowerCase().includes(query) ||
        (c.immigrant?.email || '').toLowerCase().includes(query) ||
        (c.lawyer?.full_name || '').toLowerCase().includes(query)

      const matchesStage = !stageFilter || c.stage === stageFilter
      const matchesTrack = !trackFilter || c.track_code === trackFilter

      return matchesSearch && matchesStage && matchesTrack
    })
  }, [cases, search, stageFilter, trackFilter])

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">{t.title}</h1>
        <p className="text-slate-500 mt-1">{t.subtitle}</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={t.search}
          className="flex-1 rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-600"
        />
        <select
          value={stageFilter}
          onChange={(e) => setStageFilter(e.target.value)}
          className="rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-600"
        >
          <option value="">{t.allStages}</option>
          {caseStageValues.map((stage) => (
            <option key={stage} value={stage}>
              {getCaseStageMeta(stage, locale).label}
            </option>
          ))}
        </select>
        <select
          value={trackFilter}
          onChange={(e) => setTrackFilter(e.target.value)}
          className="rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-600"
        >
          <option value="">{t.allTracks}</option>
          {caseTrackValues.map((track) => (
            <option key={track} value={track}>
              {getCaseTrackMeta(track, locale).shortTitle}
            </option>
          ))}
        </select>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
        {filtered.length === 0 ? (
          <div className="py-20 text-center">
            <FolderOpen className="w-12 h-12 text-slate-200 mx-auto mb-4" />
            <p className="text-slate-500 font-medium">{t.empty}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/60">
                  <th className="text-left px-5 py-3 font-semibold text-slate-600">{t.columns.title}</th>
                  <th className="text-left px-5 py-3 font-semibold text-slate-600">{t.columns.immigrant}</th>
                  <th className="text-left px-5 py-3 font-semibold text-slate-600">{t.columns.lawyer}</th>
                  <th className="text-left px-5 py-3 font-semibold text-slate-600">{t.columns.track}</th>
                  <th className="text-left px-5 py-3 font-semibold text-slate-600">{t.columns.stage}</th>
                  <th className="text-left px-5 py-3 font-semibold text-slate-600">{t.columns.opened}</th>
                  <th className="px-5 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filtered.map((c) => {
                  const stage = getCaseStageMeta(c.stage, locale)
                  const track = getCaseTrackMeta(c.track_code, locale)

                  return (
                    <tr key={c.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-5 py-4">
                        <div className="font-medium text-slate-900 max-w-[200px] truncate">{c.title}</div>
                        <div className="text-xs text-slate-400 mt-0.5">{c.id.slice(0, 8).toUpperCase()}</div>
                      </td>
                      <td className="px-5 py-4">
                        {c.immigrant ? (
                          <>
                            <div className="font-medium text-slate-900">{c.immigrant.full_name}</div>
                            <div className="text-xs text-slate-400">{c.immigrant.email}</div>
                          </>
                        ) : (
                          <span className="text-slate-400">{t.noImmigrant}</span>
                        )}
                      </td>
                      <td className="px-5 py-4">
                        <span className={c.lawyer ? 'text-slate-900' : 'text-slate-400'}>
                          {c.lawyer?.full_name || t.noLawyer}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <span className="inline-flex rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
                          {track.shortTitle}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${stage.color}`}>
                          {stage.label}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-slate-500">
                        {formatDate(c.created_at, locale)}
                      </td>
                      <td className="px-5 py-4">
                        <Link
                          href={`/admin/cases/${c.id}`}
                          className="inline-flex items-center gap-1 text-sm font-medium text-brand-600 hover:text-brand-800"
                        >
                          <ArrowRight className="w-4 h-4" />
                        </Link>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <p className="text-xs text-slate-400 text-right">{filtered.length} / {cases.length}</p>
    </div>
  )
}
