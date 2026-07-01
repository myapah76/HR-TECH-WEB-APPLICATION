'use client'
import Link from 'next/link'
import { Mail, ArrowLeft } from 'lucide-react'
import { motion } from 'motion/react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { forgotPasswordSchema, ForgotPasswordFormData } from '@/src/schemas/auth.schema'
import { Button } from '@/src/components/ui/button'
import { Input } from '@/src/components/ui/input'
import { Card, CardContent } from '@/src/components/ui/card'
import { Label } from '@/src/components/ui/label'
import { useRouter } from 'next/navigation'
import { useForgotPassword } from '@/src/hooks/auth'
import { OtpType } from '@/src/enums/otp.enum'

import { toast } from 'sonner'

export default function ForgotPasswordPage() {
  const router = useRouter()
  const forgotPasswordMutation = useForgotPassword()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
  })

  const onSubmit = async (data: ForgotPasswordFormData) => {
    forgotPasswordMutation.mutate(data, {
      onSuccess: (response) => {
        toast.success('Đã gửi mã xác nhận. Vui lòng kiểm tra email!')
        router.push(
          `/confirm-otp?email=${response?.email}&expireIn=${response?.expireIn}&otpType=${OtpType.FORGET_PASSWORD}`
        )
      },
    })
  }

  return (
    <div className="min-h-[calc(100vh-180px)] flex items-center justify-center px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <Card className="bg-white border border-slate-200/60 shadow-xl rounded-3xl overflow-hidden py-0 gap-0">
          <div className="h-1.5 bg-linear-to-r from-blue-600 via-indigo-600 to-violet-600"></div>

          <CardContent className="p-8">
            <div className="text-center space-y-2 mb-6">
              <h1 className="text-2xl font-black tracking-tight text-slate-900">Quên mật khẩu?</h1>
              <p className="text-xs text-slate-500 font-medium px-4">
                Đừng lo lắng! Vui lòng nhập địa chỉ email liên kết với tài khoản của bạn.
              </p>
            </div>

            <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-slate-700">Email</Label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 pointer-events-none">
                    <Mail className="h-4 w-4" />
                  </span>
                  <Input
                    {...register('email')}
                    type="email"
                    placeholder="tenban@email.com"
                    className="pl-10 text-xs font-semibold"
                  />
                </div>
                {errors.email && (
                  <p className="text-xs font-bold text-red-500 mt-1.5">{errors.email.message}</p>
                )}
              </div>

              <Button
                type="submit"
                disabled={forgotPasswordMutation.isPending}
                className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white font-black text-xs sm:text-sm py-4 rounded-xl 
                transition-all duration-300 shadow-lg shadow-blue-600/20 hover:shadow-xl hover:shadow-blue-600/30 hover:scale-[1.02] 
                hover:-translate-y-0.5 active:scale-98 flex items-center justify-center gap-2 cursor-pointer tracking-wider uppercase h-auto"
              >
                {forgotPasswordMutation.isPending ? 'ĐANG GỬI MÃ...' : 'GỬI MÃ XÁC NHẬN'}
              </Button>
            </form>

            <div className="mt-8 text-center">
              <Link
                href="/login"
                className="inline-flex items-center gap-2 text-[11px] font-bold text-slate-500 hover:text-blue-600 transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                Quay lại đăng nhập
              </Link>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
