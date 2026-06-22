import { useQuery } from '@tanstack/react-query'
import { getJobById } from '@/src/services/job.service'

export const useGetJobById = (id: string) => {
  return useQuery({
    queryKey: ['job', id],
    queryFn: () => getJobById(id),
    enabled: !!id,
  })
}
