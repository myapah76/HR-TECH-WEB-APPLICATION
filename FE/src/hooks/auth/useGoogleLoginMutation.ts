import { useMutation } from '@tanstack/react-query'
import { loginWithGoogle } from '@/src/services/auth.service'
import { useAuthStore } from '@/src/stores/auth.store'

export const useGoogleLoginMutation = () => {
  const setAuth = useAuthStore((state) => state.setAuth)
  return useMutation({
    mutationFn: loginWithGoogle,
    onSuccess: (response) => {
      // If no password setup is needed, we log them in directly
      if (!response.data.needsPasswordSetup && response.data.userResponse && response.data.accessToken) {
        setAuth({
          user: response.data.userResponse,
          accessToken: response.data.accessToken,
          refreshToken: response.data.refreshToken,
        })
      }
    },
  })
}
