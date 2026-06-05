import { confirmRegisterOtp, confirmForgotPasswordOtp } from '@/src/services/auth.service'
import { useMutation } from '@tanstack/react-query'

export const useConfirmRegisterOtp = () => {
  return useMutation({
    mutationFn: confirmRegisterOtp,
  })
}

export const useConfirmForgotPasswordOtp = () => {
  return useMutation({
    mutationFn: confirmForgotPasswordOtp,
  })
}
