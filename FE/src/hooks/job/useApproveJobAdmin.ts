import { useMutation, useQueryClient } from '@tanstack/react-query'
import { adminApproveJob } from '@/src/services/admin-job.service'

export const useApproveJobAdmin = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => adminApproveJob(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-jobs'] })
    },
  })
}
