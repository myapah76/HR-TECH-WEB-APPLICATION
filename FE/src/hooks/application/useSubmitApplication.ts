import { useMutation, useQueryClient } from '@tanstack/react-query'
import { submitApplication } from '@/src/services/application.service'

export const useSubmitApplication = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: submitApplication,
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['appliedJobs'] })
      queryClient.invalidateQueries({ queryKey: ['candidate-recent-activities'] })
      queryClient.invalidateQueries({ queryKey: ['candidate-summary'] })
      queryClient.invalidateQueries({ queryKey: ['applications'] })
      if (variables?.jobId) {
        queryClient.setQueryData(['hasApplied', variables.jobId], true)
        queryClient.invalidateQueries({ queryKey: ['hasApplied', variables.jobId] })
        queryClient.invalidateQueries({ queryKey: ['applications', 'job', variables.jobId] })
      }
    },
  })
}
