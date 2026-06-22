import { useMutation } from '@tanstack/react-query'
import { confirmForgotPasswordOtp } from '@/src/services/auth.service'

export const useConfirmForgotPasswordOtp = () => {
  return useMutation({
    mutationFn: confirmForgotPasswordOtp,
  })
}
