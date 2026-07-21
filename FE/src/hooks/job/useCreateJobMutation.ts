import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createJob } from '@/src/services/job.service'

export const useCreateJobMutation = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: createJob,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobs'] })
      queryClient.invalidateQueries({ queryKey: ['manageJobs'] })
      queryClient.invalidateQueries({ queryKey: ['recruiter-job-stats'] })
    },
  })
}
