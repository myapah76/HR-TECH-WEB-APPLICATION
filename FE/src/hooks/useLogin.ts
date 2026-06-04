import { login } from '@/src/services/auth.service'
import { useMutation } from '@tanstack/react-query'
import { useAuthStore } from '@/src/stores/auth.store'

export const useLogin = () => {
  const setAuth = useAuthStore((state) => state.setAuth)
  return useMutation({
    mutationFn: login,
    onSuccess: (response) => {
      setAuth({
        user: response.userResponse,
        accessToken: response.accessToken,
      })
    },
  })
}
