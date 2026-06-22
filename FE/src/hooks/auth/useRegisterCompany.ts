import { useMutation } from '@tanstack/react-query'
import { registerCompany } from '@/src/services/auth.service'

export const useRegisterCompany = () => {
  return useMutation({
    mutationFn: registerCompany,
  })
}
