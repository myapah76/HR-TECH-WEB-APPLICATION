import { useMutation } from '@tanstack/react-query'
import { updateUserProfile } from '@/src/services/user.service'
import { useAuthStore } from '@/src/stores/auth.store'

export const useUpdateUserProfile = () => {
  const setAuth = useAuthStore((state) => state.setAuth)
  const token = useAuthStore((state) => state.accessToken)

  return useMutation({
    mutationFn: updateUserProfile,
    onSuccess: (response) => {
      if (response && token) {
        setAuth({
          user: response,
          accessToken: token,
        })
      }
    },
  })
}
