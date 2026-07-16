import { useMutation, useQueryClient } from '@tanstack/react-query'

import { updateJobStatus } from '@/src/services/job.service'
import { UpdateJobStatusVariables } from '@/src/types/job'

export const useUpdateJobStatusMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ jobId, action, companyId }: UpdateJobStatusVariables) =>
      updateJobStatus(jobId, action, companyId),
    onSuccess: (updatedJob) => {
      queryClient.setQueryData(['job', updatedJob.id], updatedJob)
      queryClient.invalidateQueries({ queryKey: ['jobs'] })
      queryClient.invalidateQueries({ queryKey: ['manageJobs'] })
    },
  })
}
