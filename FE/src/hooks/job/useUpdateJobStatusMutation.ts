import { useMutation, useQueryClient } from '@tanstack/react-query'

import { updateJobStatus } from '@/src/services/job.service'
import { JobStatusAction } from '@/src/types/job'

interface UpdateJobStatusVariables {
  jobId: string
  action: JobStatusAction
}

export const useUpdateJobStatusMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ jobId, action }: UpdateJobStatusVariables) => updateJobStatus(jobId, action),
    onSuccess: (updatedJob) => {
      queryClient.setQueryData(['job', updatedJob.id], updatedJob)
      queryClient.invalidateQueries({ queryKey: ['jobs'] })
      queryClient.invalidateQueries({ queryKey: ['manageJobs'] })
    },
  })
}
