import { useMutation, useQueryClient } from '@tanstack/react-query'
import { acceptInterviewSchedule } from '@/src/services/application.service'

export const useAcceptInterviewSchedule = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: acceptInterviewSchedule,
    onSuccess: (_data, applicationId) => {
      queryClient.invalidateQueries({ queryKey: ['appliedJobs'] })
      queryClient.invalidateQueries({ queryKey: ['applications'] })
      queryClient.invalidateQueries({ queryKey: ['application', applicationId] })
    },
  })
}
