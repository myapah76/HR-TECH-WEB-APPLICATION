import { useMutation, useQueryClient } from '@tanstack/react-query'
import { selectInterviewSlot } from '@/src/services/application.service'

export const useSelectInterviewSlot = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      applicationId,
      roundNumber,
      slotId,
    }: {
      applicationId: string
      roundNumber: number
      slotId: string
    }) => selectInterviewSlot(applicationId, roundNumber, slotId),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['applications'] })
      queryClient.invalidateQueries({ queryKey: ['application-interview-rounds', variables.applicationId] })
    },
  })
}
