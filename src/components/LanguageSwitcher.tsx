'use client'

import { useI18n } from '@/components/LanguageProvider'
import { cn } from '@/lib/utils'
import { localeMeta, type Locale } from '@/lib/translations'

interface LanguageSwitcherProps {
  className?: string
}

export default function LanguageSwitcher({ className }: LanguageSwitcherProps) {
  const { locale, setLocale, messages } = useI18n()

  return (
    <div
      className={cn(
        'inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white p-1 shadow-sm',
        className
      )}
      aria-label={messages.shared.language}
      title={messages.shared.language}
    >
      {(Object.keys(localeMeta) as Locale[]).map((option) => (
        <button
          key={option}
          type="button"
          onClick={() => setLocale(option)}
          className={cn(
            'rounded-lg px-2.5 py-1.5 text-xs font-semibold transition-colors',
            locale === option
              ? 'bg-brand-700 text-white'
              : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'
          )}
        >
          {localeMeta[option].shortLabel}
        </button>
      ))}
    </div>
  )
}
