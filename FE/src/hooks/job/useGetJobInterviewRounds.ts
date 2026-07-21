import { useQuery } from '@tanstack/react-query'
import { getJobInterviewRounds } from '@/src/services/job.service'

export const useGetJobInterviewRounds = (jobId: string) => {
  return useQuery({
    queryKey: ['job-interview-rounds', jobId],
    queryFn: () => getJobInterviewRounds(jobId),
    enabled: !!jobId,
  })
}
