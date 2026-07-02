import { useQuery } from '@tanstack/react-query'
import { getSkills } from '@/src/services/skill.service'

export const useGetSkills = () => {
  return useQuery({
    queryKey: ['skills'],
    queryFn: () => getSkills(),
    staleTime: 1000 * 60 * 5, // 5 minutes cache
  })
}
