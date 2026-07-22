import { useQuery } from '@tanstack/react-query'
import { getApplicationInterviewRounds } from '@/src/services/application.service'

export const useGetApplicationInterviewRounds = (applicationId: string, enabled = true) => {
  return useQuery({
    queryKey: ['application-interview-rounds', applicationId],
    queryFn: () => getApplicationInterviewRounds(applicationId),
    enabled: !!applicationId && enabled,
  })
}
