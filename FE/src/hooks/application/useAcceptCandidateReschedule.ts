import { useMutation, useQueryClient } from '@tanstack/react-query'
import { acceptCandidateReschedule } from '@/src/services/application.service'

export const useAcceptCandidateReschedule = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: acceptCandidateReschedule,
    onSuccess: (_data, applicationId) => {
      queryClient.invalidateQueries({ queryKey: ['applications'] })
      queryClient.invalidateQueries({ queryKey: ['interview-schedules'] })
      queryClient.invalidateQueries({ queryKey: ['application', applicationId] })
    },
  })
}
