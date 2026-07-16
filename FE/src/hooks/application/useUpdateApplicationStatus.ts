import { useMutation, useQueryClient } from '@tanstack/react-query'
import { updateApplicationStatus } from '@/src/services/application.service'
import { UpdateApplicationStatusRequest } from '@/src/types'

export const useUpdateApplicationStatus = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, request }: { id: string; request: UpdateApplicationStatusRequest }) =>
      updateApplicationStatus(id, request),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['applications'] })
      queryClient.invalidateQueries({ queryKey: ['interview-schedules'] })
      queryClient.invalidateQueries({ queryKey: ['application', variables.id] })
    },
  })
}
