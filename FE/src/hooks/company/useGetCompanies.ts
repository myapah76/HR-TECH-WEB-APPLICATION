import { useQuery } from '@tanstack/react-query'
import { getCompanies, GetCompaniesParams } from '@/src/services/company.service'

export const useGetCompanies = (params?: GetCompaniesParams) => {
  return useQuery({
    queryKey: ['companies', params],
    queryFn: async () => {
      const response = await getCompanies(params)
      return response.data
    },
  })
}
