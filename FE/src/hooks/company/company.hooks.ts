import { useQuery } from '@tanstack/react-query'
import { getMyCompany } from '@/src/services/company.service'

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
