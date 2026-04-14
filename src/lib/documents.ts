const DEFAULT_DOCUMENTS_BUCKET = 'case-documents'

export const documentsBucket =
  process.env.NEXT_PUBLIC_SUPABASE_DOCUMENTS_BUCKET || DEFAULT_DOCUMENTS_BUCKET

export const documentTypeOptions = [
  { value: 'passport', label: 'Pasaporte' },
  { value: 'nie', label: 'NIE / TIE' },
  { value: 'visa', label: 'Visado' },
  { value: 'residence_proof', label: 'Empadronamiento / domicilio' },
  { value: 'criminal_record', label: 'Antecedentes penales' },
  { value: 'birth_certificate', label: 'Certificado de nacimiento' },
  { value: 'marriage_certificate', label: 'Certificado de matrimonio' },
  { value: 'work_contract', label: 'Contrato de trabajo' },
  { value: 'bank_statement', label: 'Extracto bancario' },
  { value: 'other', label: 'Otro documento' },
] as const

export function getDocumentTypeLabel(documentType?: string | null) {
  if (!documentType) return 'Documento'

  return (
    documentTypeOptions.find((option) => option.value === documentType)?.label ||
    documentType
  )
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

export function formatFileSize(bytes?: number | null) {
  if (!bytes || Number.isNaN(bytes)) return 'Tamaño no disponible'

  const units = ['B', 'KB', 'MB', 'GB']
  let value = bytes
  let unitIndex = 0

  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024
    unitIndex += 1
  }

  return `${value >= 10 || unitIndex === 0 ? value.toFixed(0) : value.toFixed(1)} ${units[unitIndex]}`
}
