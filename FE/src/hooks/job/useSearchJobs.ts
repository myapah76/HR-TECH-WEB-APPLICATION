import { useQuery } from '@tanstack/react-query'
import { searchJobs } from '@/src/services/job.service'
import { JobSearchParams } from '@/src/types/job'

export const useSearchJobs = (params: JobSearchParams) => {
  return useQuery({
    queryKey: ['jobs', 'search', params],
    queryFn: () => searchJobs(params),
    staleTime: 1000 * 30, // 30s cache
  })
}
