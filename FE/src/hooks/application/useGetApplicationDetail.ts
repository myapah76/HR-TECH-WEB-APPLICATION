import { useQuery } from '@tanstack/react-query'
import { getApplicationDetail } from '@/src/services/application.service'

export const useGetApplicationDetail = (id: string | undefined) => {
  return useQuery({
    queryKey: ['application', id],
    queryFn: () => getApplicationDetail(id!),
    enabled: !!id,
  })
}
