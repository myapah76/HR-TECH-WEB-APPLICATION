import { useMutation } from '@tanstack/react-query'
import { rejectInterviewSchedule } from '@/src/services/application.service'
import { RejectInterviewScheduleRequest } from '@/src/types'

export const useRejectInterviewSchedule = () => {
  return useMutation({
    mutationFn: ({ token, request }: { token: string; request: RejectInterviewScheduleRequest }) =>
      rejectInterviewSchedule(token, request),
  })
}
