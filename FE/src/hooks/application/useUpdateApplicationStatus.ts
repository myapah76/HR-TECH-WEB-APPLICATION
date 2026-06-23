import { useMutation, useQueryClient } from '@tanstack/react-query'
import { updateApplicationStatus } from '@/src/services/application.service'
import { ApplicationStatus } from '@/src/types'

export const useUpdateApplicationStatus = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: ApplicationStatus }) =>
      updateApplicationStatus(id, status),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['applications'] })
      queryClient.invalidateQueries({ queryKey: ['application', variables.id] })
    },
  })
}
