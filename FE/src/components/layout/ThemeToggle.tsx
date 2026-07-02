'use client'

import { useTheme } from '@/src/providers/ThemeProvider'
import { Sun, Moon, Monitor } from 'lucide-react'

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()

  return (
    <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200/60 dark:border-slate-700/60 select-none">
      <button
        onClick={() => setTheme('light')}
        className={`p-1.5 rounded-lg transition-all duration-200 cursor-pointer ${
          theme === 'light'
            ? 'bg-white dark:bg-slate-700 text-amber-500 shadow-xs scale-105'
            : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
        }`}
        title="Chế độ sáng"
      >
        <Sun className="h-4 w-4" />
      </button>
      <button
        onClick={() => setTheme('dark')}
        className={`p-1.5 rounded-lg transition-all duration-200 cursor-pointer ${
          theme === 'dark'
            ? 'bg-white dark:bg-slate-700 text-blue-500 dark:text-blue-400 shadow-xs scale-105'
            : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
        }`}
        title="Chế độ tối"
      >
        <Moon className="h-4 w-4" />
      </button>
      <button
        onClick={() => setTheme('system')}
        className={`p-1.5 rounded-lg transition-all duration-200 cursor-pointer ${
          theme === 'system'
            ? 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 shadow-xs scale-105'
            : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
        }`}
        title="Hệ thống"
      >
        <Monitor className="h-4 w-4" />
      </button>
    </div>
  )
}
