import { useQuery } from '@tanstack/react-query'
import { getMyApplications } from '@/src/services/application.service'

export const useGetMyApplications = (enabled = true) => {
  return useQuery({
    queryKey: ['appliedJobs'],
    queryFn: getMyApplications,
    enabled,
  })
}
