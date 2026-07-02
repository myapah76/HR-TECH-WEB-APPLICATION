import { useMutation, useQueryClient } from '@tanstack/react-query'
import { rejectCandidateReschedule } from '@/src/services/application.service'

export const useRejectCandidateReschedule = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: rejectCandidateReschedule,
    onSuccess: (_data, applicationId) => {
      queryClient.invalidateQueries({ queryKey: ['applications'] })
      queryClient.invalidateQueries({ queryKey: ['application', applicationId] })
    },
  })
}
