import { useMutation, useQueryClient } from '@tanstack/react-query'
import { reviewInterviewReschedule } from '@/src/services/application.service'

export const useReviewInterviewReschedule = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      applicationId,
      roundNumber,
      accepted,
      rejectionReason,
      newSlots,
    }: {
      applicationId: string
      roundNumber: number
      accepted: boolean
      rejectionReason?: string
      newSlots?: { startTime: string; endTime: string; location?: string; meetingLink?: string }[]
    }) => reviewInterviewReschedule(applicationId, roundNumber, accepted, rejectionReason, newSlots),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['applications'] })
      queryClient.invalidateQueries({ queryKey: ['recruiter-job-applications'] })
      queryClient.invalidateQueries({ queryKey: ['recruiter-interview-schedules'] })
      queryClient.invalidateQueries({ queryKey: ['application-interview-rounds', variables.applicationId] })
    },
  })
}
