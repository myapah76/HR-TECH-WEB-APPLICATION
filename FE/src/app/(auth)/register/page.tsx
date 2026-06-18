'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'motion/react'
import { Card, CardContent } from '@/src/components/ui/card'
import { CandidateRegisterForm } from '@/src/components/register/CandidateRegisterForm'
import { CompanyRegisterForm } from '@/src/components/register/CompanyRegisterForm'

export default function RegisterPage() {
  const [activeTab, setActiveTab] = useState<'candidate' | 'company'>('candidate')

  return (
    <div className="min-h-[calc(100vh-180px)] flex items-center justify-center px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <Card className="bg-white border border-slate-200/60 shadow-xl rounded-3xl overflow-hidden py-0 gap-0">
          <div className="h-1.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600"></div>
          <CardContent className="p-8">
            <div className="text-center space-y-2">
              <h1 className="text-2xl font-black tracking-tight text-slate-900">
                Đăng ký tài khoản
              </h1>
              <p className="text-xs text-slate-500 font-medium">
                Trải nghiệm tìm kiếm việc làm thông minh bằng A.I
              </p>
            </div>

            {/* Tab Selector */}
            <div className="flex p-1 bg-slate-100/80 rounded-xl mt-5">
              <button
                type="button"
                onClick={() => setActiveTab('candidate')}
                className={`flex-1 text-center py-2.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  activeTab === 'candidate'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Ứng viên
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('company')}
                className={`flex-1 text-center py-2.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  activeTab === 'company'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Doanh nghiệp
              </button>
            </div>

            {activeTab === 'candidate' ? (
              <CandidateRegisterForm />
            ) : (
              <CompanyRegisterForm />
            )}

            <p className="text-center text-[10px] text-slate-400 font-bold mt-7">
              Đã có tài khoản?{' '}
              <Link
                href="/login"
                className="text-blue-600 hover:text-blue-800 hover:underline font-extrabold"
              >
                Đăng nhập ngay
              </Link>
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
