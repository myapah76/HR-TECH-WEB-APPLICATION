import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getMyInterviewHistory, startInterviewSession } from '@/src/services/interview.service'

export const useGetInterviewSessionHistory = () => {
  return useQuery({
    queryKey: ['interviewHistory'],
    queryFn: getMyInterviewHistory,
  })
}

export const useStartInterviewSession = () => {
  return useMutation({
    mutationFn: ({
      cvId,
      jobId,
      targetRole,
      numQuestions,
    }: {
      cvId: string
      jobId: string | null
      targetRole: string
      numQuestions: number
    }) => startInterviewSession(cvId, jobId, targetRole, numQuestions),
  })
}
