'use client'

import { useTheme } from '@/components/providers/ThemeProvider'
import { Moon, Sun } from 'lucide-react'

export function ThemeToggle({ className = '' }: { className?: string }) {
  const { isDark, toggleTheme } = useTheme()

  return (
    <button
      onClick={toggleTheme}
      type="button"
      className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-semibold border transition-all duration-200 shadow-sm ${
        isDark
          ? 'bg-slate-900 border-slate-700 text-blue-400 hover:border-blue-500 hover:text-blue-300 shadow-blue-950/50'
          : 'bg-gray-50 border-gray-200 text-gray-700 hover:border-gray-300 hover:text-gray-900'
      } ${className}`}
      aria-label={isDark ? 'Switch to Light Mode' : 'Switch to Night Mode'}
      title={isDark ? 'Switch to Light Mode' : 'Switch to Night Mode'}
    >
      {isDark ? (
        <>
          <Moon className="h-3.5 w-3.5 fill-blue-400 text-blue-400" />
          <span className="text-[11px] font-bold text-slate-200 tracking-wide">Night</span>
        </>
      ) : (
        <>
          <Sun className="h-3.5 w-3.5 text-amber-500" />
          <span className="text-[11px] font-bold text-gray-700 tracking-wide">Day</span>
        </>
      )}
    </button>
  )
}
