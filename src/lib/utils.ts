import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { defaultLocale, getTranslations, localeMeta, type Locale } from '@/lib/translations'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(dateString: string, locale: Locale = defaultLocale): string {
  return new Date(dateString).toLocaleDateString(localeMeta[locale].dateLocale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

const caseStatusColors: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  in_review: 'bg-blue-100 text-blue-800',
  documents_required: 'bg-orange-100 text-orange-800',
  submitted: 'bg-purple-100 text-purple-800',
  approved: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
}

export function getCaseStatusMeta(status: string, locale: Locale = defaultLocale) {
  const messages = getTranslations(locale)
  const label =
    messages.shared.caseStatuses[
      status as keyof typeof messages.shared.caseStatuses
    ] || status

  return {
    label,
    color: caseStatusColors[status] || 'bg-slate-100 text-slate-600',
  }
}
