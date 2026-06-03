import Link from "next/link";
import { Bell, ChevronDown, Globe, Menu, LogOut, User } from "lucide-react";
import { Button } from "@/src/components/ui/button";

export default function Header() {
  return (
    <header
      className="sticky top-0 z-45 w-full bg-white/80 backdrop-blur-md border-b border-slate-200/60 shadow-xs transition-all duration-300"
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
              <span className="text-2xl font-black tracking-tight text-blue-900 font-sans transition-all group-hover:text-blue-800">
                HR <span className="text-blue-500 font-black">- Tech</span>
              </span>
            </div>
            <div className="hidden lg:block h-6 w-px bg-slate-200"></div>
            <span className="hidden lg:block text-[9px] text-slate-400 font-semibold tracking-wider uppercase leading-none max-w-[120px]">
              LEADING THE HUMAN RESOURCES INDUSTRY
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav
            className="hidden md:flex items-center gap-1.5 lg:gap-4.5"
            id="desktop-nav"
          >
            <Link
              href="/"
              className="text-sm font-bold transition-all duration-200 px-3 py-1.5 rounded-xl text-blue-650 bg-blue-50/70 border border-blue-100/40 shadow-xs"
              id="nav-home"
            >
              Home
            </Link>
            <Link
              href="/jobs"
              className="text-sm font-bold transition-all duration-200 px-3 py-1.5 rounded-xl text-slate-650 hover:text-blue-600 hover:bg-slate-50"
              id="nav-jobs"
            >
              Find Jobs
            </Link>
            <Link
              href="/companies"
              className="text-sm font-bold transition-all duration-200 px-3 py-1.5 rounded-xl text-slate-650 hover:text-blue-600 hover:bg-slate-50"
              id="nav-companies"
            >
              Companies
            </Link>
            <Link
              href="/salary-guide"
              className="text-sm font-bold transition-all duration-200 px-3 py-1.5 rounded-xl text-slate-650 hover:text-blue-600 hover:bg-slate-50"
              id="nav-salary"
            >
              Salary Insight
            </Link>
            <Link
              href="/handbook"
              className="text-sm font-bold transition-all duration-200 px-3 py-1.5 rounded-xl text-slate-650 hover:text-blue-600 hover:bg-slate-50"
              id="nav-handbook"
            >
              Handbook
            </Link>
          </nav>

          {/* User & Settings Panel */}
          <div
            className="hidden md:flex items-center gap-3.5 lg:gap-4.5"
            id="header-actions"
          >
            {/* Notifications */}
            <div className="relative animate-fade-in">
              <Button
                variant="ghost"
                className="relative p-2 text-slate-500 hover:text-blue-600 hover:bg-slate-55 rounded-full transition-all cursor-pointer hover:scale-105 h-auto w-auto"
                id="btn-notification"
              >
                <Bell className="h-5 w-5" />
                <span className="absolute top-1.5 right-1.5 h-2.5 w-2.5 rounded-full bg-rose-500 ring-2 ring-white animate-pulse"></span>
              </Button>
            </div>

            <Link
              href="/login"
              className="flex items-center gap-2 text-sm font-bold text-slate-700 hover:text-blue-600 transition-all hover:scale-102"
              id="btn-login"
            >
              <div className="bg-slate-100 rounded-full p-1.5 text-slate-550 border border-slate-200/50">
                <User className="h-4 w-4" />
              </div>
              <span>Đăng nhập</span>
            </Link>

            {/* Recruiter Dropdown Menu */}
            <div className="relative" id="cta-recruiter-dropdown">
              <Button
                className="bg-gradient-to-r from-slate-900 to-slate-800 hover:from-slate-800 hover:to-slate-750 border border-slate-700/50 text-white font-bold text-xs py-2.5 px-4.5 rounded-xl shadow-md hover:shadow-lg transition-all flex items-center gap-1.5 cursor-pointer h-auto"
                id="btn-recruiter-trigger"
              >
                <div className="text-left">
                  <p className="font-extrabold text-[10px] text-zinc-300 uppercase tracking-wider flex items-center gap-1">
                    For Employers
                    <ChevronDown className="h-3 w-3 shrink-0" />
                  </p>
                  <p className="text-[11px] font-medium leading-tight text-slate-450">
                    Post job, Search resume
                  </p>
                </div>
              </Button>
            </div>
          </div>

          {/* Mobile menu button */}
          <div
            className="flex md:hidden items-center gap-3"
            id="mobile-menu-actions"
          >
            <Link
              href="/login?role=recruiter"
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs py-1.5 px-3 rounded-lg"
              id="cta-recruiter-mob"
            >
              Post jobs
            </Link>
            <Button
              variant="ghost"
              className="text-gray-500 hover:text-blue-600 p-1.5 h-auto"
              id="btn-mobile-menu"
            >
              <Menu className="h-6 w-6" />
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Panel */}
      <div
        className="md:hidden bg-white border-t border-gray-100 py-3 px-4 shadow-inner"
        id="mobile-navigation-panel"
      >
        <nav className="flex flex-col gap-2 mb-4">
          <Link
            href="/"
            className="text-left text-base font-semibold py-2 px-3 rounded-lg text-blue-600 bg-blue-50"
            id="mob-nav-home"
          >
            Home
          </Link>
          <Link
            href="/jobs"
            className="text-left text-base font-semibold py-2 px-3 rounded-lg text-gray-700 hover:bg-gray-50"
            id="mob-nav-jobs"
          >
            Find Jobs
          </Link>
          <Link
            href="/companies"
            className="text-left text-base font-semibold py-2 px-3 rounded-lg text-gray-700 hover:bg-gray-50"
            id="mob-nav-companies"
          >
            Companies
          </Link>
          <Link
            href="/salary-guide"
            className="text-left text-base font-semibold py-2 px-3 rounded-lg text-gray-700 hover:bg-gray-50"
            id="mob-nav-salary"
          >
            Salary Insight
          </Link>
          <Link
            href="/handbook"
            className="text-left text-base font-semibold py-2 px-3 rounded-lg text-gray-700 hover:bg-gray-50"
            id="mob-nav-handbook"
          >
            Handbook
          </Link>
        </nav>
        <div className="flex flex-col gap-3 pt-3 border-t border-gray-100">
          <Link
            href="/dashboard"
            className="flex items-center gap-2.5 text-base font-semibold text-slate-700 py-2 px-3 hover:bg-slate-50 rounded-lg text-left w-full"
            id="mob-btn-dashboard"
          >
            <div className="bg-blue-600 text-white rounded-full h-8 w-8 flex items-center justify-center font-black shrink-0 text-xs">
              JD
            </div>
            <span className="truncate">John Doe</span>
          </Link>
          <Button
            variant="ghost"
            className="flex items-center gap-2.5 text-base font-semibold text-rose-600 py-2 px-3 hover:bg-rose-50 hover:text-rose-600 rounded-lg text-left w-full cursor-pointer h-auto justify-start"
            id="mob-btn-logout"
          >
            <LogOut className="h-5 w-5" />
            <span>Sign out</span>
          </Button>
          <div className="flex items-center justify-between py-2 px-3 border border-gray-150 rounded-lg text-sm text-gray-600">
            <span className="font-semibold">Language:</span>
            <select className="font-extrabold text-blue-600 bg-transparent cursor-pointer focus:outline-none">
              <option value="en">English</option>
              <option value="vi">Tiếng Việt</option>
            </select>
          </div>
        </div>
      </div>
    </header>
  );
}
