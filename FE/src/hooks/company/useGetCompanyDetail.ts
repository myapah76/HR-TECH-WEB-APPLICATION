import { useQuery } from '@tanstack/react-query'
import { getCompanyDetail } from '@/src/services/company.service'

export const useGetCompanyDetail = (id: string | undefined) => {
  return useQuery({
    queryKey: ['companyDetail', id],
    queryFn: () => getCompanyDetail(id!),
    enabled: !!id,
  })
}
