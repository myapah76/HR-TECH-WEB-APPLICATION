import { useQuery } from '@tanstack/react-query'
import { getRecruiterActiveJobs } from '@/src/services/company.service'

export const useGetRecruiterActiveJobs = (enabled = true) => {
  return useQuery({
    queryKey: ['recruiter-dashboard-active-jobs'],
    queryFn: getRecruiterActiveJobs,
    enabled,
  })
}
