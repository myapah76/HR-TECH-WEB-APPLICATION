import { useMutation, useQueryClient } from '@tanstack/react-query'
import { duplicateJob } from '@/src/services/job.service'

export const useDuplicateJobMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ jobId, companyId }: { jobId: string; companyId: string }) =>
      duplicateJob(jobId, companyId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobs'] })
      queryClient.invalidateQueries({ queryKey: ['manageJobs'] })
      queryClient.invalidateQueries({ queryKey: ['recruiter-job-stats'] })
    },
  })
}
