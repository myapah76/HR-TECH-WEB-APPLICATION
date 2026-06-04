'use client'
import { useState } from 'react'
import Link from 'next/link'
import { Mail, Lock, Eye, EyeOff, Globe, Code } from 'lucide-react'
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
import { useLogin } from '@/src/hooks/useLogin'

export default function LoginPage() {
  const loginMutation = useLogin()
  const router = useRouter()

  const [showPassword, setShowPassword] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (data: LoginFormData) => {
    loginMutation.mutate(data, {
      onSuccess: () => {
        router.push('/dashboard')
      },
      onError: (error) => {
        console.error('Login failed:', error)
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

            <div className="grid grid-cols-2 gap-3.5">
              <Button
                type="button"
                variant="outline"
                className="flex items-center justify-center gap-2 text-[11px] 
              font-bold text-slate-700"
              >
                <Globe className="h-4 w-4 text-blue-500" />
                <span>Google</span>
              </Button>
              <Button
                type="button"
                variant="outline"
                className="flex items-center justify-center gap-2 text-[11px] 
              font-bold text-slate-700"
              >
                <Code className="h-4 w-4 text-slate-900" />
                <span>GitHub</span>
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
