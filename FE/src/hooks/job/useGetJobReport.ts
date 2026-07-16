import { useQuery } from '@tanstack/react-query'
import { getJobReport } from '@/src/services/admin-job.service'
import { AdminJobsParams } from '@/src/types/job'

export const useGetJobReport = (params?: Omit<AdminJobsParams, 'status'>) => {
  return useQuery({
    queryKey: ['admin-jobs', params],
    queryFn: () => getJobReport(params),
  })
}
