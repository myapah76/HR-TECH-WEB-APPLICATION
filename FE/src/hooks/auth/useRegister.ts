import { useMutation } from '@tanstack/react-query'
import { registerUser } from '@/src/services/auth.service'

export const useRegister = () => {
  return useMutation({
    mutationFn: registerUser,
  })
}
