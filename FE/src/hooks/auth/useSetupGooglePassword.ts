import { useMutation } from '@tanstack/react-query'
import { setupGooglePassword } from '@/src/services/auth.service'
import { useAuthStore } from '@/src/stores/auth.store'

export const useSetupGooglePassword = () => {
  const setAuth = useAuthStore((state) => state.setAuth)
  return useMutation({
    mutationFn: setupGooglePassword,
    onSuccess: (response) => {
      setAuth({
        user: response.userResponse!,
        accessToken: response.accessToken!,
        refreshToken: response.refreshToken,
      })
    },
  })
}
