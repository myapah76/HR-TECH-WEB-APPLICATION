'use client'

import { Suspense, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { resetPasswordSchema, ResetPasswordFormData } from '@/src/schemas/auth.schema'
import { useResetPassword } from '@/src/hooks/auth/auth.hooks'
import { motion } from 'motion/react'
import { Card, CardContent } from '@/src/components/ui/card'
import { Label } from '@/src/components/ui/label'
import { Input } from '@/src/components/ui/input'
import { Button } from '@/src/components/ui/button'
import { Lock, Eye, EyeOff, Loader2 } from 'lucide-react'
import { getErrorMessage } from '@/src/utils/get-error-message'

import { toast } from 'sonner'

function ResetPasswordContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const resetToken = searchParams.get('reset-token') || ''

  const resetPasswordMutation = useResetPassword()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
  })

  const onSubmit = async (data: ResetPasswordFormData) => {
    if (!resetToken) {
      toast.error('Vui lòng thử lại quá trình quên mật khẩu.')
      return
    }

    resetPasswordMutation.mutate(
      { resetToken, newPassword: data.password },
      {
        onSuccess: () => {
          toast.success('Đặt lại mật khẩu thành công! Vui lòng đăng nhập.')
          router.push('/login')
        },
        onError: (error) => {
          toast.error(getErrorMessage(error))
        },
      }
    )
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
              <h1 className="text-2xl font-black tracking-tight text-slate-900">
                Tạo mật khẩu mới
              </h1>
              <p className="text-xs text-slate-500 font-medium px-4">
                Vui lòng nhập mật khẩu mới cho tài khoản của bạn.
              </p>
            </div>

            <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-slate-700">Mật khẩu mới</Label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 pointer-events-none">
                    <Lock className="h-4 w-4" />
                  </span>
                  <Input
                    {...register('password')}
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    className="pl-10 text-xs font-semibold"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-0 top-0 h-full px-3 text-slate-400 hover:text-slate-650 hover:bg-transparent cursor-pointer"
                  >
                    {showPassword ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                  </Button>
                </div>
                {errors.password && (
                  <p className="text-xs font-bold text-red-500 mt-1.5">{errors.password.message}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-slate-700">Xác nhận mật khẩu</Label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 pointer-events-none">
                    <Lock className="h-4 w-4" />
                  </span>
                  <Input
                    {...register('confirmPassword')}
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    className="pl-10 text-xs font-semibold"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-0 top-0 h-full px-3 text-slate-400 hover:text-slate-650 hover:bg-transparent cursor-pointer"
                  >
                    {showConfirmPassword ? (
                      <Eye className="h-4 w-4" />
                    ) : (
                      <EyeOff className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                {errors.confirmPassword && (
                  <p className="text-xs font-bold text-red-500 mt-1.5">
                    {errors.confirmPassword.message}
                  </p>
                )}
              </div>

              <Button
                type="submit"
                disabled={resetPasswordMutation.isPending}
                className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white font-black text-xs sm:text-sm py-4 rounded-xl 
                transition-all duration-300 shadow-lg shadow-blue-600/20 hover:shadow-xl hover:shadow-blue-600/30 hover:scale-[1.02] 
                hover:-translate-y-0.5 active:scale-98 flex items-center justify-center gap-2 cursor-pointer tracking-wider uppercase h-auto"
              >
                {resetPasswordMutation.isPending ? 'ĐANG CẬP NHẬT...' : 'ĐẶT LẠI MẬT KHẨU'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[calc(100vh-180px)] flex items-center justify-center">
          <Loader2 className="animate-spin text-blue-600 w-8 h-8" />
        </div>
      }
    >
      <ResetPasswordContent />
    </Suspense>
  )
}
