import { useQuery } from '@tanstack/react-query'
import { getRecentActivities } from '@/services/candidate.service'
import { RecentActivityItem } from '@/types'

export const useGetRecentActivities = (limit = 5) => {
  return useQuery<RecentActivityItem[]>({
    queryKey: ['candidate-recent-activities', limit],
    queryFn: () => getRecentActivities(limit),
  })
}
