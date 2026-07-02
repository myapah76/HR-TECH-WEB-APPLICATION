'use client'
import { useState } from 'react'
import Link from 'next/link'
import { Mail, Lock, Eye, EyeOff, Code } from 'lucide-react'
import { motion } from 'motion/react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { loginSchema, LoginFormData } from '@/src/schemas/auth.schema'
import { Button } from '@/src/components/ui/button'
import { Input } from '@/src/components/ui/input'
import { Checkbox } from '@/src/components/ui/checkbox'
import { Card, CardContent } from '@/src/components/ui/card'
import { Label } from '@/src/components/ui/label'
import { useRouter } from 'next/navigation'
import { useLogin, useGoogleLoginMutation } from '@/src/hooks/auth'
import { useGoogleLogin } from '@react-oauth/google'

import { toast } from 'sonner'

export default function LoginPage() {
  const loginMutation = useLogin()
  const googleLoginMutation = useGoogleLoginMutation()
  const router = useRouter()

  const [showPassword, setShowPassword] = useState(false)

  const handleGoogleLogin = useGoogleLogin({
    onSuccess: (tokenResponse) => {
      googleLoginMutation.mutate(
        { token: tokenResponse.access_token },
        {
          onSuccess: (response) => {
            if (response.needsPasswordSetup) {
              // Redirect to setup password with token
              router.push(
                `/setup-password?token=${encodeURIComponent(response.setupToken || '')}`
              )
              toast.info('Vui lòng tạo mật khẩu cho tài khoản Google của bạn')
            } else {
              router.push('/')
              toast.success('Đăng nhập Google thành công')
            }
          },
        }
      )
    },
    onError: () => {
      toast.error('Google login failed')
    },
  })

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (data: LoginFormData) => {
    loginMutation.mutate(data, {
      onSuccess: (response) => {
        router.push('/')
        toast.success('Đăng nhập thành công')
        console.log(response)
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
            <div className="text-center space-y-2">
              <h1 className="text-2xl font-black tracking-tight text-slate-900">
                Chào mừng trở lại!
              </h1>
              <p className="text-xs text-slate-500 font-medium">
                Kết nối cơ hội, nâng cao sự nghiệp
              </p>
            </div>

            <form className="mt-5 space-y-4" onSubmit={handleSubmit(onSubmit)}>
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

              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <Label className="text-xs font-bold text-slate-700">Mật khẩu</Label>
                  <Link
                    href="/forgot-password"
                    className="text-[10px] font-bold text-blue-600 hover:text-blue-800 transition-colors"
                  >
                    Quên mật khẩu?
                  </Link>
                </div>
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

              <Label className="flex items-center gap-3 cursor-pointer select-none">
                <Checkbox className="h-4 w-4" />
                <span className="text-[11px] font-bold text-slate-500">Ghi nhớ tôi</span>
              </Label>

              <Button
                type="submit"
                disabled={loginMutation.isPending}
                className="w-full mt-2 bg-blue-600 hover:bg-blue-700 text-white font-black text-xs sm:text-sm py-4 rounded-xl 
                transition-all duration-300 shadow-lg shadow-blue-600/20 hover:shadow-xl hover:shadow-blue-600/30 hover:scale-[1.02] 
                hover:-translate-y-0.5 active:scale-98 flex items-center justify-center gap-2 cursor-pointer tracking-wider uppercase h-auto"
              >
                {loginMutation.isPending ? 'ĐANG ĐĂNG NHẬP...' : 'ĐĂNG NHẬP'}
              </Button>
            </form>

            {/* Divider */}
            <div className="relative flex items-center justify-center my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200"></div>
              </div>
              <span className="relative bg-white px-3 text-[10px] font-black text-slate-400 uppercase tracking-wider">
                Hoặc kết nối nhanh
              </span>
            </div>

            <div className="flex justify-center">
              <Button
                type="button"
                variant="outline"
                disabled={googleLoginMutation.isPending}
                onClick={() => handleGoogleLogin()}
                className="flex items-center justify-center gap-2 text-xs px-5 py-2
              font-bold border border-slate-200 text-slate-700 bg-white hover:bg-slate-50 cursor-pointer rounded-xl shadow-xs transition-colors duration-200"
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24" width="24" height="24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335" />
                </svg>
                <span>{googleLoginMutation.isPending ? 'Đang kết nối...' : 'Google'}</span>
              </Button>
            </div>

            <p className="text-center text-[10px] text-slate-400 font-bold mt-7">
              Chưa có tài khoản?{' '}
              <Link
                href="/register"
                className="text-blue-600 hover:text-blue-800 hover:underline font-extrabold"
              >
                Đăng ký miễn phí
              </Link>
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
