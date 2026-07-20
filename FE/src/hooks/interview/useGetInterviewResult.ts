import { useQuery } from '@tanstack/react-query'
import { getInterviewResult } from '@/src/services/interview.service'

export const useGetInterviewResult = (sessionId: string | undefined) => {
  return useQuery({
    queryKey: ['interviewResult', sessionId],
    queryFn: () => getInterviewResult(sessionId!),
    enabled: !!sessionId,
    retry: 1,
  })
}
