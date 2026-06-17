'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  User,
  Building,
  Phone,
  Globe,
  MapPin,
  Briefcase,
  FileText,
} from 'lucide-react'
import { motion } from 'motion/react'
import { Button } from '@/src/components/ui/button'
import { Input } from '@/src/components/ui/input'
import { Checkbox } from '@/src/components/ui/checkbox'
import { Card, CardContent } from '@/src/components/ui/card'
import { Label } from '@/src/components/ui/label'
import { Controller } from 'react-hook-form'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  registerSchema,
  RegisterFormData,
  companyRegisterSchema,
  CompanyRegisterFormData,
} from '@/src/schemas/auth.schema'
import { useRegister, useRegisterCompany } from '@/src/hooks/auth/auth.hooks'
import { OtpType } from '@/src/enums/otp.enum'
import { getErrorMessage } from '@/src/utils/get-error-message'

import { toast } from 'sonner'

export default function RegisterPage() {
  const [activeTab, setActiveTab] = useState<'candidate' | 'company'>('candidate')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const router = useRouter()

  const registerMutation = useRegister()
  const registerCompanyMutation = useRegisterCompany()

  // Form for candidate
  const {
    register: registerCandidate,
    control: controlCandidate,
    handleSubmit: handleSubmitCandidate,
    formState: { errors: errorsCandidate },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  })

  // Form for company
  const {
    register: registerCompany,
    control: controlCompany,
    handleSubmit: handleSubmitCompany,
    formState: { errors: errorsCompany },
  } = useForm<CompanyRegisterFormData>({
    resolver: zodResolver(companyRegisterSchema),
  })

  const onSubmitCandidate = async (data: RegisterFormData) => {
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
            `/confirm-otp?email=${response?.data?.email}&expireIn=${response?.data?.expireIn}&otpType=${OtpType.REGISTER}`
          )
        },
        onError: (error) => {
          toast.error(getErrorMessage(error))
        },
      }
    )
  }

  const onSubmitCompany = async (data: CompanyRegisterFormData) => {
    registerCompanyMutation.mutate(
      {
        email: data.email,
        password: data.password,
        fullName: data.fullName,
        phone: data.phone,
        name: data.name,
        description: data.description,
        website: data.website,
        industry: data.industry,
        size: data.size,
        address: data.address,
        taxCode: data.taxCode,
      },
      {
        onSuccess: (response) => {
          toast.success('Đã gửi mã xác nhận. Vui lòng kiểm tra email!')
          router.push(
            `/confirm-otp?email=${response?.data?.email}&expireIn=${response?.data?.expireIn}&otpType=${OtpType.REGISTER_COMPANY}`
          )
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
          <div className="h-1.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600"></div>
          <CardContent className="p-8">
            <div className="text-center space-y-2">
              <h1 className="text-2xl font-black tracking-tight text-slate-900">
                Đăng ký tài khoản
              </h1>
              <p className="text-xs text-slate-500 font-medium">
                Trải nghiệm tìm kiếm việc làm thông minh bằng A.I
              </p>
            </div>

            {/* Tab Selector */}
            <div className="flex p-1 bg-slate-100/80 rounded-xl mt-5">
              <button
                type="button"
                onClick={() => setActiveTab('candidate')}
                className={`flex-1 text-center py-2.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  activeTab === 'candidate'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Ứng viên
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('company')}
                className={`flex-1 text-center py-2.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  activeTab === 'company'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Doanh nghiệp
              </button>
            </div>

            {activeTab === 'candidate' ? (
              <form onSubmit={handleSubmitCandidate(onSubmitCandidate)} className="mt-5 space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label className="text-[11px] font-bold text-slate-500">* Tên</Label>
                    <Input
                      {...registerCandidate('lastName')}
                      type="text"
                      placeholder="Nam"
                      className="h-auto px-3 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none 
                      focus:bg-white focus:border-blue-500 transition-all"
                    />
                    {errorsCandidate.lastName && (
                      <p className="text-xs font-bold text-red-500 mt-1.5">
                        {errorsCandidate.lastName.message}
                      </p>
                    )}
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[11px] font-bold text-slate-500">* Họ</Label>
                    <Input
                      {...registerCandidate('firstName')}
                      type="text"
                      placeholder="Nguyen Hoang"
                      className="h-auto px-3 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none 
                      focus:bg-white focus:border-blue-500 transition-all"
                    />
                    {errorsCandidate.firstName && (
                      <p className="text-xs font-bold text-red-500 mt-1.5">
                        {errorsCandidate.firstName.message}
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
                      {...registerCandidate('username')}
                      type="text"
                      placeholder="username"
                      className="h-auto pl-9 pr-3 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none 
                      focus:bg-white focus:border-blue-500 transition-all"
                    />
                    {errorsCandidate.username && (
                      <p className="text-xs font-bold text-red-500 mt-1.5">
                        {errorsCandidate.username.message}
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
                      {...registerCandidate('email')}
                      type="email"
                      placeholder="yourname@email.com"
                      className="h-auto pl-9 pr-3 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none 
                      focus:bg-white focus:border-blue-500 transition-all"
                    />
                    {errorsCandidate.email && (
                      <p className="text-xs font-bold text-red-500 mt-1.5">
                        {errorsCandidate.email.message}
                      </p>
                    )}
                  </div>
                </div>

                <div className="space-y-1">
                  <Label className="text-[11px] font-bold text-slate-500">* Giới tính</Label>

                  <select
                    {...registerCandidate('gender')}
                    className="w-full h-auto px-3 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:bg-white focus:border-blue-500 transition-all"
                  >
                    <option value="0">Nam</option>
                    <option value="1">Nữ</option>
                  </select>

                  {errorsCandidate.gender && (
                    <p className="text-xs font-bold text-red-500 mt-1.5">
                      {errorsCandidate.gender.message}
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
                      {...registerCandidate('password')}
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
                  {errorsCandidate.password && (
                    <p className="text-xs font-bold text-red-500 mt-1.5">
                      {errorsCandidate.password.message}
                    </p>
                  )}
                </div>

                <div className="space-y-1">
                  <Label className="text-[11px] font-bold text-slate-500">
                    * Xác nhận mật khẩu
                  </Label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                      <Lock className="h-4 w-4" />
                    </span>
                    <Input
                      {...registerCandidate('confirmPassword')}
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
                      {showConfirmPassword ? (
                        <Eye className="h-4 w-4" />
                      ) : (
                        <EyeOff className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  {errorsCandidate.confirmPassword && (
                    <p className="text-xs font-bold text-red-500 mt-1.5">
                      {errorsCandidate.confirmPassword.message}
                    </p>
                  )}
                </div>

                <div className="space-y-1">
                  <Controller
                    control={controlCandidate}
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
                  {errorsCandidate.acceptTerms && (
                    <p className="text-xs font-bold text-red-500 mt-1.5">
                      {errorsCandidate.acceptTerms.message}
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
            ) : (
              <form onSubmit={handleSubmitCompany(onSubmitCompany)} className="mt-5 space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label className="text-[11px] font-bold text-slate-500">
                      * Họ tên người đại diện
                    </Label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                        <User className="h-4 w-4" />
                      </span>
                      <Input
                        {...registerCompany('fullName')}
                        type="text"
                        placeholder="Nguyen Hoang"
                        className="h-auto pl-9 pr-3 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none 
                        focus:bg-white focus:border-blue-500 transition-all"
                      />
                    </div>
                    {errorsCompany.fullName && (
                      <p className="text-xs font-bold text-red-500 mt-1.5">
                        {errorsCompany.fullName.message}
                      </p>
                    )}
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[11px] font-bold text-slate-500">Số điện thoại</Label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                        <Phone className="h-4 w-4" />
                      </span>
                      <Input
                        {...registerCompany('phone')}
                        type="text"
                        placeholder="0987654321"
                        className="h-auto pl-9 pr-3 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none 
                        focus:bg-white focus:border-blue-500 transition-all"
                      />
                    </div>
                    {errorsCompany.phone && (
                      <p className="text-xs font-bold text-red-500 mt-1.5">
                        {errorsCompany.phone.message}
                      </p>
                    )}
                  </div>
                </div>

                <div className="space-y-1">
                  <Label className="text-[11px] font-bold text-slate-500">* Email công ty</Label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                      <Mail className="h-4 w-4" />
                    </span>
                    <Input
                      {...registerCompany('email')}
                      type="email"
                      placeholder="company@email.com"
                      className="h-auto pl-9 pr-3 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none 
                      focus:bg-white focus:border-blue-500 transition-all"
                    />
                  </div>
                  {errorsCompany.email && (
                    <p className="text-xs font-bold text-red-500 mt-1.5">
                      {errorsCompany.email.message}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label className="text-[11px] font-bold text-slate-500">* Tên công ty</Label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                        <Building className="h-4 w-4" />
                      </span>
                      <Input
                        {...registerCompany('name')}
                        type="text"
                        placeholder="HR Tech JSC"
                        className="h-auto pl-9 pr-3 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none 
                        focus:bg-white focus:border-blue-500 transition-all"
                      />
                    </div>
                    {errorsCompany.name && (
                      <p className="text-xs font-bold text-red-500 mt-1.5">
                        {errorsCompany.name.message}
                      </p>
                    )}
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[11px] font-bold text-slate-500">* Mã số thuế</Label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                        <FileText className="h-4 w-4" />
                      </span>
                      <Input
                        {...registerCompany('taxCode')}
                        type="text"
                        placeholder="0101234567"
                        className="h-auto pl-9 pr-3 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none 
                        focus:bg-white focus:border-blue-500 transition-all"
                      />
                    </div>
                    {errorsCompany.taxCode && (
                      <p className="text-xs font-bold text-red-500 mt-1.5">
                        {errorsCompany.taxCode.message}
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label className="text-[11px] font-bold text-slate-500">Ngành nghề</Label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                        <Briefcase className="h-4 w-4" />
                      </span>
                      <Input
                        {...registerCompany('industry')}
                        type="text"
                        placeholder="Công nghệ thông tin"
                        className="h-auto pl-9 pr-3 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none 
                        focus:bg-white focus:border-blue-500 transition-all"
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[11px] font-bold text-slate-500">Quy mô nhân sự</Label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                        <User className="h-4 w-4" />
                      </span>
                      <Input
                        {...registerCompany('size')}
                        type="text"
                        placeholder="100-500 nhân viên"
                        className="h-auto pl-9 pr-3 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none 
                        focus:bg-white focus:border-blue-500 transition-all"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label className="text-[11px] font-bold text-slate-500">Website</Label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                        <Globe className="h-4 w-4" />
                      </span>
                      <Input
                        {...registerCompany('website')}
                        type="text"
                        placeholder="https://hr-tech.vn"
                        className="h-auto pl-9 pr-3 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none 
                        focus:bg-white focus:border-blue-500 transition-all"
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[11px] font-bold text-slate-500">Địa chỉ</Label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                        <MapPin className="h-4 w-4" />
                      </span>
                      <Input
                        {...registerCompany('address')}
                        type="text"
                        placeholder="Hà Nội, Việt Nam"
                        className="h-auto pl-9 pr-3 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none 
                        focus:bg-white focus:border-blue-500 transition-all"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-1">
                  <Label className="text-[11px] font-bold text-slate-500">Mô tả ngắn</Label>
                  <Input
                    {...registerCompany('description')}
                    type="text"
                    placeholder="Giới thiệu ngắn gọn về công ty..."
                    className="h-auto px-3 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none 
                    focus:bg-white focus:border-blue-500 transition-all"
                  />
                </div>

                <div className="space-y-1">
                  <Label className="text-[11px] font-bold text-slate-500">* Mật khẩu</Label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                      <Lock className="h-4 w-4" />
                    </span>
                    <Input
                      {...registerCompany('password')}
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
                  {errorsCompany.password && (
                    <p className="text-xs font-bold text-red-500 mt-1.5">
                      {errorsCompany.password.message}
                    </p>
                  )}
                </div>

                <div className="space-y-1">
                  <Label className="text-[11px] font-bold text-slate-500">
                    * Xác nhận mật khẩu
                  </Label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                      <Lock className="h-4 w-4" />
                    </span>
                    <Input
                      {...registerCompany('confirmPassword')}
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
                      {showConfirmPassword ? (
                        <Eye className="h-4 w-4" />
                      ) : (
                        <EyeOff className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  {errorsCompany.confirmPassword && (
                    <p className="text-xs font-bold text-red-500 mt-1.5">
                      {errorsCompany.confirmPassword.message}
                    </p>
                  )}
                </div>

                <div className="space-y-1">
                  <Controller
                    control={controlCompany}
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
                  {errorsCompany.acceptTerms && (
                    <p className="text-xs font-bold text-red-500 mt-1.5">
                      {errorsCompany.acceptTerms.message}
                    </p>
                  )}
                </div>

                <Button
                  type="submit"
                  disabled={registerCompanyMutation.isPending}
                  className="w-full mt-2 bg-blue-600 hover:bg-blue-700 text-white font-black text-xs sm:text-sm py-4 rounded-xl transition-all duration-300 
                  shadow-lg shadow-blue-600/20 hover:shadow-xl flex items-center justify-center gap-2 cursor-pointer tracking-wider uppercase h-auto"
                >
                  {registerCompanyMutation.isPending ? 'ĐANG ĐĂNG KÝ...' : 'ĐĂNG KÝ MIỄN PHÍ'}
                </Button>
              </form>
            )}

            <p className="text-center text-[10px] text-slate-400 font-bold mt-7">
              Đã có tài khoản?{' '}
              <Link
                href="/login"
                className="text-blue-600 hover:text-blue-800 hover:underline font-extrabold"
              >
                Đăng nhập ngay
              </Link>
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
