import { useMutation, useQueryClient } from '@tanstack/react-query'
import { finalConfirmInterview } from '@/src/services/application.service'

export const useFinalConfirmInterview = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      applicationId,
      approved,
      note,
    }: {
      applicationId: string
      approved: boolean
      note?: string
    }) => finalConfirmInterview(applicationId, approved, note),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['applications'] })
      queryClient.invalidateQueries({ queryKey: ['application-interview-rounds', variables.applicationId] })
    },
  })
}
