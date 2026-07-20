import { useQuery } from '@tanstack/react-query'
import { getCompanyPublicJobs } from '@/src/services/company.service'

export const useGetCompanyPublicJobs = (companyId: string | undefined) => {
  return useQuery({
    queryKey: ['companyJobsPublic', companyId],
    queryFn: () => getCompanyPublicJobs(companyId!),
    enabled: !!companyId,
  })
}
