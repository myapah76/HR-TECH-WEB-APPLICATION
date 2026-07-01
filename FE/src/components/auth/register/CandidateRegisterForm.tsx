'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Mail, Lock, Eye, EyeOff, User } from 'lucide-react'
import { Button } from '@/src/components/ui/button'
import { Input } from '@/src/components/ui/input'
import { Checkbox } from '@/src/components/ui/checkbox'
import { Label } from '@/src/components/ui/label'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { registerSchema, RegisterFormData } from '@/src/schemas/auth.schema'
import { useRegister } from '@/src/hooks/auth'
import { OtpType } from '@/src/enums/otp.enum'
import { toast } from 'sonner'

export function CandidateRegisterForm() {
  const router = useRouter()
  const registerMutation = useRegister()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  })

  const onSubmit = async (data: RegisterFormData) => {
    registerMutation.mutate(
      {
        firstName: data.firstName,
        lastName: data.lastName,
        username: data.username,
        email: data.email,
        password: data.password,
        gender: Number(data.gender),
      },
      {
        onSuccess: (response) => {
          toast.success('Đã gửi mã xác nhận. Vui lòng kiểm tra email!')
          router.push(
            `/confirm-otp?email=${response?.email}&expireIn=${response?.expireIn}&otpType=${OtpType.REGISTER}`
          )
        },
      }
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="mt-5 space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <Label className="text-[11px] font-bold text-slate-500">* Tên</Label>
          <Input
            {...register('lastName')}
            type="text"
            placeholder="Nam"
            className="h-auto px-3 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none 
            focus:bg-white focus:border-blue-500 transition-all"
          />
          {errors.lastName && (
            <p className="text-xs font-bold text-red-500 mt-1.5">
              {errors.lastName.message}
            </p>
          )}
        </div>
        <div className="space-y-1">
          <Label className="text-[11px] font-bold text-slate-500">* Họ</Label>
          <Input
            {...register('firstName')}
            type="text"
            placeholder="Nguyen Hoang"
            className="h-auto px-3 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none 
            focus:bg-white focus:border-blue-500 transition-all"
          />
          {errors.firstName && (
            <p className="text-xs font-bold text-red-500 mt-1.5">
              {errors.firstName.message}
            </p>
          )}
        </div>
      </div>

      <div className="space-y-1">
        <Label className="text-[11px] font-bold text-slate-500">* Username</Label>
        <div className="relative">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
            <User className="h-4 w-4" />
          </span>
          <Input
            {...register('username')}
            type="text"
            placeholder="username"
            className="h-auto pl-9 pr-3 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none 
            focus:bg-white focus:border-blue-500 transition-all"
          />
          {errors.username && (
            <p className="text-xs font-bold text-red-500 mt-1.5">
              {errors.username.message}
            </p>
          )}
        </div>
      </div>

      <div className="space-y-1">
        <Label className="text-[11px] font-bold text-slate-500">* Email</Label>
        <div className="relative">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
            <Mail className="h-4 w-4" />
          </span>
          <Input
            {...register('email')}
            type="email"
            placeholder="yourname@email.com"
            className="h-auto pl-9 pr-3 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none 
            focus:bg-white focus:border-blue-500 transition-all"
          />
          {errors.email && (
            <p className="text-xs font-bold text-red-500 mt-1.5">
              {errors.email.message}
            </p>
          )}
        </div>
      </div>

      <div className="space-y-1">
        <Label className="text-[11px] font-bold text-slate-500">* Giới tính</Label>
        <select
          {...register('gender')}
          className="w-full h-auto px-3 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:bg-white focus:border-blue-500 transition-all"
        >
          <option value="0">Nam</option>
          <option value="1">Nữ</option>
        </select>
        {errors.gender && (
          <p className="text-xs font-bold text-red-500 mt-1.5">
            {errors.gender.message}
          </p>
        )}
      </div>

      <div className="space-y-1">
        <Label className="text-[11px] font-bold text-slate-500">* Mật khẩu</Label>
        <div className="relative">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
            <Lock className="h-4 w-4" />
          </span>
          <Input
            {...register('password')}
            type={showPassword ? 'text' : 'password'}
            placeholder="••••••••"
            className="h-auto pl-9 pr-10 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none 
            focus:bg-white focus:border-blue-500 transition-all"
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
          <p className="text-xs font-bold text-red-500 mt-1.5">
            {errors.password.message}
          </p>
        )}
      </div>

      <div className="space-y-1">
        <Label className="text-[11px] font-bold text-slate-500">* Xác nhận mật khẩu</Label>
        <div className="relative">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
            <Lock className="h-4 w-4" />
          </span>
          <Input
            {...register('confirmPassword')}
            type={showConfirmPassword ? 'text' : 'password'}
            placeholder="••••••••"
            className="h-auto pl-9 pr-10 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none 
            focus:bg-white focus:border-blue-500 transition-all"
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
          <p className="text-xs font-bold text-red-500 mt-1.5">
            {errors.confirmPassword.message}
          </p>
        )}
      </div>

      <div className="space-y-1">
        <Controller
          control={control}
          name="acceptTerms"
          defaultValue={false}
          render={({ field }) => (
            <Label className="flex items-start gap-2.5 cursor-pointer select-none text-[11px] font-medium leading-relaxed text-slate-550">
              <Checkbox
                checked={field.value}
                onCheckedChange={field.onChange}
                className="mt-1 shrink-0"
              />
              <span>
                Tôi đồng ý với Điều khoản Sử dụng và Chính sách Bảo mật của HR-Tech.
              </span>
            </Label>
          )}
        />
        {errors.acceptTerms && (
          <p className="text-xs font-bold text-red-500 mt-1.5">
            {errors.acceptTerms.message}
          </p>
        )}
      </div>

      <Button
        type="submit"
        disabled={registerMutation.isPending}
        className="w-full mt-2 bg-blue-600 hover:bg-blue-700 text-white font-black text-xs sm:text-sm py-4 rounded-xl transition-all duration-300 
        shadow-lg shadow-blue-600/20 hover:shadow-xl flex items-center justify-center gap-2 cursor-pointer tracking-wider uppercase h-auto"
      >
        {registerMutation.isPending ? 'ĐANG ĐĂNG KÝ...' : 'ĐĂNG KÝ MIỄN PHÍ'}
      </Button>
    </form>
  )
}
