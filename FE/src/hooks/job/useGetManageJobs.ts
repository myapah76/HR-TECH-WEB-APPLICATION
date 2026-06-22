import { useQuery } from '@tanstack/react-query'
import { getManageJobs, ManageJobsParams } from '@/src/services/job.service'

export const useGetManageJobs = (companyId?: string, params?: ManageJobsParams) => {
  return useQuery({
    queryKey: ['manageJobs', companyId, params],
    queryFn: () => getManageJobs(companyId!, params),
    enabled: !!companyId,
  })
}
