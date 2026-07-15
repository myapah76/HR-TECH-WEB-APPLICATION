import { useQuery } from '@tanstack/react-query'
import { getJobSearchAnalytics } from '@/services/candidate.service'
import { JobSearchAnalyticsResponse } from '@/types'

export const useGetJobSearchAnalytics = () => {
  return useQuery<JobSearchAnalyticsResponse>({
    queryKey: ['candidate-job-search-analytics'],
    queryFn: getJobSearchAnalytics,
  })
}
