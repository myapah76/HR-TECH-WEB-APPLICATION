import { useQuery } from '@tanstack/react-query'
import { getApplicationsByJob } from '@/src/services/application.service'

export const useGetApplicationsByJob = (jobId: string | undefined, page = 0, size = 10) => {
  return useQuery({
    queryKey: ['applications', 'job', jobId, page, size],
    queryFn: () => getApplicationsByJob(jobId!, page, size),
    enabled: !!jobId,
  })
}
