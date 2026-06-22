import { useQuery } from '@tanstack/react-query'
import { getMyInterviewHistory } from '@/src/services/interview.service'

export const useGetInterviewSessionHistory = () => {
  return useQuery({
    queryKey: ['interviewHistory'],
    queryFn: getMyInterviewHistory,
  })
}
