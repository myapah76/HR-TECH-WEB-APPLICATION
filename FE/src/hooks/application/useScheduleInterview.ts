import { useMutation, useQueryClient } from '@tanstack/react-query'
import { scheduleInterview } from '@/src/services/application.service'
import { ScheduleInterviewRequest } from '@/src/types'

export const useScheduleInterview = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, request }: { id: string; request: ScheduleInterviewRequest }) =>
      scheduleInterview(id, request),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['applications'] })
      queryClient.invalidateQueries({ queryKey: ['application', variables.id] })
    },
  })
}
