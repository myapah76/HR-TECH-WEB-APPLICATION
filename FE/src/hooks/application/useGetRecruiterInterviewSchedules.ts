import { useQuery } from '@tanstack/react-query'
import { getRecruiterInterviewSchedules } from '@/src/services/application.service'

export const useGetRecruiterInterviewSchedules = (companyId: string | undefined, enabled = true) => {
  return useQuery({
    queryKey: ['interview-schedules', companyId],
    queryFn: () => getRecruiterInterviewSchedules(companyId!),
    enabled: enabled && !!companyId,
  })
}
