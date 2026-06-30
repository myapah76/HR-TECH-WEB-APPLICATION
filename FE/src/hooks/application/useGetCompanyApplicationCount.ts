import { useQuery } from '@tanstack/react-query'
import { getCompanyApplicationCount } from '@/src/services/application.service'

export const useGetCompanyApplicationCount = (companyId: string | undefined) => {
  return useQuery({
    queryKey: ['applications', 'company', companyId, 'count'],
    queryFn: () => getCompanyApplicationCount(companyId!),
    enabled: !!companyId,
  })
}
