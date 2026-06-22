import { useMutation } from '@tanstack/react-query'
import { startInterviewSession } from '@/src/services/interview.service'

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
