import { useQuery } from '@tanstack/react-query'
import { getCompanyApplications } from '@/src/services/application.service'

export const useGetCompanyApplications = (companyId: string | undefined, enabled = true) => {
  return useQuery({
    queryKey: ['company-applications', companyId],
    queryFn: () => getCompanyApplications(companyId!),
    enabled: enabled && !!companyId,
  })
}
