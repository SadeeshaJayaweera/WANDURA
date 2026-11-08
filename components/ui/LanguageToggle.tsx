'use client'

import { useLanguage } from '@/components/providers/LanguageProvider'
import { Globe } from 'lucide-react'

export function LanguageToggle({ className = '' }: { className?: string }) {
  const { language, setLanguage } = useLanguage()

  return (
    <div
      className={`inline-flex items-center bg-gray-100/90 border border-gray-200/80 rounded-xl p-0.5 transition-colors ${className}`}
      title="Switch Language (භාෂාව වෙනස් කරන්න)"
    >
      <div className="flex items-center pl-2 pr-1.5 text-gray-400">
        <Globe className="h-3.5 w-3.5" />
      </div>

      <button
        type="button"
        onClick={() => setLanguage('en')}
        className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all ${
          language === 'en'
            ? 'bg-white text-blue-700 shadow-sm font-bold'
            : 'text-gray-500 hover:text-gray-900'
        }`}
      >
        EN
      </button>

      <button
        type="button"
        onClick={() => setLanguage('si')}
        className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all ${
          language === 'si'
            ? 'bg-blue-600 text-white shadow-sm font-bold'
            : 'text-gray-500 hover:text-gray-900'
        }`}
      >
        සිංහල
      </button>
    </div>
  )
}

