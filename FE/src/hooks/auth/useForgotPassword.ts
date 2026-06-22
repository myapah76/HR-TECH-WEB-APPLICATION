import { useMutation } from '@tanstack/react-query'
import { forgotPassword } from '@/src/services/auth.service'

export const useForgotPassword = () => {
  return useMutation({
    mutationFn: forgotPassword,
  })
}
