import { useQuery } from '@tanstack/react-query'
import { getApplicationsByJob } from '@/src/services/application.service'

export const useGetApplicationsByJob = (jobId: string | undefined) => {
  return useQuery({
    queryKey: ['applications', 'job', jobId],
    queryFn: () => getApplicationsByJob(jobId!),
    enabled: !!jobId,
  })
}
