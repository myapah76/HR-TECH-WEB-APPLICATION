import { useQuery } from '@tanstack/react-query'
import { getCompanies } from '@/src/services/company.service'
import { GetCompaniesParams } from '@/src/types/company'

export const useGetCompanies = (params?: GetCompaniesParams) => {
  return useQuery({
    queryKey: ['companies', params],
    queryFn: () => getCompanies(params),
  })
}
