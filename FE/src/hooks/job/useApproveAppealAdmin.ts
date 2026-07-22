import { useMutation, useQueryClient } from '@tanstack/react-query'
import { adminApproveAppeal } from '@/src/services/admin-job.service'

export const useApproveAppealAdmin = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => adminApproveAppeal(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-jobs'], refetchType: 'all' })
      queryClient.invalidateQueries({ queryKey: ['manageJobs'], refetchType: 'all' })
      queryClient.invalidateQueries({ queryKey: ['jobs'], refetchType: 'all' })
      queryClient.invalidateQueries({ queryKey: ['recruiter-job-stats'], refetchType: 'all' })
    },
  })
}
