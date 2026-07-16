import { useQuery } from '@tanstack/react-query'
import { getRecruiterUpcomingInterviews } from '@/src/services/company.service'

export const useGetRecruiterUpcomingInterviews = (enabled = true) => {
  return useQuery({
    queryKey: ['recruiter-dashboard-upcoming-interviews'],
    queryFn: getRecruiterUpcomingInterviews,
    enabled,
  })
}
