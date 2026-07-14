import { useMutation, useQueryClient } from '@tanstack/react-query'
import { saveJob } from '@/src/services/job.service'

export const useSaveJob = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: saveJob,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['savedJobs'] })
      queryClient.invalidateQueries({ queryKey: ['candidate-recent-activities'] })
      queryClient.invalidateQueries({ queryKey: ['candidate-summary'] })
    },
  })
}
