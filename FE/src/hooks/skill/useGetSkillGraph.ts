import { useQuery } from '@tanstack/react-query'
import { getSkillGraph } from '@/src/services/skill.service'

export const useGetSkillGraph = () => {
  return useQuery({
    queryKey: ['skillGraph'],
    queryFn: () => getSkillGraph(),
    staleTime: 1000 * 60 * 5,
  })
}
