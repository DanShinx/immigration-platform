'use client'

import { useState } from 'react'
import { Briefcase, CheckCircle2, Mail, Search, Shield, UserCheck } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useI18n } from '@/components/LanguageProvider'
import { formatDate } from '@/lib/utils'

interface LawyerRecord {
  user_id: string
  full_name: string
  email: string
  specialization?: string | null
  bar_association?: string | null
  bio?: string | null
}

interface PendingRequest {
  id: string
  immigrant_id: string
  lawyer_user_id: string
  status: string
  created_at: string
  responded_at?: string | null
  lawyer?: LawyerRecord | null
}

interface Props {
  immigrantId: string | null
  lawyers: LawyerRecord[]
  assignedLawyer: LawyerRecord | null
  pendingRequest: PendingRequest | null
}

export default function ImmigrantLawyerSelectionClient({
  immigrantId,
  lawyers,
  assignedLawyer,
  pendingRequest,
}: Props) {
  const supabase = createClient()
  const { messages, locale } = useI18n()
  const t = messages.immigrantLawyers

  const [search, setSearch] = useState('')
  const [requestingLawyerId, setRequestingLawyerId] = useState<string | null>(null)
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null)
  const [currentPendingRequest, setCurrentPendingRequest] = useState<PendingRequest | null>(pendingRequest)

  const filteredLawyers = lawyers.filter((lawyer) => {
    const query = search.toLowerCase().trim()
    if (!query) return true

    return [lawyer.full_name, lawyer.email, lawyer.specialization, lawyer.bar_association]
      .filter(Boolean)
      .some((value) => value!.toLowerCase().includes(query))
  })

  async function handleRequestLawyer(lawyer: LawyerRecord) {
    if (!immigrantId || assignedLawyer?.user_id === lawyer.user_id) return
    if (currentPendingRequest?.lawyer_user_id === lawyer.user_id) return

    setRequestingLawyerId(lawyer.user_id)
    setFeedback(null)

    const respondedAt = new Date().toISOString()

    if (currentPendingRequest?.id) {
      const { error: previousError } = await supabase
        .from('lawyer_assignment_requests')
        .update({ status: 'withdrawn', responded_at: respondedAt })
        .eq('id', currentPendingRequest.id)

      if (previousError) {
        setFeedback({ type: 'error', message: t.messages.requestError })
        setRequestingLawyerId(null)
        return
      }
    }

    const { data, error } = await supabase
      .from('lawyer_assignment_requests')
      .insert({
        immigrant_id: immigrantId,
        lawyer_user_id: lawyer.user_id,
        status: 'pending',
      })
      .select('*')
      .single()

    if (error || !data) {
      setFeedback({ type: 'error', message: t.messages.requestError })
      setRequestingLawyerId(null)
      return
    }

    setCurrentPendingRequest({
      ...data,
      lawyer,
    })
    setFeedback({
      type: 'success',
      message: currentPendingRequest ? t.messages.requestUpdated : t.messages.requestSent,
    })
    setRequestingLawyerId(null)
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">{t.title}</h1>
        <p className="text-slate-500 mt-1">{t.subtitle}</p>
      </div>

      {feedback && (
        <div
          className={`rounded-2xl border px-4 py-3 text-sm ${
            feedback.type === 'success'
              ? 'border-green-200 bg-green-50 text-green-700'
              : 'border-red-200 bg-red-50 text-red-700'
          }`}
        >
          {feedback.message}
        </div>
      )}

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-slate-100 p-6">
          <div className="flex items-center gap-2 mb-3">
            <UserCheck className="w-4 h-4 text-brand-600" />
            <h2 className="font-semibold text-slate-900">{t.currentLawyer}</h2>
          </div>

          {assignedLawyer ? (
            <div className="space-y-2">
              <div className="font-semibold text-slate-900">{assignedLawyer.full_name}</div>
              <div className="text-sm text-slate-500">
                {assignedLawyer.specialization || messages.immigrantDashboard.defaultSpecialization}
              </div>
              <div className="text-sm text-slate-600">{assignedLawyer.email}</div>
            </div>
          ) : (
            <p className="text-sm text-slate-500">{messages.immigrantDashboard.noLawyerBody}</p>
          )}
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 p-6">
          <div className="flex items-center gap-2 mb-3">
            <Shield className="w-4 h-4 text-brand-600" />
            <h2 className="font-semibold text-slate-900">{t.pendingRequest}</h2>
          </div>

          {currentPendingRequest?.lawyer ? (
            <div className="space-y-2">
              <div className="font-semibold text-slate-900">{currentPendingRequest.lawyer.full_name}</div>
              <div className="text-sm text-slate-500">{t.pendingRequestBody}</div>
              <div className="text-xs text-slate-400">
                {t.selectedOn} {formatDate(currentPendingRequest.created_at, locale)}
              </div>
            </div>
          ) : (
            <p className="text-sm text-slate-500">{t.noPendingRequest}</p>
          )}
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 p-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t.search}
              className="w-full rounded-xl border border-slate-300 bg-white pl-9 pr-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-600 focus:border-transparent transition-all"
            />
          </div>
        </div>

        <h2 className="font-semibold text-slate-900 mb-4">{t.available}</h2>

        {lawyers.length === 0 ? (
          <div className="py-12 text-center">
            <Briefcase className="w-10 h-10 text-slate-200 mx-auto mb-3" />
            <p className="text-sm text-slate-400">{t.noLawyers}</p>
          </div>
        ) : filteredLawyers.length === 0 ? (
          <div className="py-12 text-center">
            <Search className="w-10 h-10 text-slate-200 mx-auto mb-3" />
            <p className="text-sm text-slate-400">{t.empty}</p>
          </div>
        ) : (
          <div className="grid xl:grid-cols-2 gap-4">
            {filteredLawyers.map((lawyer) => {
              const isAssigned = assignedLawyer?.user_id === lawyer.user_id
              const isPending = currentPendingRequest?.lawyer_user_id === lawyer.user_id
              const isBusy = requestingLawyerId === lawyer.user_id

              return (
                <div key={lawyer.user_id} className="rounded-2xl border border-slate-200 p-5 bg-slate-50/60">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="font-semibold text-slate-900">{lawyer.full_name}</div>
                      <div className="text-sm text-slate-500 mt-1">
                        {lawyer.specialization || messages.immigrantDashboard.defaultSpecialization}
                      </div>
                    </div>
                    {isAssigned && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2.5 py-1 text-xs font-medium text-green-700">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        {t.assigned}
                      </span>
                    )}
                    {!isAssigned && isPending && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-2.5 py-1 text-xs font-medium text-blue-700">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        {t.requestSent}
                      </span>
                    )}
                  </div>

                  <div className="mt-4 space-y-2 text-sm text-slate-600">
                    <div>
                      <span className="text-slate-400">{t.cards.specialization}:</span>{' '}
                      {lawyer.specialization || messages.immigrantDashboard.defaultSpecialization}
                    </div>
                    {lawyer.bar_association && (
                      <div>
                        <span className="text-slate-400">{t.cards.barAssociation}:</span>{' '}
                        {lawyer.bar_association}
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <Mail className="w-3.5 h-3.5 text-slate-400" />
                      <span>{lawyer.email}</span>
                    </div>
                    {lawyer.bio && <p className="text-slate-500 leading-relaxed">{lawyer.bio}</p>}
                  </div>

                  <button
                    type="button"
                    onClick={() => handleRequestLawyer(lawyer)}
                    disabled={Boolean(assignedLawyer) || isAssigned || isPending || isBusy || !immigrantId}
                    className="mt-5 w-full rounded-xl bg-brand-700 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-brand-800 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-500"
                  >
                    {isBusy ? t.requesting : isAssigned ? t.assigned : isPending ? t.requestSent : t.request}
                  </button>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
