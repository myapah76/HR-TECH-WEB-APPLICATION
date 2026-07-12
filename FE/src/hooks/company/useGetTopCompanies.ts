import { useQuery } from '@tanstack/react-query'
import { getTopCompanies } from '@/src/services/company.service'

export const useGetTopCompanies = (limit = 6) => {
  return useQuery({
    queryKey: ['companies', 'top', limit],
    queryFn: () => getTopCompanies(limit),
  })
}
