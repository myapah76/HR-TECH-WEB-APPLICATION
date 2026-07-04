import { useQuery } from '@tanstack/react-query'
import { getMyApplications } from '@/src/services/application.service'

export const useGetMyApplications = (page = 0, size = 10, enabled = true) => {
  return useQuery({
    queryKey: ['appliedJobs', page, size],
    queryFn: () => getMyApplications(page, size),
    enabled,
  })
}
