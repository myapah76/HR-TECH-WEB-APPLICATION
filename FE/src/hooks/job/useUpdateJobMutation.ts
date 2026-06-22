import { useMutation, useQueryClient } from '@tanstack/react-query'
import { updateJob } from '@/src/services/job.service'

export const useUpdateJobMutation = (jobId: string) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: Parameters<typeof updateJob>[1]) => updateJob(jobId, data),
    onSuccess: (updatedJob) => {
      queryClient.setQueryData(['job', jobId], updatedJob)
      queryClient.invalidateQueries({ queryKey: ['jobs'] })
      queryClient.invalidateQueries({ queryKey: ['manageJobs'] })
    },
  })
}
