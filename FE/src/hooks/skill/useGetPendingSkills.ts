import { useQuery } from '@tanstack/react-query'
import { getPendingSkills } from '@/src/services/skill.service'

export const useGetPendingSkills = () => {
  return useQuery({
    queryKey: ['pendingSkills'],
    queryFn: () => getPendingSkills(),
  })
}
