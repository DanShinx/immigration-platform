'use client'

import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import {
  defaultLocale,
  getTranslations,
  localeStorageKey,
  resolveLocale,
  type Locale,
} from '@/lib/translations'

interface I18nContextValue {
  locale: Locale
  setLocale: (locale: Locale) => void
  messages: ReturnType<typeof getTranslations>
}

const I18nContext = createContext<I18nContextValue | null>(null)

function getInitialLocale(): Locale {
  if (typeof window === 'undefined') return defaultLocale

  const storedLocale = window.localStorage.getItem(localeStorageKey)
  if (storedLocale) return resolveLocale(storedLocale)

  return resolveLocale(window.navigator.language)
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocale] = useState<Locale>(getInitialLocale)

  useEffect(() => {
    window.localStorage.setItem(localeStorageKey, locale)
    document.documentElement.lang = locale
  }, [locale])

  const value = useMemo(
    () => ({
      locale,
      setLocale,
      messages: getTranslations(locale),
    }),
    [locale]
  )

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}

export function useI18n() {
  const context = useContext(I18nContext)

  if (!context) {
    throw new Error('useI18n must be used within LanguageProvider')
  }

  return context
}
