import { useQuery } from '@tanstack/react-query'
import { getCompaniesForAdmin } from '@/src/services/admin-company.service'

export const useGetAdminCompanies = (keyword?: string, page = 0, size = 10) => {
  return useQuery({
    queryKey: ['admin-companies', { keyword, page, size }],
    queryFn: () => getCompaniesForAdmin(keyword, page, size),
  })
}
