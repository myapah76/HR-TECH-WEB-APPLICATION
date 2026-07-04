'use client'
import { useEffect } from 'react'
import Link from 'next/link'
import { Bell, ChevronDown, LogOut, User as UserIcon } from 'lucide-react'
import { Button } from '@/src/components/ui/button'
import { ThemeToggle } from '@/src/components/layout/ThemeToggle'
import NotificationDropdown from '@/src/components/layout/NotificationDropdown'
import { useAuthStore } from '@/src/stores/auth.store'
import { logout as logoutService } from '@/src/services/auth.service'
import { useRouter, usePathname } from 'next/navigation'
import { useGetPublicSystemConfig } from '@/src/hooks/system'

const NAV_ITEMS = [
  { label: 'Trang chủ', path: '/', id: 'nav-home' },
  { label: 'Tìm việc', path: '/jobs', id: 'nav-jobs' },
  { label: 'Công ty', path: '/companies', id: 'nav-companies' },
  { label: 'Các gói', path: '/pricing', id: 'nav-pricing' },
]

export default function Header() {
  const { user, logout: clearAuth } = useAuthStore()
  const router = useRouter()
  const pathname = usePathname()
  const { data: config } = useGetPublicSystemConfig()

  useEffect(() => {
    if (config?.websiteName) {
      const currentTitle = document.title
      if (currentTitle.includes(' | ')) {
        const parts = currentTitle.split(' | ')
        parts[parts.length - 1] = config.websiteName
        document.title = parts.join(' | ')
      } else {
        document.title = config.websiteName
      }
    }
  }, [config, pathname])

  const handleLogout = async () => {
    try {
      await logoutService()
    } catch (e) {
      console.error(e)
    } finally {
      clearAuth()
      router.push('/')
    }
  }

  return (
    <header
      className="sticky top-0 z-45 w-full bg-white/80 dark:bg-slate-800/80 backdrop-blur-md border-b border-slate-200/60 dark:border-slate-800/60 shadow-xs transition-all duration-300"
      id="main-header"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-2 cursor-pointer group"
            id="logo-container"
          >
            <div className="flex items-center gap-1.5">
              <span className="text-2xl font-black tracking-tight text-blue-900 dark:text-slate-100 font-sans transition-all group-hover:text-blue-800 dark:group-hover:text-blue-255">
                {config?.websiteName || 'HR-Tech'}
              </span>
            </div>
            <div className="hidden lg:block h-6 w-px bg-slate-200 dark:bg-slate-800"></div>
            <span className="hidden lg:block text-[9px] text-slate-400 dark:text-slate-500 font-semibold tracking-wider uppercase leading-none max-w-30">
              LEADING THE HUMAN RESOURCES INDUSTRY
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1.5 lg:gap-4.5" id="desktop-nav">
            {NAV_ITEMS.map((item) => {
              const isActive = pathname === item.path
              return (
                <Link
                  key={item.id}
                  href={item.path}
                  className={`text-sm font-bold transition-all duration-200 px-3 py-1.5 rounded-xl ${
                    isActive
                      ? 'text-blue-650 dark:text-blue-400 bg-blue-50/70 dark:bg-blue-950/40 border border-blue-100/40 dark:border-blue-900/40 shadow-xs'
                      : 'text-slate-650 dark:text-slate-350 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                  id={item.id}
                >
                  {item.label}
                </Link>
              )
            })}
          </nav>

          {/* User & Settings Panel */}
          <div className="hidden md:flex items-center gap-3.5 lg:gap-4.5" id="header-actions">
            <ThemeToggle />
            {/* Notifications */}
            {user && (
              <div className="relative animate-fade-in">
                <NotificationDropdown />
              </div>
            )}

            {user ? (
              <div className="relative group animate-fade-in" id="user-dropdown">
                <div className="flex items-center gap-2 cursor-pointer text-sm font-bold text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-all bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-700 px-3 py-1.5 rounded-full border border-slate-200 dark:border-slate-700">
                  <div className="bg-blue-100 dark:bg-blue-950/40 rounded-full p-1 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-900/40">
                    <UserIcon className="h-4 w-4" />
                  </div>
                  <span>{user.firstName ? `${user.firstName} ${user.lastName}` : 'User'}</span>
                  <ChevronDown className="h-3 w-3 text-slate-400 group-hover:text-blue-600 transition-colors" />
                </div>
                {/* Dropdown Menu */}
                <div className="absolute right-0 top-[calc(100%+0.5rem)] w-56 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-[0_10px_40px_-15px_rgba(0,0,0,0.1)] opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 overflow-hidden transform origin-top-right group-hover:scale-100 scale-95">
                  <div className="p-2 border-b border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50">
                    <p className="text-sm font-bold text-slate-800 dark:text-slate-100 truncate px-2 pt-1">
                      {user.firstName ? `${user.firstName} ${user.lastName}` : 'User'}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate px-2 pb-1">
                      {user.email || 'user@example.com'}
                    </p>
                  </div>
                  <div className="p-2 flex flex-col gap-1">
                    <Link
                      href="/dashboard"
                      className="px-3 py-2 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-slate-700/50 rounded-lg transition-colors flex items-center gap-2"
                    >
                      <UserIcon className="h-4 w-4" />
                      Bảng điều khiển
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full px-3 py-2 text-sm font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded-lg transition-colors text-left flex items-center gap-2 cursor-pointer"
                    >
                      <LogOut className="h-4 w-4" />
                      Đăng xuất
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <Link
                href="/login"
                className="flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-all hover:scale-102"
                id="btn-login"
              >
                <div className="bg-slate-100 dark:bg-slate-800 rounded-full p-1.5 text-slate-550 dark:text-slate-400 border border-slate-200/50 dark:border-slate-700/50">
                  <UserIcon className="h-4 w-4" />
                </div>
                <span>Đăng nhập</span>
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Menu Panel */}
      <div
        className="md:hidden bg-white dark:bg-slate-900 border-t border-gray-100 dark:border-slate-800 py-3 px-4 shadow-inner"
        id="mobile-navigation-panel"
      >
        <nav className="flex flex-col gap-2 mb-4">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.path
            return (
              <Link
                key={`mob-${item.id}`}
                href={item.path}
                className={`text-left text-base font-semibold py-2 px-3 rounded-lg ${
                  isActive
                    ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40'
                    : 'text-gray-700 dark:text-slate-350 hover:bg-gray-55 dark:hover:bg-slate-800'
                }`}
                id={`mob-${item.id}`}
              >
                {item.label}
              </Link>
            )
          })}
        </nav>
        <div className="flex flex-col gap-3 pt-3 border-t border-gray-100 dark:border-slate-800">
          <div className="flex items-center justify-between px-3 py-1">
            <span className="text-sm font-semibold text-slate-500">Chế độ giao diện</span>
            <ThemeToggle />
          </div>
          {user ? (
            <>
              <Link
                href="/profile"
                className="flex items-center gap-2.5 text-base font-semibold text-slate-700 dark:text-slate-300 py-2 px-3 hover:bg-slate-55 dark:hover:bg-slate-800 rounded-lg text-left w-full"
                id="mob-btn-dashboard"
              >
                <div className="bg-blue-600 dark:bg-blue-500 text-white rounded-full h-8 w-8 flex items-center justify-center font-black shrink-0 text-xs">
                  {user.firstName ? user.firstName.charAt(0).toUpperCase() : 'U'}
                </div>
                <div className="flex flex-col overflow-hidden">
                  <span className="truncate leading-tight">
                    {user.firstName ? `${user.firstName} ${user.lastName}` : 'User'}
                  </span>
                  <span className="text-xs text-slate-500 dark:text-slate-400 truncate leading-tight font-normal">
                    {user.email || 'user@example.com'}
                  </span>
                </div>
              </Link>
              <Button
                variant="ghost"
                onClick={handleLogout}
                className="flex items-center gap-2.5 text-base font-semibold text-rose-600 dark:text-rose-450 py-2 px-3 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded-lg text-left w-full cursor-pointer h-auto justify-start"
                id="mob-btn-logout"
              >
                <LogOut className="h-5 w-5" />
                <span>Đăng xuất</span>
              </Button>
            </>
          ) : (
            <Link
              href="/login"
              className="flex items-center gap-2.5 text-base font-semibold text-blue-600 dark:text-blue-400 py-2 px-3 hover:bg-blue-50 dark:hover:bg-slate-800 rounded-lg text-left w-full"
              id="mob-btn-login"
            >
              <div className="bg-blue-100 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 rounded-full h-8 w-8 flex items-center justify-center shrink-0">
                <UserIcon className="h-4 w-4" />
              </div>
              <span>Đăng nhập</span>
            </Link>
          )}
        </div>
      </div>
    </header>
  )
}
