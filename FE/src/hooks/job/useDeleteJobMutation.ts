import { useMutation, useQueryClient } from '@tanstack/react-query'

import { deleteJob } from '@/src/services/job.service'

export const useDeleteJobMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ jobId, companyId }: { jobId: string; companyId: string }) =>
      deleteJob(jobId, companyId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobs'] })
      queryClient.invalidateQueries({ queryKey: ['manageJobs'] })
      queryClient.invalidateQueries({ queryKey: ['recruiter-job-stats'] })
    },
  })
}
