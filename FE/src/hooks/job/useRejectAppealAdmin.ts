import { useMutation, useQueryClient } from '@tanstack/react-query'
import { adminRejectAppeal } from '@/src/services/admin-job.service'

export const useRejectAppealAdmin = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ jobId, reason }: { jobId: string; reason?: string }) =>
      adminRejectAppeal(jobId, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-jobs'] })
    },
  })
}
