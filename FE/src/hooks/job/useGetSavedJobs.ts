import { useQuery } from '@tanstack/react-query'
import { getSavedJobs } from '@/src/services/job.service'

export const useGetSavedJobs = (enable = true) => {
  return useQuery({
    queryKey: ['savedJobs'],
    queryFn: () => getSavedJobs(),
    enabled: enable,
  })
}
