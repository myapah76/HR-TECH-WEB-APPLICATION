'use client'

import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion } from 'motion/react'
import { Lock, Eye, EyeOff } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'

import { Button } from '@/src/components/ui/button'
import { Input } from '@/src/components/ui/input'
import { Card, CardContent } from '@/src/components/ui/card'
import { Label } from '@/src/components/ui/label'
import { useSetupGooglePassword } from '@/src/hooks/auth/auth.hooks'

const setupPasswordSchema = z.object({
  password: z.string().min(6, 'Mật khẩu phải có ít nhất 6 ký tự'),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Mật khẩu xác nhận không khớp",
  path: ["confirmPassword"]
})

type SetupPasswordFormData = z.infer<typeof setupPasswordSchema>

function SetupPasswordForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get('token')
  const setupPasswordMutation = useSetupGooglePassword()

  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SetupPasswordFormData>({
    resolver: zodResolver(setupPasswordSchema),
  })

  const onSubmit = (data: SetupPasswordFormData) => {
    if (!token) {
      toast.error('Token không hợp lệ')
      return
    }

    setupPasswordMutation.mutate(
      { setupToken: token, newPassword: data.password },
      {
        onSuccess: () => {
          toast.success('Thiết lập mật khẩu thành công')
          router.push('/')
        },
        onError: () => {
          toast.error('Có lỗi xảy ra, vui lòng thử lại sau')
        }
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
            <div className="text-center space-y-2">
              <h1 className="text-2xl font-black tracking-tight text-slate-900">
                Tạo mật khẩu
              </h1>
              <p className="text-xs text-slate-500 font-medium">
                Vui lòng tạo một mật khẩu cho tài khoản Google của bạn
              </p>
            </div>

            <form className="mt-5 space-y-4" onSubmit={handleSubmit(onSubmit)}>
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
                    {showConfirmPassword ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                  </Button>
                </div>
                {errors.confirmPassword && (
                  <p className="text-xs font-bold text-red-500 mt-1.5">{errors.confirmPassword.message}</p>
                )}
              </div>

              <Button
                type="submit"
                disabled={setupPasswordMutation.isPending}
                className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white font-black text-xs sm:text-sm py-4 rounded-xl 
                transition-all duration-300 shadow-lg shadow-blue-600/20 flex items-center justify-center h-auto"
              >
                {setupPasswordMutation.isPending ? 'ĐANG XỬ LÝ...' : 'HOÀN TẤT'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}

export default function SetupPasswordPage() {
  return (
    <Suspense 
      fallback={
        <div className="min-h-[calc(100vh-180px)] flex items-center justify-center">
          <div className="flex flex-col items-center gap-2">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-sm font-medium text-slate-500">Đang tải dữ liệu...</p>
          </div>
        </div>
      }
    >
      <SetupPasswordForm />
    </Suspense>
  )
}
