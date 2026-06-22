import { useMutation } from '@tanstack/react-query'
import { confirmRegisterOtp } from '@/src/services/auth.service'

export const useConfirmRegisterOtp = () => {
  return useMutation({
    mutationFn: confirmRegisterOtp,
  })
}
