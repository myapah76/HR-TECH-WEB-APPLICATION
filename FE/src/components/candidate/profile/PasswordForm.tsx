import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { passwordSchema, PasswordFormData } from '@/src/schemas/user.schema'
import { useChangeUserPassword } from '@/src/hooks/user'
import { useAuthStore } from '@/src/stores/auth.store'
import { logout } from '@/src/services/auth.service'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/src/components/ui/card'
import { Label } from '@/src/components/ui/label'
import { Input } from '@/src/components/ui/input'
import { Button } from '@/src/components/ui/button'
import { KeyRound, Lock, Eye, EyeOff, Loader2 } from 'lucide-react'
import { User } from '@/src/types/user'

interface PasswordFormProps {
  user: User
}

export function PasswordForm({ user }: PasswordFormProps) {
  const router = useRouter()
  const { logout: clearAuth } = useAuthStore()
  const changePasswordMutation = useChangeUserPassword()

  const [showOldPassword, setShowOldPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const {
    register: registerPassword,
    handleSubmit: handlePasswordSubmit,
    formState: { errors: passwordErrors },
  } = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
  })

  const onPasswordSubmit = (data: PasswordFormData) => {
    changePasswordMutation.mutate(
      {
        id: user.id,
        oldPassword: data.oldPassword,
        newPassword: data.newPassword,
      },
      {
        onSuccess: async () => {
          toast.success('Đổi mật khẩu thành công!')
          await logout()
          clearAuth()
          router.push('/login')
        },
      }
    )
  }

  return (
    <Card className="border-slate-200/60 shadow-lg bg-white">
      <CardHeader className="bg-slate-50/50 border-b border-slate-100/50">
        <CardTitle className="text-blue-900 text-lg flex items-center gap-2">
          <KeyRound className="w-5 h-5" /> Đổi mật khẩu
        </CardTitle>
        <CardDescription>Cập nhật mật khẩu mới bảo vệ tài khoản.</CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        <form onSubmit={handlePasswordSubmit(onPasswordSubmit)} className="space-y-4">
          <div className="space-y-1.5">
            <Label className="text-xs font-bold text-slate-700">* Mật khẩu hiện tại</Label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 pointer-events-none">
                <Lock className="w-4 h-4" />
              </span>
              <Input
                {...registerPassword('oldPassword')}
                type={showOldPassword ? 'text' : 'password'}
                placeholder="••••••••"
                className="pl-10 pr-10 border-slate-200 focus-visible:ring-blue-500 h-11"
              />
              <Button
                type="button"
                variant="ghost"
                onClick={() => setShowOldPassword(!showOldPassword)}
                className="absolute right-0 top-0 h-full px-3 text-slate-400 hover:text-slate-650 hover:bg-transparent cursor-pointer"
              >
                {showOldPassword ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
              </Button>
            </div>
            {passwordErrors.oldPassword && (
              <p className="text-xs font-bold text-red-500 mt-1">
                {passwordErrors.oldPassword.message}
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-bold text-slate-700">* Mật khẩu mới</Label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 pointer-events-none">
                <Lock className="w-4 h-4" />
              </span>
              <Input
                {...registerPassword('newPassword')}
                type={showNewPassword ? 'text' : 'password'}
                placeholder="••••••••"
                className="pl-10 pr-10 border-slate-200 focus-visible:ring-blue-500 h-11"
              />
              <Button
                type="button"
                variant="ghost"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-0 top-0 h-full px-3 text-slate-400 hover:text-slate-650 hover:bg-transparent cursor-pointer"
              >
                {showNewPassword ? (
                  <Eye className="h-4 w-4" />
                ) : (
                  <EyeOff className="h-4 w-4" />
                )}
              </Button>
            </div>
            {passwordErrors.newPassword && (
              <p className="text-xs font-bold text-red-500 mt-1">
                {passwordErrors.newPassword.message}
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-bold text-slate-700">
              * Xác nhận mật khẩu mới
            </Label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 pointer-events-none">
                <Lock className="w-4 h-4" />
              </span>
              <Input
                {...registerPassword('confirmPassword')}
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="••••••••"
                className="pl-10 pr-10 border-slate-200 focus-visible:ring-blue-500 h-11"
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
            {passwordErrors.confirmPassword && (
              <p className="text-xs font-bold text-red-500 mt-1">
                {passwordErrors.confirmPassword.message}
              </p>
            )}
          </div>

          <Button
            type="submit"
            disabled={changePasswordMutation.isPending}
            className="w-full mt-6 bg-blue-600 hover:bg-blue-700 text-white font-black py-4 rounded-xl shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2 uppercase tracking-wide h-auto"
          >
            {changePasswordMutation.isPending ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Đang đổi mật khẩu...
              </>
            ) : (
              'Cập nhật mật khẩu'
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
