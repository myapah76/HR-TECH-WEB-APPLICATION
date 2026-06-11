'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LucideIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import { useState } from 'react';
import { useAuthStore } from '@/src/stores/auth.store';

export interface SidebarItem {
  icon: LucideIcon;
  label: string;
  path: string;
  badge?: number;
}

interface SidebarProps {
  items: SidebarItem[];
  title: string;
  accentColor?: string;
}

export default function Sidebar({ items, title, accentColor = 'blue' }: SidebarProps) {
  const pathname = usePathname();
  const { user, logout } = useAuthStore();
  const [collapsed, setCollapsed] = useState(false);

  const colorMap: Record<string, { bg: string; text: string; hover: string; activeBg: string; activeText: string; border: string }> = {
    blue: { bg: 'bg-blue-50', text: 'text-blue-600', hover: 'hover:bg-blue-50/60', activeBg: 'bg-blue-50', activeText: 'text-blue-700', border: 'border-blue-200' },
    emerald: { bg: 'bg-emerald-50', text: 'text-emerald-600', hover: 'hover:bg-emerald-50/60', activeBg: 'bg-emerald-50', activeText: 'text-emerald-700', border: 'border-emerald-200' },
    violet: { bg: 'bg-violet-50', text: 'text-violet-600', hover: 'hover:bg-violet-50/60', activeBg: 'bg-violet-50', activeText: 'text-violet-700', border: 'border-violet-200' },
    rose: { bg: 'bg-rose-50', text: 'text-rose-600', hover: 'hover:bg-rose-50/60', activeBg: 'bg-rose-50', activeText: 'text-rose-700', border: 'border-rose-200' },
  };

  const colors = colorMap[accentColor] || colorMap.blue;

  return (
    <aside className={`${collapsed ? 'w-[72px]' : 'w-64'} bg-white border-r border-slate-200/60 min-h-[calc(100vh-64px)] flex flex-col transition-all duration-300 shrink-0 sticky top-16 self-start`}>
      {/* Header */}
      <div className="p-4 border-b border-slate-100 flex items-center justify-between">
        {!collapsed && (
          <div className="flex items-center gap-3 min-w-0">
            {user && (
              <div className={`h-10 w-10 rounded-xl ${colors.bg} ${colors.text} flex items-center justify-center text-base font-black shrink-0`}>
                {(user.firstName || 'U').charAt(0).toUpperCase()}
              </div>
            )}
            <div className="min-w-0">
              <p className="text-sm font-black text-slate-800 truncate">{user?.firstName || user?.email || 'Ứng viên'}</p>
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
        {items.map((item) => {
          const isActive = pathname === item.path;
          const Icon = item.icon;
          return (
            <Link
              key={item.path}
              href={item.path}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 group relative ${
                isActive
                  ? `${colors.activeBg} ${colors.activeText} shadow-xs border ${colors.border}`
                  : `text-slate-600 ${colors.hover} hover:text-slate-900`
              }`}
              title={collapsed ? item.label : undefined}
            >
              <Icon className={`h-5 w-5 shrink-0 ${isActive ? colors.text : 'text-slate-400 group-hover:text-slate-600'} transition-colors`} />
              {!collapsed && (
                <>
                  <span className="truncate">{item.label}</span>
                  {item.badge !== undefined && item.badge > 0 && (
                    <span className={`ml-auto ${colors.bg} ${colors.text} text-[10px] font-black px-1.5 py-0.5 rounded-md min-w-[20px] text-center`}>
                      {item.badge > 99 ? '99+' : item.badge}
                    </span>
                  )}
                </>
              )}
              {collapsed && item.badge !== undefined && item.badge > 0 && (
                 <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[8px] font-black h-4 w-4 rounded-full flex items-center justify-center">
                  {item.badge > 9 ? '9+' : item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      {!collapsed && (
        <div className="p-3 border-t border-slate-100">
          <button
            onClick={logout}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold text-rose-500 hover:bg-rose-50 hover:text-rose-700 transition-all w-full cursor-pointer"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
            <span>Đăng xuất</span>
          </button>
        </div>
      )}
    </aside>
  );
}
