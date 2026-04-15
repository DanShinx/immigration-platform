import type {
  CaseOutcome,
  CaseRecord,
  CaseStage,
  CaseTrackCode,
  CategoryCode,
  PaymentMilestoneType,
  PaymentStatus,
} from '@/types'
import { defaultLocale, type Locale } from '@/lib/translations'
import { getCaseContent } from '@/lib/case-content'

export const publicCategoryOrder: CategoryCode[] = [
  'entrepreneurs',
  'highly_qualified',
  'researchers',
  'ict',
  'collective_ict',
  'audiovisual',
  'nomad',
  'family',
]

export const nomadTrackValues: CaseTrackCode[] = [
  'nomad_holder',
  'nomad_family',
  'nomad_renewal',
]

export const caseTrackValues: CaseTrackCode[] = [
  'legacy_general',
  ...nomadTrackValues,
]

export const caseStageValues: CaseStage[] = [
  'intake',
  'eligibility_check',
  'lawyer_review',
  'documents_required',
  'payment_pending',
  'ready_to_file',
  'submitted',
  'approved',
  'rejected',
  'closed',
]

export const paymentStatusValues: PaymentStatus[] = [
  'not_needed',
  'pending',
  'requested',
  'paid',
  'waived',
]

export const paymentMilestoneValues: PaymentMilestoneType[] = [
  'consultation',
  'case_opening',
  'filing',
  'renewal',
]

export function getCategoryMeta(categoryCode: CategoryCode, locale: Locale = defaultLocale) {
  const content = getCaseContent(locale)
  return content.categories.cards[categoryCode]
}

export function getCaseTrackMeta(trackCode: CaseTrackCode, locale: Locale = defaultLocale) {
  const content = getCaseContent(locale)
  return content.tracks[trackCode]
}

export function getCaseStageMeta(stage: string, locale: Locale = defaultLocale) {
  const content = getCaseContent(locale)
  const labels = content.caseStages

  const colorMap: Record<string, string> = {
    intake: 'bg-slate-100 text-slate-700',
    eligibility_check: 'bg-blue-100 text-blue-700',
    lawyer_review: 'bg-indigo-100 text-indigo-700',
    documents_required: 'bg-amber-100 text-amber-700',
    payment_pending: 'bg-orange-100 text-orange-700',
    ready_to_file: 'bg-cyan-100 text-cyan-700',
    submitted: 'bg-purple-100 text-purple-700',
    approved: 'bg-green-100 text-green-700',
    rejected: 'bg-rose-100 text-rose-700',
    closed: 'bg-slate-200 text-slate-700',
  }

  return {
    label: labels[stage as keyof typeof labels] || stage,
    color: colorMap[stage] || 'bg-slate-100 text-slate-600',
  }
}

export function getCaseOutcomeLabel(outcome?: string | null, locale: Locale = defaultLocale) {
  const content = getCaseContent(locale)
  if (!outcome) return content.outcomes.pending
  return content.outcomes[outcome as keyof typeof content.outcomes] || outcome
}

export function getPaymentStatusLabel(status: PaymentStatus, locale: Locale = defaultLocale) {
  const content = getCaseContent(locale)
  return content.paymentStatuses[status]
}

export function getPaymentMilestoneLabel(
  milestoneType: PaymentMilestoneType,
  locale: Locale = defaultLocale
) {
  const content = getCaseContent(locale)
  return content.paymentMilestones[milestoneType]
}

export function isCaseResolved(caseRecord: Pick<CaseRecord, 'stage'> | null | undefined) {
  return caseRecord?.stage === 'approved' || caseRecord?.stage === 'rejected' || caseRecord?.stage === 'closed'
}

export function isCaseActive(caseRecord: Pick<CaseRecord, 'stage'> | null | undefined) {
  if (!caseRecord) return false
  return !isCaseResolved(caseRecord)
}

export function sortCasesByRecency<T extends Pick<CaseRecord, 'updated_at' | 'created_at'>>(cases: T[]) {
  return [...cases].sort((a, b) => {
    const aDate = new Date(a.updated_at || a.created_at).getTime()
    const bDate = new Date(b.updated_at || b.created_at).getTime()
    return bDate - aDate
  })
}

export function isCaseDeleted(
  caseRecord: { metadata?: Record<string, unknown> | null } | null | undefined
) {
  const deletedFlag = caseRecord?.metadata?.deleted_by_immigrant
  return deletedFlag === true || deletedFlag === 'true'
}

export function filterVisibleCases<T>(cases: T[]) {
  return cases.filter((caseRecord) => !isCaseDeleted(caseRecord as { metadata?: Record<string, unknown> | null }))
}

export function getDefaultCaseTitle(trackCode: CaseTrackCode, locale: Locale = defaultLocale) {
  return getCaseTrackMeta(trackCode, locale).title
}

export function getInitialCaseStage(trackCode: CaseTrackCode): CaseStage {
  return trackCode === 'nomad_renewal' ? 'eligibility_check' : 'intake'
}

export function getDefaultPaymentPlan(trackCode: CaseTrackCode): PaymentMilestoneType[] {
  const basePlan: PaymentMilestoneType[] = ['consultation', 'case_opening', 'filing']

  if (trackCode === 'nomad_renewal') {
    return ['consultation', 'renewal']
  }

  return basePlan
}

export function mapLegacyStatusToStage(status?: string | null): CaseStage {
  switch (status) {
    case 'pending':
      return 'intake'
    case 'in_review':
      return 'lawyer_review'
    case 'documents_required':
      return 'documents_required'
    case 'submitted':
      return 'submitted'
    case 'approved':
      return 'approved'
    case 'rejected':
      return 'rejected'
    default:
      return 'intake'
  }
}

export function mapStageToLegacyStatus(stage: CaseStage): string {
  switch (stage) {
    case 'intake':
    case 'eligibility_check':
      return 'pending'
    case 'lawyer_review':
      return 'in_review'
    case 'documents_required':
      return 'documents_required'
    case 'payment_pending':
    case 'ready_to_file':
    case 'submitted':
      return 'submitted'
    case 'approved':
      return 'approved'
    case 'rejected':
      return 'rejected'
    case 'closed':
      return 'approved'
    default:
      return 'pending'
  }
}

export function deriveOutcomeFromStage(stage: CaseStage): CaseOutcome | null {
  switch (stage) {
    case 'approved':
      return 'approved'
    case 'rejected':
      return 'rejected'
    case 'closed':
      return 'renewed'
    default:
      return null
  }
}
