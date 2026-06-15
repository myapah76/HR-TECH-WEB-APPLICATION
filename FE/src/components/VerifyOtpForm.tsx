'use client'

import { Button } from '@/src/components/ui/button'
import { OtpType } from '@/src/enums/otp.enum'
import { useConfirmForgotPasswordOtp, useConfirmRegisterOtp } from '@/src/hooks/useConfirmOtp'
import { getErrorMessage } from '@/src/utils/get-error-message'
import { CheckCircle2, Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'

import { toast } from 'sonner'

interface VerifyOtpFormProps {
  email: string
  expireIn: number
  otpType: OtpType
}

export function VerifyOtpForm({ email, expireIn, otpType }: VerifyOtpFormProps) {
  const router = useRouter()

  const confirmRegisterOtpMutation = useConfirmRegisterOtp()
  const confirmForgotPasswordOtpMutation = useConfirmForgotPasswordOtp()

  const [otp, setOtp] = useState<string[]>(Array(6).fill(''))
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  // focus the first input on mount
  useEffect(() => {
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus()
    }
  }, [])

  const handleChange = (index: number, value: string) => {
    // allow only numbers
    if (value && !/^\d+$/.test(value)) return

    const newOtp = [...otp]

    // Handle paste
    if (value.length > 1) {
      const pastedData = value.slice(0, 6).split('')
      for (let i = 0; i < pastedData.length; i++) {
        if (index + i < 6) {
          newOtp[index + i] = pastedData[i]
        }
      }
      setOtp(newOtp)

      // Focus the next empty input or the last one
      const nextIndex = Math.min(index + pastedData.length, 5)
      inputRefs.current[nextIndex]?.focus()
      return
    }

    // Handle single character
    newOtp[index] = value
    setOtp(newOtp)

    // Move to next input if value is entered
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      // Move to previous input on backspace if current is empty
      inputRefs.current[index - 1]?.focus()
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const otpValue = otp.join('')

    if (otpType === OtpType.REGISTER) {
      confirmRegisterOtpMutation.mutate(
        { email, otp: otpValue, type: otpType },
        {
          onSuccess: () => {
            toast.success('Xác thực OTP thành công! Bây giờ bạn có thể đăng nhập vào tài khoản.')
            router.push('/login')
          },
          onError: (error) => {
            toast.error(getErrorMessage(error))
          },
        }
      )
    } else {
      confirmForgotPasswordOtpMutation.mutate(
        { email, otp: otpValue, type: otpType },
        {
          onSuccess: (response) => {
            toast.success('Xác thực OTP thành công! Bây giờ bạn có thể reset mật khẩu.')
            console.log('res', response)
            router.push(
              `/reset-password?reset-token=${encodeURIComponent(response.data.resetToken)}`
            )
          },
          onError: (error) => {
            toast.error(getErrorMessage(error))
          },
        }
      )
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-8 space-y-6">
      <div>
        <div className="flex justify-between gap-2 mb-2">
          {otp.map((digit, index) => (
            <input
              key={index}
              ref={(el) => {
                inputRefs.current[index] = el
              }}
              type="text"
              inputMode="numeric"
              maxLength={6}
              value={digit}
              onChange={(e) => handleChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              className="w-12 h-14 sm:w-14 sm:h-16 text-center text-2xl font-black text-slate-800 bg-slate-50 border-2 border-slate-200 rounded-xl focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10 transition-all outline-none"
            />
          ))}
        </div>
      </div>

      <Button
        type="submit"
        disabled={
          (otpType === OtpType.REGISTER
            ? confirmRegisterOtpMutation.isPending
            : confirmForgotPasswordOtpMutation.isPending) || otp.join('').length < 6
        }
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-4 rounded-xl transition-all duration-300 shadow-lg shadow-blue-600/20 hover:shadow-xl flex items-center justify-center gap-2 uppercase h-auto"
      >
        {confirmRegisterOtpMutation.isPending || confirmForgotPasswordOtpMutation.isPending ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            ĐANG XÁC THỰC...
          </>
        ) : (
          <>
            <CheckCircle2 className="w-5 h-5" />
            XÁC THỰC TÀI KHOẢN
          </>
        )}
      </Button>

      <div className="text-center mt-6">
        <p className="text-sm text-slate-500 font-medium">
          Chưa nhận được mã?{' '}
          <button type="button" className="text-blue-600 font-bold hover:underline">
            Gửi lại OTP
          </button>
        </p>
      </div>
    </form>
  )
}
