'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'motion/react'
import { Lock, Eye, EyeOff, LogOut, Loader2 } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'

import { Button } from '@/src/components/ui/button'
import { Input } from '@/src/components/ui/input'
import { Card, CardContent } from '@/src/components/ui/card'
import { Label } from '@/src/components/ui/label'
import { useAuthStore } from '@/src/stores/auth.store'
import { useForceChangePassword } from '@/src/hooks/auth'

const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Mật khẩu hiện tại là bắt buộc'),
    newPassword: z
      .string()
      .min(6, 'Mật khẩu mới phải có ít nhất 6 ký tự')
      .refine(
        (val) => /[A-Za-z]/.test(val) && /[0-9]/.test(val),
        'Mật khẩu phải bao gồm cả chữ và số'
      ),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Mật khẩu xác nhận không khớp',
    path: ['confirmPassword'],
  })

type ChangePasswordFormData = z.infer<typeof changePasswordSchema>

export default function ForceChangePasswordPage() {
  const router = useRouter()
  const { user, accessToken, refreshToken, setAuth, logout } = useAuthStore()
  const forceChangePasswordMutation = useForceChangePassword()

  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ChangePasswordFormData>({
    resolver: zodResolver(changePasswordSchema),
  })

  const onSubmit = (data: ChangePasswordFormData) => {
    forceChangePasswordMutation.mutate(data, {
      onSuccess: () => {
        toast.success('Đổi mật khẩu thành công!')
        if (user && accessToken) {
          // Update the auth store to mark requirePasswordChange as false
          setAuth({
            user: { ...user, requirePasswordChange: false },
            accessToken,
            refreshToken: refreshToken || undefined,
          })
        }
        // Redirect to homepage/dashboard
        router.push('/')
      },
      onError: (error: any) => {
        console.error(error)
        const errorMsg =
          error?.response?.data?.message || 'Có lỗi xảy ra khi đổi mật khẩu.'
        toast.error(errorMsg)
      },
    })
  }

  const handleLogout = () => {
    logout()
    router.push('/login')
  }

  return (
    <div className="min-h-[calc(100vh-180px)] flex items-center justify-center px-4 py-12 font-sans">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <Card className="bg-white border border-slate-200/60 shadow-xl rounded-3xl overflow-hidden py-0 gap-0">
          <div className="h-1.5 bg-linear-to-r from-emerald-500 via-teal-600 to-emerald-700"></div>

          <CardContent className="p-8">
            <div className="text-center space-y-2">
              <h1 className="text-2xl font-black tracking-tight text-slate-900 flex items-center justify-center gap-2">
                <Lock className="h-6 w-6 text-emerald-600" />
                <span>Đổi mật khẩu mới</span>
              </h1>
              <p className="text-xs text-slate-500 font-bold leading-relaxed px-2">
                Tài khoản của bạn được cấp mật khẩu tạm thời. Vui lòng đặt mật khẩu mới của riêng
                bạn để tiếp tục sử dụng hệ thống.
              </p>
            </div>

            <form className="mt-6 space-y-4" onSubmit={handleSubmit(onSubmit)}>
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-slate-700">Mật khẩu hiện tại (tạm thời)</Label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 pointer-events-none">
                    <Lock className="h-4 w-4" />
                  </span>
                  <Input
                    {...register('currentPassword')}
                    type={showCurrentPassword ? 'text' : 'password'}
                    placeholder="Nhập mật khẩu tạm thời"
                    className="pl-10 text-xs font-semibold"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute right-0 top-0 h-full px-3 text-slate-400 hover:text-slate-650 hover:bg-transparent cursor-pointer"
                  >
                    {showCurrentPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                {errors.currentPassword && (
                  <p className="text-[10px] font-bold text-rose-500 mt-1">
                    {errors.currentPassword.message}
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-slate-700">Mật khẩu mới</Label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 pointer-events-none">
                    <Lock className="h-4 w-4" />
                  </span>
                  <Input
                    {...register('newPassword')}
                    type={showNewPassword ? 'text' : 'password'}
                    placeholder="Nhập mật khẩu mới"
                    className="pl-10 text-xs font-semibold"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-0 top-0 h-full px-3 text-slate-400 hover:text-slate-650 hover:bg-transparent cursor-pointer"
                  >
                    {showNewPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                {errors.newPassword && (
                  <p className="text-[10px] font-bold text-rose-500 mt-1">
                    {errors.newPassword.message}
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-slate-700">Xác nhận mật khẩu mới</Label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 pointer-events-none">
                    <Lock className="h-4 w-4" />
                  </span>
                  <Input
                    {...register('confirmPassword')}
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="Nhập lại mật khẩu mới"
                    className="pl-10 text-xs font-semibold"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-0 top-0 h-full px-3 text-slate-400 hover:text-slate-650 hover:bg-transparent cursor-pointer"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                {errors.confirmPassword && (
                  <p className="text-[10px] font-bold text-rose-500 mt-1">
                    {errors.confirmPassword.message}
                  </p>
                )}
              </div>

              <div className="pt-2">
                <Button
                  type="submit"
                  disabled={forceChangePasswordMutation.isPending}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs py-2.5 rounded-xl cursor-pointer transition-colors shadow-sm disabled:opacity-50 flex items-center justify-center gap-1.5"
                >
                  {forceChangePasswordMutation.isPending ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      <span>Đang đổi mật khẩu...</span>
                    </>
                  ) : (
                    <span>Xác nhận đổi mật khẩu</span>
                  )}
                </Button>
              </div>

              <div className="flex justify-center border-t border-slate-100 pt-4 mt-2">
                <button
                  type="button"
                  onClick={handleLogout}
                  className="inline-flex items-center gap-1.5 text-slate-400 hover:text-rose-600 transition-colors text-xs font-bold cursor-pointer"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Đăng xuất tài khoản</span>
                </button>
              </div>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
