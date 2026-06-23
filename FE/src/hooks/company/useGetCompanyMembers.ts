import { useQuery } from '@tanstack/react-query'

import { getCompanyMembers } from '@/src/services/company.service'

export const useGetCompanyMembers = (companyId?: string, enabled = true) => {
  return useQuery({
    queryKey: ['companyMembers', companyId],
    queryFn: () => getCompanyMembers(companyId!),
    enabled: enabled && !!companyId,
  })
}
