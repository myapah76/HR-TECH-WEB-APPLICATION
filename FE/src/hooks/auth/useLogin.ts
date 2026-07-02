import { useMutation } from '@tanstack/react-query'
import { login } from '@/src/services/auth.service'
import { useAuthStore } from '@/src/stores/auth.store'

export const useLogin = () => {
  const setAuth = useAuthStore((state) => state.setAuth)
  return useMutation({
    mutationFn: login,
    onSuccess: (response) => {
      // Only set auth if we got a real access token (not needsPasswordSetup flow)
      if (response.accessToken && response.userResponse) {
        setAuth({
          user: response.userResponse,
          accessToken: response.accessToken,
          refreshToken: response.refreshToken,
        })
      }
    },
  })
}
