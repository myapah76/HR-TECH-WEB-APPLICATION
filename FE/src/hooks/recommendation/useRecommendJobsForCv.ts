import { useQuery } from '@tanstack/react-query'
import { recommendJobsForCv } from '@/src/services/recommendation.service'

export const useRecommendJobsForCv = (cvId: string, limit = 10, enabled = true) => {
  return useQuery({
    queryKey: ['recommendJobs', cvId, limit],
    queryFn: () => recommendJobsForCv(cvId, limit),
    enabled: enabled && !!cvId,
  })
}
