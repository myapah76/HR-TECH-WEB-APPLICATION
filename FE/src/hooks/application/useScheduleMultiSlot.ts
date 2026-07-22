import { useMutation, useQueryClient } from '@tanstack/react-query'
import { scheduleMultiSlotInterview } from '@/src/services/application.service'

export const useScheduleMultiSlot = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: scheduleMultiSlotInterview,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['applications'] })
      queryClient.invalidateQueries({ queryKey: ['job-interview-rounds'] })
    },
  })
}
