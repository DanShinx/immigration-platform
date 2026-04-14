import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export const caseStatusLabels: Record<string, { label: string; color: string }> = {
  pending: { label: 'Pendiente', color: 'bg-yellow-100 text-yellow-800' },
  in_review: { label: 'En revisión', color: 'bg-blue-100 text-blue-800' },
  documents_required: { label: 'Documentos requeridos', color: 'bg-orange-100 text-orange-800' },
  submitted: { label: 'Enviado', color: 'bg-purple-100 text-purple-800' },
  approved: { label: 'Aprobado', color: 'bg-green-100 text-green-800' },
  rejected: { label: 'Rechazado', color: 'bg-red-100 text-red-800' },
}
