import { useMutation, useQueryClient } from '@tanstack/react-query'
import { evaluateInterviewRound } from '@/src/services/application.service'

export const useEvaluateInterviewRound = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      applicationId,
      roundNumber,
      passed,
      rating,
      feedbackNote,
      isAttended,
    }: {
      applicationId: string
      roundNumber: number
      passed: boolean
      rating?: number
      feedbackNote?: string
      isAttended?: boolean
    }) => evaluateInterviewRound(applicationId, roundNumber, passed, rating, feedbackNote, isAttended),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['applications'] })
      queryClient.invalidateQueries({ queryKey: ['recruiter-job-applications'] })
      queryClient.invalidateQueries({ queryKey: ['recruiter-interview-schedules'] })
      queryClient.invalidateQueries({ queryKey: ['application-interview-rounds', variables.applicationId] })
    },
  })
}
