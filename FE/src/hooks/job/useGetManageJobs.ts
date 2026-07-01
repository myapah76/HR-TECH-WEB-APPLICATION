import { useQuery } from '@tanstack/react-query'
import { getManageJobs } from '@/src/services/job.service'
import { ManageJobsParams } from '@/src/types/job'

export const useGetManageJobs = (companyId?: string, params?: ManageJobsParams) => {
  return useQuery({
    queryKey: ['manageJobs', companyId, params],
    queryFn: () => getManageJobs(companyId!, params),
    enabled: !!companyId,
  })
}
