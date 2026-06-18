import { getJobs, getJobById } from '@/src/services/job.service'
import { useQuery } from '@tanstack/react-query'

export const useGetJobs = (page: number, size: number) => {
  return useQuery({
    queryKey: ['jobs', page, size],
    queryFn: () => getJobs(page, size),
  })
}

export const useGetJobById = (id: string, enabled = true) => {
  return useQuery({
    queryKey: ['job', id],
    queryFn: () => getJobById(id),
    enabled: enabled && !!id,
  })
}

