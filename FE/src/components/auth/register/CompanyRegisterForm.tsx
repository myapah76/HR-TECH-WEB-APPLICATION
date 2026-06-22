'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
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
  Image as ImageIcon,
} from 'lucide-react'
import { Button } from '@/src/components/ui/button'
import { Input } from '@/src/components/ui/input'
import { Checkbox } from '@/src/components/ui/checkbox'
import { Label } from '@/src/components/ui/label'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { companyRegisterSchema, CompanyRegisterFormData } from '@/src/schemas/auth.schema'
import { useRegisterCompany } from '@/src/hooks/auth'
import { OtpType } from '@/src/enums/otp.enum'
import { toast } from 'sonner'
import { uploadFile } from '@/src/services/upload.service'

export function CompanyRegisterForm() {
  const router = useRouter()
  const registerCompanyMutation = useRegisterCompany()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<CompanyRegisterFormData>({
    resolver: zodResolver(companyRegisterSchema),
  })

  const onSubmit = async (data: CompanyRegisterFormData) => {
    if (!logoFile) {
      toast.error('Vui lòng chọn logo công ty!')
      return
    }

    try {
      setIsUploading(true)
      let logoUrl = undefined

      if (logoFile) {
        const uploadRes = await uploadFile(logoFile)
        if (uploadRes?.data) {
          logoUrl = uploadRes.data
        }
      }

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
          logoUrl: logoUrl,
        },
        {
          onSuccess: (response) => {
            toast.success('Đã gửi mã xác nhận. Vui lòng kiểm tra email!')
            router.push(
              `/confirm-otp?email=${response?.data?.email}&expireIn=${response?.data?.expireIn}&otpType=${OtpType.REGISTER_COMPANY}`
            )
          },
          onSettled: () => {
            setIsUploading(false)
          },
        }
      )
    } catch (error) {
      console.error(error)
      toast.error('Lỗi khi tải ảnh lên, vui lòng thử lại!')
      setIsUploading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="mt-5 space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <Label className="text-[11px] font-bold text-slate-500">* Họ tên người đại diện</Label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
              <User className="h-4 w-4" />
            </span>
            <Input
              {...register('fullName')}
              type="text"
              placeholder="Nguyen Hoang"
              className="h-auto pl-9 pr-3 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none 
              focus:bg-white focus:border-blue-500 transition-all"
            />
          </div>
          {errors.fullName && (
            <p className="text-xs font-bold text-red-500 mt-1.5">{errors.fullName.message}</p>
          )}
        </div>
        <div className="space-y-1">
          <Label className="text-[11px] font-bold text-slate-500">Số điện thoại</Label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
              <Phone className="h-4 w-4" />
            </span>
            <Input
              {...register('phone')}
              type="text"
              placeholder="0987654321"
              className="h-auto pl-9 pr-3 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none 
              focus:bg-white focus:border-blue-500 transition-all"
            />
          </div>
          {errors.phone && (
            <p className="text-xs font-bold text-red-500 mt-1.5">{errors.phone.message}</p>
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
            {...register('email')}
            type="email"
            placeholder="company@email.com"
            className="h-auto pl-9 pr-3 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none 
            focus:bg-white focus:border-blue-500 transition-all"
          />
        </div>
        {errors.email && (
          <p className="text-xs font-bold text-red-500 mt-1.5">{errors.email.message}</p>
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
              {...register('name')}
              type="text"
              placeholder="HR Tech JSC"
              className="h-auto pl-9 pr-3 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none 
              focus:bg-white focus:border-blue-500 transition-all"
            />
          </div>
          {errors.name && (
            <p className="text-xs font-bold text-red-500 mt-1.5">{errors.name.message}</p>
          )}
        </div>
        <div className="space-y-1">
          <Label className="text-[11px] font-bold text-slate-500">* Mã số thuế</Label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
              <FileText className="h-4 w-4" />
            </span>
            <Input
              {...register('taxCode')}
              type="text"
              placeholder="0101234567"
              className="h-auto pl-9 pr-3 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none 
              focus:bg-white focus:border-blue-500 transition-all"
            />
          </div>
          {errors.taxCode && (
            <p className="text-xs font-bold text-red-500 mt-1.5">{errors.taxCode.message}</p>
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
              {...register('industry')}
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
              {...register('size')}
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
              {...register('website')}
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
              {...register('address')}
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
          {...register('description')}
          type="text"
          placeholder="Giới thiệu ngắn gọn về công ty..."
          className="h-auto px-3 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none 
          focus:bg-white focus:border-blue-500 transition-all"
        />
      </div>

      <div className="space-y-1">
        <Label className="text-[11px] font-bold text-slate-500">Logo công ty</Label>
        <div className="relative">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
            <ImageIcon className="h-4 w-4" />
          </span>
          <Input
            type="file"
            accept="image/*"
            onChange={(e) => {
              if (e.target.files && e.target.files.length > 0) {
                setLogoFile(e.target.files[0])
              }
            }}
            className="h-auto pl-9 pr-3 py-2 bg-slate-50/50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none 
            focus:bg-white focus:border-blue-500 transition-all file:border-0 file:bg-blue-50 file:text-blue-700 file:text-xs file:font-semibold file:px-2 file:py-1 file:rounded-md file:mr-2 cursor-pointer"
          />
        </div>
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
          <p className="text-xs font-bold text-red-500 mt-1.5">{errors.password.message}</p>
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
          <p className="text-xs font-bold text-red-500 mt-1.5">{errors.confirmPassword.message}</p>
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
              <span>Tôi đồng ý với Điều khoản Sử dụng và Chính sách Bảo mật của HR-Tech.</span>
            </Label>
          )}
        />
        {errors.acceptTerms && (
          <p className="text-xs font-bold text-red-500 mt-1.5">{errors.acceptTerms.message}</p>
        )}
      </div>

      <Button
        type="submit"
        disabled={registerCompanyMutation.isPending || isUploading}
        className="w-full mt-2 bg-blue-600 hover:bg-blue-700 text-white font-black text-xs sm:text-sm py-4 rounded-xl transition-all duration-300 
        shadow-lg shadow-blue-600/20 hover:shadow-xl flex items-center justify-center gap-2 cursor-pointer tracking-wider uppercase h-auto"
      >
        {isUploading
          ? 'ĐANG TẢI ẢNH...'
          : registerCompanyMutation.isPending
            ? 'ĐANG ĐĂNG KÝ...'
            : 'ĐĂNG KÝ MIỄN PHÍ'}
      </Button>
    </form>
  )
}
