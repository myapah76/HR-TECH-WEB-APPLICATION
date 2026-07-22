import { useMutation, useQueryClient } from '@tanstack/react-query'
import { checkInInterviewRound } from '@/src/services/application.service'

export const useCheckInInterviewRound = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      applicationId,
      roundNumber,
    }: {
      applicationId: string
      roundNumber: number
    }) => checkInInterviewRound(applicationId, roundNumber),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['applications'] })
      queryClient.invalidateQueries({ queryKey: ['recruiter-job-applications'] })
      queryClient.invalidateQueries({ queryKey: ['recruiter-interview-schedules'] })
      queryClient.invalidateQueries({ queryKey: ['application-interview-rounds', variables.applicationId] })
    },
  })
}
