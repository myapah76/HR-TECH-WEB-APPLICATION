import { useMutation, useQueryClient } from '@tanstack/react-query'

import { updateJobStatus } from '@/src/services/job.service'
import { UpdateJobStatusVariables } from '@/src/types/job'

export const useUpdateJobStatusMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ jobId, action, companyId, reason }: UpdateJobStatusVariables) =>
      updateJobStatus(jobId, action, companyId, reason),
    onSuccess: (updatedJob) => {
      queryClient.setQueryData(['job', updatedJob.id], updatedJob)
      queryClient.invalidateQueries({ queryKey: ['jobs'] })
      queryClient.invalidateQueries({ queryKey: ['manageJobs'] })
      queryClient.invalidateQueries({ queryKey: ['recruiter-job-stats'] })
    },
  })
}
