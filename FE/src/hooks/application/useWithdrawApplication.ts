import { useMutation, useQueryClient } from '@tanstack/react-query'
import { withdrawApplication } from '@/src/services/application.service'

export const useWithdrawApplication = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: withdrawApplication,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appliedJobs'] })
      queryClient.invalidateQueries({ queryKey: ['candidate-recent-activities'] })
      queryClient.invalidateQueries({ queryKey: ['candidate-summary'] })
    },
  })
}
