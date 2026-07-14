import { useMutation, useQueryClient } from '@tanstack/react-query'
import { unsaveJob } from '@/src/services/job.service'

export const useUnsaveJob = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: unsaveJob,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['savedJobs'] })
      queryClient.invalidateQueries({ queryKey: ['candidate-recent-activities'] })
      queryClient.invalidateQueries({ queryKey: ['candidate-summary'] })
    },
  })
}
