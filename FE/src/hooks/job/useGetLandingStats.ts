import { useQuery } from '@tanstack/react-query'
import { getLandingStats } from '@/src/services/job.service'
import { LandingStatsResponse } from '@/src/types/job'

export const useGetLandingStats = () => {
  return useQuery<LandingStatsResponse>({
    queryKey: ['landingStats'],
    queryFn: getLandingStats,
    staleTime: 2 * 60 * 1000, // 2 minutes
    refetchOnWindowFocus: false, // Do not refetch when window regains focus
  })
}
