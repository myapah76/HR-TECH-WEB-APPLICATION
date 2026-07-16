import { useQuery } from '@tanstack/react-query'
import { getRecruiterDashboardSummary } from '@/src/services/company.service'

export const useGetRecruiterDashboardSummary = (enabled = true) => {
  return useQuery({
    queryKey: ['recruiter-dashboard-summary'],
    queryFn: getRecruiterDashboardSummary,
    enabled,
  })
}
