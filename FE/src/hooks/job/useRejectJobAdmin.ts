import { useMutation, useQueryClient } from '@tanstack/react-query'
import { adminRejectJob } from '@/src/services/admin-job.service'

export const useRejectJobAdmin = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => adminRejectJob(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-jobs'] })
    },
  })
}
