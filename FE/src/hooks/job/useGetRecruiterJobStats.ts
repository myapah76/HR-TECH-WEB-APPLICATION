import { useQuery } from '@tanstack/react-query'
import { getRecruiterJobStats } from '@/src/services/job.service'

export const useGetRecruiterJobStats = (companyId?: string) => {
  return useQuery({
    queryKey: ['recruiter-job-stats', companyId],
    queryFn: () => getRecruiterJobStats(companyId!),
    enabled: !!companyId,
    staleTime: 5 * 60 * 1000,
  })
}
