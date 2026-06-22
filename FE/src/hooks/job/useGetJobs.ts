import { useQuery } from '@tanstack/react-query'
import { getJobs } from '@/src/services/job.service'

export const useGetJobs = (page: number, size: number) => {
  return useQuery({
    queryKey: ['jobs', page, size],
    queryFn: () => getJobs(page, size),
  })
}
