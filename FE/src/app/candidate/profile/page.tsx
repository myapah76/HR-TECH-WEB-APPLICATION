'use client'

import { useState } from 'react'
import { useAuthStore } from '@/src/stores/auth.store'
import { User as UserIcon, UserCheck, KeyRound, Loader2 } from 'lucide-react'
import { ProfileCard } from '../../../components/candidate/profile/ProfileCard'
import { ProfileForm } from '../../../components/candidate/profile/ProfileForm'
import { PasswordForm } from '../../../components/candidate/profile/PasswordForm'

export default function CandidateProfilePage() {
  const { user } = useAuthStore()
  const [activeTab, setActiveTab] = useState<'profile' | 'password'>('profile')

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center py-32 space-y-4">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        <p className="text-sm font-semibold text-slate-500">Đang tải thông tin tài khoản...</p>
      </div>
    )
  }

  return (
    <div className="space-y-8 animate-fade-in">

      <div className="flex flex-col md:flex-row gap-8 items-start">
        {/* Left Side: Avatar and Tab Navigation */}
        <div className="w-full md:w-64 space-y-6">
          <ProfileCard user={user} />

          {/* Navigation Controls */}
          <div className="bg-slate-100 p-1.5 rounded-2xl flex flex-col gap-1.5 border border-slate-200/20">
            <button
              onClick={() => setActiveTab('profile')}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all w-full cursor-pointer ${
                activeTab === 'profile'
                  ? 'bg-white text-blue-600 shadow-md shadow-slate-200'
                  : 'text-slate-600 hover:bg-white/50 hover:text-slate-800'
              }`}
            >
              <UserCheck className="w-4 h-4" />
              <span>Thông tin cá nhân</span>
            </button>
            <button
              onClick={() => setActiveTab('password')}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all w-full cursor-pointer ${
                activeTab === 'password'
                  ? 'bg-white text-blue-600 shadow-md shadow-slate-200'
                  : 'text-slate-600 hover:bg-white/50 hover:text-slate-800'
              }`}
            >
              <KeyRound className="w-4 h-4" />
              <span>Đổi mật khẩu</span>
            </button>
          </div>
        </div>

        {/* Right Side: Tab Contents */}
        <div className="flex-1 w-full">
          {activeTab === 'profile' ? <ProfileForm user={user} /> : <PasswordForm user={user} />}
        </div>
      </div>
    </div>
  )
}
