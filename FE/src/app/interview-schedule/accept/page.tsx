'use client'

import { Suspense, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'motion/react'
import { toast } from 'sonner'
import { ArrowLeft, CalendarCheck2, CheckCircle2, Loader2 } from 'lucide-react'
import { Button } from '@/src/components/ui/button'
import { Card, CardContent } from '@/src/components/ui/card'
import { useAcceptInterviewSchedule } from '@/src/hooks/application'

function AcceptInterviewScheduleContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get('token') || ''
  const acceptScheduleMutation = useAcceptInterviewSchedule()
  const [isAccepted, setIsAccepted] = useState(false)

  const handleAccept = () => {
    if (!token || acceptScheduleMutation.isPending || isAccepted) {
      if (!token) toast.error('Liên kết không hợp lệ hoặc thiếu token.')
      return
    }

    acceptScheduleMutation.mutate(token, {
      onSuccess: () => {
        setIsAccepted(true)
        toast.success('Bạn đã xác nhận lịch phỏng vấn.')
      },
    })
  }

  return (
    <div className="min-h-[calc(100vh-180px)] flex items-center justify-center px-4 py-12 bg-slate-50/60">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-lg"
      >
        <Card className="bg-white border border-slate-200/60 shadow-xl rounded-3xl overflow-hidden py-0 gap-0">
          <div className="h-1.5 bg-linear-to-r from-emerald-500 via-teal-500 to-cyan-500" />

          <CardContent className="p-8">
            <div className="text-center space-y-3 mb-6">
              <div className="mx-auto w-12 h-12 rounded-2xl bg-emerald-100 flex items-center justify-center">
                {isAccepted ? (
                  <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                ) : (
                  <CalendarCheck2 className="w-6 h-6 text-emerald-600" />
                )}
              </div>
              <h1 className="text-2xl font-black tracking-tight text-slate-900">
                {isAccepted ? 'Đã xác nhận lịch phỏng vấn' : 'Xác nhận lịch phỏng vấn'}
              </h1>
              <p className="text-xs text-slate-500 font-medium px-4">
                {isAccepted
                  ? 'Cảm ơn bạn. Nhà tuyển dụng đã được cập nhật trạng thái phỏng vấn.'
                  : 'Vui lòng xác nhận nếu bạn có thể tham gia buổi phỏng vấn theo lịch đã nhận trong email.'}
              </p>
            </div>

            {!token && (
              <div className="rounded-2xl border border-rose-100 bg-rose-50 p-4 mb-5">
                <p className="text-sm font-bold text-rose-600">
                  Liên kết xác nhận không hợp lệ hoặc thiếu token.
                </p>
              </div>
            )}

            {!isAccepted && (
              <Button
                type="button"
                onClick={handleAccept}
                disabled={!token || acceptScheduleMutation.isPending}
                className="w-full mt-4 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs sm:text-sm py-4 rounded-xl 
                transition-all duration-300 shadow-lg shadow-emerald-600/20 hover:shadow-xl hover:shadow-emerald-600/30 hover:scale-[1.02] 
                hover:-translate-y-0.5 active:scale-98 flex items-center justify-center gap-2 cursor-pointer tracking-wider uppercase h-auto"
              >
                {acceptScheduleMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    ĐANG XÁC NHẬN...
                  </>
                ) : (
                  'XÁC NHẬN LỊCH PHỎNG VẤN'
                )}
              </Button>
            )}

            {isAccepted && (
              <Button
                type="button"
                onClick={() => router.push('/')}
                className="w-full mt-4 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs sm:text-sm py-4 rounded-xl h-auto"
              >
                VỀ TRANG CHỦ
              </Button>
            )}

            <div className="mt-8 text-center">
              <Link
                href="/"
                className="inline-flex items-center gap-2 text-[11px] font-bold text-slate-500 hover:text-emerald-600 transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                Quay lại trang chủ
              </Link>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}

export default function AcceptInterviewSchedulePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[calc(100vh-180px)] flex items-center justify-center">
          <Loader2 className="animate-spin text-emerald-600 w-8 h-8" />
        </div>
      }
    >
      <AcceptInterviewScheduleContent />
    </Suspense>
  )
}
