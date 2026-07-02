import { useMutation } from '@tanstack/react-query'
import { forceChangePassword } from '@/src/services/auth.service'

export const useForceChangePassword = () => {
  return useMutation({
    mutationFn: forceChangePassword,
  })
}
