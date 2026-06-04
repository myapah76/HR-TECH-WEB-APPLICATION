'use client'

import { Suspense } from 'react'
import Link from 'next/link'
import { ChevronLeft, Loader2, MailCheck } from 'lucide-react'
import { motion } from 'motion/react'
import { Card, CardContent } from '@/src/components/ui/card'
import { VerifyOtpForm } from '@/src/components/VerifyOtpForm'
import { useSearchParams } from 'next/navigation'

export default function VerifyOtpPage() {
  const searchParams = useSearchParams()
  const email = searchParams.get('email') || ''
  const expireIn = searchParams.get('expireIn') || ''
  return (
    <div className="min-h-[calc(100vh-180px)] flex items-center justify-center px-4 py-12">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-md"
      >
        <Card className="bg-white border border-slate-200/60 shadow-xl rounded-3xl overflow-hidden py-0 gap-0">
          <div className="h-1.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600"></div>
          <CardContent className="p-8">
            <Link
              href="/register"
              className="inline-flex items-center text-sm font-semibold text-slate-400 hover:text-slate-700 transition-colors mb-6"
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Quay lại
            </Link>

            <div className="flex flex-col items-center text-center space-y-4">
              <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center shadow-inner">
                <MailCheck className="w-8 h-8 text-blue-600" />
              </div>
              <div>
                <h1 className="text-2xl font-black tracking-tight text-slate-900 mb-2">
                  Xác thực Email
                </h1>
                <p className="text-sm text-slate-500 font-medium px-4">
                  Chúng tôi đã gửi một mã OTP gồm 6 chữ số đến email:
                  <span className="font-bold text-slate-900">{email}</span>. Vui
                  lòng nhập mã để tiếp tục.
                </p>
              </div>
            </div>

            <Suspense
              fallback={
                <div className="h-48 flex items-center justify-center">
                  <Loader2 className="animate-spin text-blue-600 w-8 h-8" />
                </div>
              }
            >
              <VerifyOtpForm email={email} expireIn={Number(expireIn)} />
            </Suspense>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
