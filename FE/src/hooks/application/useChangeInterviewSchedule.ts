import { useMutation, useQueryClient } from '@tanstack/react-query'
import { changeInterviewSchedule } from '@/src/services/application.service'
import { ChangeInterviewScheduleRequest } from '@/src/types'

export const useChangeInterviewSchedule = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, request }: { id: string; request: ChangeInterviewScheduleRequest }) =>
      changeInterviewSchedule(id, request),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['appliedJobs'] })
      queryClient.invalidateQueries({ queryKey: ['applications'] })
      queryClient.invalidateQueries({ queryKey: ['application', variables.id] })
    },
  })
}
