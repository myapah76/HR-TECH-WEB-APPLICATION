import { useQuery } from '@tanstack/react-query'
import { getTrendingSkills } from '@/src/services/job.service'

export const useGetTrendingSkills = (limit = 8) => {
  return useQuery({
    queryKey: ['skills', 'trending', limit],
    queryFn: () => getTrendingSkills(limit),
    staleTime: 1000 * 60 * 5, // 5 minutes cache
  })
}
