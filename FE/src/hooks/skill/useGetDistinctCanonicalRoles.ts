import { useQuery } from '@tanstack/react-query'
import { getDistinctCanonicalRoles } from '@/src/services/skill.service'

export const useGetDistinctCanonicalRoles = () => {
  return useQuery({
    queryKey: ['distinctCanonicalRoles'],
    queryFn: () => getDistinctCanonicalRoles(),
  })
}
