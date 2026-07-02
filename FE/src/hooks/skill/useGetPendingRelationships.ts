import { useQuery } from '@tanstack/react-query'
import { getPendingRelationships } from '@/src/services/skill.service'

export const useGetPendingRelationships = () => {
  return useQuery({
    queryKey: ['pendingRelationships'],
    queryFn: () => getPendingRelationships(),
  })
}
