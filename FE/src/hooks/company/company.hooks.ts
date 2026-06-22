import { useQuery } from '@tanstack/react-query'
import { getMyCompany, getCompanies, GetCompaniesParams } from '@/src/services/company.service'

export const useGetMyCompany = () => {
  return useQuery({
    queryKey: ['myCompany'],
    queryFn: async () => {
      const response = await getMyCompany()
      return response.data
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  })
}

export const useGetCompanies = (params?: GetCompaniesParams) => {
  return useQuery({
    queryKey: ['companies', params],
    queryFn: async () => {
      const response = await getCompanies(params)
      return response.data
    },
    staleTime: 1000 * 60 * 2, // 2 minutes
  })
}

