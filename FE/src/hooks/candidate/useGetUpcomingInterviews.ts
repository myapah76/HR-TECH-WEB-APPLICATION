import { useQuery } from '@tanstack/react-query'
import { getUpcomingInterviews } from '@/services/candidate.service'
import { UpcomingInterviewItem } from '@/types'

export const useGetUpcomingInterviews = () => {
  return useQuery<UpcomingInterviewItem[]>({
    queryKey: ['candidate-upcoming-interviews'],
    queryFn: getUpcomingInterviews,
  })
}
