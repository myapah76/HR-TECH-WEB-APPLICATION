'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LucideIcon, ChevronLeft, ChevronRight } from 'lucide-react'
import { useState } from 'react'
import { useAuthStore } from '@/src/stores/auth.store'

export interface SidebarItem {
  icon?: LucideIcon
  label: string
  path?: string
  badge?: number
  isHeader?: boolean
}

interface SidebarProps {
  items: SidebarItem[]
  title: string
  accentColor?: string
}

export default function Sidebar({ items, title, accentColor = 'blue' }: SidebarProps) {
  const pathname = usePathname()
  const { user } = useAuthStore()
  const [collapsed, setCollapsed] = useState(false)

  const colorMap: Record<
    string,
    {
      bg: string
      text: string
      hover: string
      activeBg: string
      activeText: string
      border: string
    }
  > = {
    blue: {
      bg: 'bg-blue-50',
      text: 'text-blue-600',
      hover: 'hover:bg-blue-50/60',
      activeBg: 'bg-blue-50',
      activeText: 'text-blue-700',
      border: 'border-blue-200',
    },
    emerald: {
      bg: 'bg-emerald-50',
      text: 'text-emerald-600',
      hover: 'hover:bg-emerald-50/60',
      activeBg: 'bg-emerald-50',
      activeText: 'text-emerald-700',
      border: 'border-emerald-200',
    },
    violet: {
      bg: 'bg-violet-50',
      text: 'text-violet-600',
      hover: 'hover:bg-violet-50/60',
      activeBg: 'bg-violet-50',
      activeText: 'text-violet-700',
      border: 'border-violet-200',
    },
    rose: {
      bg: 'bg-rose-50',
      text: 'text-rose-600',
      hover: 'hover:bg-rose-50/60',
      activeBg: 'bg-rose-50',
      activeText: 'text-rose-700',
      border: 'border-rose-200',
    },
  }

  const colors = colorMap[accentColor] || colorMap.blue

  return (
    <aside
      className={`${collapsed ? 'w-18' : 'w-64'} bg-white border-r border-slate-200/60 min-h-[calc(100vh-64px)] flex flex-col transition-all duration-300 shrink-0 sticky top-16 self-start`}
    >
      {/* Header */}
      <div className="p-4 border-b border-slate-100 flex items-center justify-between">
        {!collapsed && (
          <div className="flex items-center gap-3 min-w-0">
            {user && (
              <div
                className={`h-10 w-10 rounded-xl ${colors.bg} ${colors.text} flex items-center justify-center text-base font-black shrink-0`}
              >
                {(user.firstName || 'U').charAt(0).toUpperCase()}
              </div>
            )}
            <div className="min-w-0">
              <p className="text-sm font-black text-slate-800 truncate">
                {user?.firstName || user?.email || 'Ứng viên'}
              </p>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{title}</p>
            </div>
          </div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer shrink-0"
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>
      </div>

      {/* Nav Items */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {items.map((item, index) => {
          if (item.isHeader) {
            if (collapsed) {
              return <div key={index} className="h-px bg-slate-100 my-4 mx-2" />
            }
            return (
              <div
                key={index}
                className="px-3 pt-5 pb-1.5 text-[9px] font-black text-slate-400 uppercase tracking-widest select-none"
              >
                {item.label}
              </div>
            )
          }

          const isActive = item.path ? pathname === item.path : false
          const Icon = item.icon
          return (
            <Link
              key={item.path || index}
              href={item.path || '#'}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 group relative ${
                isActive
                  ? `${colors.activeBg} ${colors.activeText} shadow-xs border ${colors.border}`
                  : `text-slate-600 ${colors.hover} hover:text-slate-900`
              }`}
              title={collapsed ? item.label : undefined}
            >
              {Icon && (
                <Icon
                  className={`h-5 w-5 shrink-0 ${isActive ? colors.text : 'text-slate-400 group-hover:text-slate-600'} transition-colors`}
                />
              )}
              {!collapsed && (
                <>
                  <span className="truncate">{item.label}</span>
                  {item.badge !== undefined && (
                    <span
                      className={`ml-auto ${colors.bg} ${colors.text} text-[10px] font-black px-1.5 py-0.5 rounded-md min-w-5 text-center`}
                    >
                      {item.badge > 99 ? '99+' : item.badge}
                    </span>
                  )}
                </>
              )}
              {collapsed && item.badge !== undefined && (
                <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[8px] font-black h-4 w-4 rounded-full flex items-center justify-center">
                  {item.badge > 9 ? '9+' : item.badge}
                </span>
              )}
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}
