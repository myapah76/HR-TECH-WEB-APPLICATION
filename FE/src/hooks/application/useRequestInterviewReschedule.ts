import { useMutation, useQueryClient } from '@tanstack/react-query'
import { requestInterviewReschedule } from '@/src/services/application.service'

export const useRequestInterviewReschedule = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      applicationId,
      roundNumber,
      preferredTime,
      reason,
    }: {
      applicationId: string
      roundNumber: number
      preferredTime: string
      reason: string
    }) => requestInterviewReschedule(applicationId, roundNumber, preferredTime, reason),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['applications'] })
      queryClient.invalidateQueries({ queryKey: ['application-interview-rounds', variables.applicationId] })
    },
  })
}
