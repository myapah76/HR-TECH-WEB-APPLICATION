import { useMutation, useQueryClient } from '@tanstack/react-query'
import { approveRelationship, approveAllPendingRelationships } from '@/src/services/skill.service'

export const useApproveRelationshipMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ sourceId, targetId, type }: { sourceId: string; targetId: string; type: string }) =>
      approveRelationship(sourceId, targetId, type),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pendingRelationships'] })
      queryClient.invalidateQueries({ queryKey: ['skillGraph'] })
    },
  })
}

export const useApproveAllRelationshipsMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => approveAllPendingRelationships(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pendingRelationships'] })
      queryClient.invalidateQueries({ queryKey: ['skillGraph'] })
    },
  })
}
