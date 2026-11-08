'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { Language, translations, TranslationKey } from '@/lib/translations'

interface LanguageContextType {
  language: Language
  setLanguage: (lang: Language) => void
  toggleLanguage: () => void
  t: (key: TranslationKey, defaultText?: string) => string
  isSinhala: boolean
}

const LanguageContext = createContext<LanguageContextType>({
  language: 'en',
  setLanguage: () => {},
  toggleLanguage: () => {},
  t: (key: TranslationKey, defaultText?: string) => defaultText || key,
  isSinhala: false,
})

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>('en')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const saved = localStorage.getItem('wandura_language') as Language
    if (saved === 'en' || saved === 'si') {
      setLanguageState(saved)
    }
  }, [])

  const setLanguage = (lang: Language) => {
    setLanguageState(lang)
    if (typeof window !== 'undefined') {
      localStorage.setItem('wandura_language', lang)
    }
  }

  const toggleLanguage = () => {
    const nextLang: Language = language === 'en' ? 'si' : 'en'
    setLanguage(nextLang)
  }

  const t = (key: TranslationKey, defaultText?: string): string => {
    const langDict = translations[language]
    if (langDict && langDict[key]) {
      return langDict[key]
    }
    // Fallback to English
    if (translations.en[key]) {
      return translations.en[key]
    }
    return defaultText || key
  }

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        toggleLanguage,
        t,
        isSinhala: language === 'si',
      }}
    >
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  return useContext(LanguageContext)
}

