import { useMutation, useQueryClient } from '@tanstack/react-query'
import { updateUserBlockedStatus } from '@/src/services/user.service'

export const useUpdateUserBlockedStatus = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: updateUserBlockedStatus,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
    },
  })
}
