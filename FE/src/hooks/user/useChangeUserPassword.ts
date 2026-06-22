import { useMutation } from '@tanstack/react-query'
import { changeUserPassword } from '@/src/services/user.service'

export const useChangeUserPassword = () => {
  return useMutation({
    mutationFn: changeUserPassword,
  })
}
