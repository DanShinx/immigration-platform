import { defaultLocale, getTranslations, type Locale } from '@/lib/translations'

const DEFAULT_DOCUMENTS_BUCKET = 'case-documents'

export const documentsBucket =
  process.env.NEXT_PUBLIC_SUPABASE_DOCUMENTS_BUCKET || DEFAULT_DOCUMENTS_BUCKET

export const documentTypeValues = [
  'passport',
  'nie',
  'visa',
  'residence_proof',
  'criminal_record',
  'birth_certificate',
  'marriage_certificate',
  'work_contract',
  'bank_statement',
  'other',
] as const

export function getDocumentTypeOptions(locale: Locale = defaultLocale) {
  return documentTypeValues.map((value) => ({
    value,
    label: getDocumentTypeLabel(value, locale),
  }))
}

export function getDocumentTypeLabel(
  documentType?: string | null,
  locale: Locale = defaultLocale
) {
  const messages = getTranslations(locale)

  if (!documentType) return messages.shared.placeholders.unavailable

  return messages.shared.documentTypes[
    documentType as keyof typeof messages.shared.documentTypes
  ] || documentType
}

export function sanitizeFileName(fileName: string) {
  return fileName
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9._-]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .toLowerCase()
}

export function buildDocumentStoragePath(immigrantId: string, fileName: string) {
  const timestamp = Date.now()
  const sanitizedName = sanitizeFileName(fileName)
  return `${immigrantId}/${timestamp}-${sanitizedName}`
}

export function isAbsoluteUrl(value: string) {
  return /^https?:\/\//i.test(value)
}

export function getStoragePathFromFileUrl(fileUrl: string) {
  if (!isAbsoluteUrl(fileUrl)) return fileUrl

  try {
    const url = new URL(fileUrl)
    const patterns = [
      `/storage/v1/object/public/${documentsBucket}/`,
      `/storage/v1/object/sign/${documentsBucket}/`,
      `/storage/v1/object/authenticated/${documentsBucket}/`,
    ]

    const match = patterns.find((pattern) => url.pathname.includes(pattern))
    if (!match) return null

    const [, rawPath = ''] = url.pathname.split(match)
    return decodeURIComponent(rawPath)
  } catch {
    return null
  }
}

export function formatFileSize(bytes?: number | null, locale: Locale = defaultLocale) {
  if (!bytes || Number.isNaN(bytes)) return getTranslations(locale).shared.placeholders.unavailable

  const units = ['B', 'KB', 'MB', 'GB']
  let value = bytes
  let unitIndex = 0

  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024
    unitIndex += 1
  }

  return `${value >= 10 || unitIndex === 0 ? value.toFixed(0) : value.toFixed(1)} ${units[unitIndex]}`
}
