import { registerUser } from '@/src/services/auth.service'
import { useMutation } from '@tanstack/react-query'

export const useRegister = () => {
  return useMutation({
    mutationFn: registerUser,
  })
}
