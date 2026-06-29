import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { profileSchema, ProfileFormData } from '@/src/schemas/user.schema'
import { useUpdateUserProfile } from '@/src/hooks/user'
import { formatDateForInput } from '@/src/utils'
import { toast } from 'sonner'
import { User } from '@/src/types/user'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/src/components/ui/card'
import { Label } from '@/src/components/ui/label'
import { Input } from '@/src/components/ui/input'
import { Button } from '@/src/components/ui/button'
import { UserCheck, Mail, Phone, Calendar, MapPin, Loader2, ShieldAlert } from 'lucide-react'

interface ProfileFormProps {
  user: User
}

export function ProfileForm({ user }: ProfileFormProps) {
  const updateProfileMutation = useUpdateUserProfile()

  const {
    register: registerProfile,
    handleSubmit: handleProfileSubmit,
    formState: { errors: profileErrors },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    values: {
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      username: user?.username || '',
      phone: user?.phone || '',
      address: user?.address || '',
      gender: String(user?.gender ?? '0'),
      dateOfBirth: user?.dateOfBirth ? formatDateForInput(user.dateOfBirth) : '',
    },
  })

  const onProfileSubmit = (data: ProfileFormData) => {
    updateProfileMutation.mutate(
      {
        firstName: data.firstName,
        lastName: data.lastName,
        email: user.email, // Email acts as lookup key on backend
        username: data.username,
        phone: data.phone,
        address: data.address,
        gender: Number(data.gender),
        dateOfBirth: new Date(data.dateOfBirth).toISOString(),
      },
      {
        onSuccess: () => {
          toast.success('Cập nhật hồ sơ cá nhân thành công!')
        },
      }
    )
  }

  return (
    <Card className="border-slate-200/60 shadow-lg bg-white">
      <CardHeader className="bg-slate-50/50 border-b border-slate-100/50">
        <CardTitle className="text-blue-900 text-lg flex items-center gap-2">
          <UserCheck className="w-5 h-5" /> Thông tin cá nhân
        </CardTitle>
        <CardDescription>Cập nhật thông tin lý lịch cá nhân của bạn.</CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        <form onSubmit={handleProfileSubmit(onProfileSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-slate-700">* Tên</Label>
              <Input
                {...registerProfile('firstName')}
                placeholder="Ví dụ: Anh"
                className="border-slate-200 focus-visible:ring-blue-500 h-11"
              />
              {profileErrors.firstName && (
                <p className="text-xs font-bold text-red-500 mt-1">
                  {profileErrors.firstName.message}
                </p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-slate-700">Họ và tên đệm</Label>
              <Input
                {...registerProfile('lastName')}
                placeholder="Ví dụ: Nguyễn Văn"
                className="border-slate-200 focus-visible:ring-blue-500 h-11"
              />
              {profileErrors.lastName && (
                <p className="text-xs font-bold text-red-500 mt-1">
                  {profileErrors.lastName.message}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-slate-700">* Username</Label>
              <Input
                {...registerProfile('username')}
                placeholder="Ví dụ: nguyenvananh"
                className="border-slate-200 focus-visible:ring-blue-500 h-11"
              />
              {profileErrors.username && (
                <p className="text-xs font-bold text-red-500 mt-1">
                  {profileErrors.username.message}
                </p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-slate-400 flex items-center gap-1">
                Email <ShieldAlert className="w-3 h-3 text-slate-400" /> (Không thể thay đổi)
              </Label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 pointer-events-none">
                  <Mail className="w-4 h-4" />
                </span>
                <Input
                  value={user.email}
                  disabled
                  className="pl-10 border-slate-200 bg-slate-50 text-slate-400 cursor-not-allowed h-11"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-slate-700">Số điện thoại</Label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 pointer-events-none">
                  <Phone className="w-4 h-4" />
                </span>
                <Input
                  {...registerProfile('phone')}
                  placeholder="Ví dụ: 0987654321"
                  className="pl-10 border-slate-200 focus-visible:ring-blue-500 h-11"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-slate-700">* Ngày sinh</Label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 pointer-events-none">
                  <Calendar className="w-4 h-4" />
                </span>
                <Input
                  {...registerProfile('dateOfBirth')}
                  type="date"
                  className="pl-10 border-slate-200 focus-visible:ring-blue-500 h-11"
                />
              </div>
              {profileErrors.dateOfBirth && (
                <p className="text-xs font-bold text-red-500 mt-1">
                  {profileErrors.dateOfBirth.message}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-slate-700">* Giới tính</Label>
              <select
                {...registerProfile('gender')}
                className="flex h-11 w-full items-center justify-between rounded-md border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer shadow-sm"
              >
                <option value="0">Nam</option>
                <option value="1">Nữ</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-slate-700">Địa chỉ cư trú</Label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 pointer-events-none">
                  <MapPin className="w-4 h-4" />
                </span>
                <Input
                  {...registerProfile('address')}
                  placeholder="Ví dụ: Cầu Giấy, Hà Nội"
                  className="pl-10 border-slate-200 focus-visible:ring-blue-500 h-11"
                />
              </div>
            </div>
          </div>

          <Button
            type="submit"
            disabled={updateProfileMutation.isPending}
            className="w-full mt-6 bg-blue-600 hover:bg-blue-700 text-white font-black py-4 rounded-xl shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2 uppercase tracking-wide h-auto"
          >
            {updateProfileMutation.isPending ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Đang lưu thay đổi...
              </>
            ) : (
              'Lưu thông tin hồ sơ'
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
