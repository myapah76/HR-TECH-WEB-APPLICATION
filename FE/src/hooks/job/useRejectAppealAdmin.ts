import { useMutation, useQueryClient } from '@tanstack/react-query'
import { adminRejectAppeal } from '@/src/services/admin-job.service'

export const useRejectAppealAdmin = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => adminRejectAppeal(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-jobs'] })
    },
  })
}
