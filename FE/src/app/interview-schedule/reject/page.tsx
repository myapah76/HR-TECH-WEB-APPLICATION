'use client'

import { Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion } from 'motion/react'
import { CalendarClock, Loader2, MessageSquare, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'
import { Button } from '@/src/components/ui/button'
import { Card, CardContent } from '@/src/components/ui/card'
import { Input } from '@/src/components/ui/input'
import { Label } from '@/src/components/ui/label'
import { useRejectInterviewSchedule } from '@/src/hooks/application'

const rejectScheduleSchema = z.object({
  preferredInterviewDateTime: z.string().min(1, 'Vui lòng chọn thời gian mong muốn'),
  reason: z.string().min(1, 'Vui lòng nhập lý do hoặc lời nhắn'),
})

type RejectScheduleFormData = z.infer<typeof rejectScheduleSchema>

function RejectInterviewScheduleContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get('token') || ''
  const rejectScheduleMutation = useRejectInterviewSchedule()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RejectScheduleFormData>({
    resolver: zodResolver(rejectScheduleSchema),
  })

  const onSubmit = (data: RejectScheduleFormData) => {
    if (!token) {
      toast.error('Liên kết không hợp lệ hoặc thiếu token.')
      return
    }

    rejectScheduleMutation.mutate(
      {
        token,
        request: {
          preferredInterviewDateTime: new Date(data.preferredInterviewDateTime).toISOString(),
          reason: data.reason.trim(),
        },
      },
      {
        onSuccess: () => {
          toast.success('Đã gửi yêu cầu đổi lịch phỏng vấn.')
          router.push('/')
        },
      }
    )
  }

  return (
    <div className="min-h-[calc(100vh-180px)] flex items-center justify-center px-4 py-12 bg-slate-50/60">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-lg"
      >
        <Card className="bg-white border border-slate-200/60 shadow-xl rounded-3xl overflow-hidden py-0 gap-0">
          <div className="h-1.5 bg-linear-to-r from-orange-500 via-amber-500 to-yellow-500" />

          <CardContent className="p-8">
            <div className="text-center space-y-2 mb-6">
              <div className="mx-auto w-12 h-12 rounded-2xl bg-orange-100 flex items-center justify-center">
                <CalendarClock className="w-6 h-6 text-orange-600" />
              </div>
              <h1 className="text-2xl font-black tracking-tight text-slate-900">
                Yêu cầu đổi lịch phỏng vấn
              </h1>
              <p className="text-xs text-slate-500 font-medium px-4">
                Vui lòng cho nhà tuyển dụng biết thời gian bạn mong muốn và lý do cần đổi lịch.
              </p>
            </div>

            <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-slate-700">Thời gian mong muốn</Label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 pointer-events-none">
                    <CalendarClock className="h-4 w-4" />
                  </span>
                  <Input
                    {...register('preferredInterviewDateTime')}
                    type="datetime-local"
                    className="pl-10 text-xs font-semibold"
                  />
                </div>
                {errors.preferredInterviewDateTime && (
                  <p className="text-xs font-bold text-red-500 mt-1.5">
                    {errors.preferredInterviewDateTime.message}
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-slate-700">Lý do / lời nhắn</Label>
                <div className="relative">
                  <span className="absolute top-3 left-0 pl-3.5 flex items-center text-slate-400 pointer-events-none">
                    <MessageSquare className="h-4 w-4" />
                  </span>
                  <textarea
                    {...register('reason')}
                    rows={4}
                    placeholder="VD: Tôi không thể tham gia vào khung giờ đã đề xuất. Mong được đổi sang..."
                    className="w-full pl-10 pr-4 py-2.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-400"
                  />
                </div>
                {errors.reason && (
                  <p className="text-xs font-bold text-red-500 mt-1.5">{errors.reason.message}</p>
                )}
              </div>

              <Button
                type="submit"
                disabled={rejectScheduleMutation.isPending || !token}
                className="w-full mt-4 bg-orange-600 hover:bg-orange-700 text-white font-black text-xs sm:text-sm py-4 rounded-xl 
                transition-all duration-300 shadow-lg shadow-orange-600/20 hover:shadow-xl hover:shadow-orange-600/30 hover:scale-[1.02] 
                hover:-translate-y-0.5 active:scale-98 flex items-center justify-center gap-2 cursor-pointer tracking-wider uppercase h-auto"
              >
                {rejectScheduleMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    ĐANG GỬI...
                  </>
                ) : (
                  'GỬI YÊU CẦU ĐỔI LỊCH'
                )}
              </Button>
            </form>

            <div className="mt-8 text-center">
              <Link
                href="/"
                className="inline-flex items-center gap-2 text-[11px] font-bold text-slate-500 hover:text-orange-600 transition-colors"
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

export default function RejectInterviewSchedulePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[calc(100vh-180px)] flex items-center justify-center">
          <Loader2 className="animate-spin text-orange-600 w-8 h-8" />
        </div>
      }
    >
      <RejectInterviewScheduleContent />
    </Suspense>
  )
}
