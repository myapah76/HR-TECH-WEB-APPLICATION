import { useMutation } from '@tanstack/react-query'
import { resetPassword } from '@/src/services/auth.service'

export const useResetPassword = () => {
  return useMutation({
    mutationFn: resetPassword,
  })
}
