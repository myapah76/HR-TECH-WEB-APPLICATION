import { useQuery } from '@tanstack/react-query'
import { getRecruiterAnalytics } from '@/src/services/company.service'

export const useGetRecruiterAnalytics = (enabled = true) => {
  return useQuery({
    queryKey: ['recruiter-dashboard-analytics'],
    queryFn: getRecruiterAnalytics,
    enabled,
  })
}
