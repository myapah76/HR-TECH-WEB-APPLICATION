import { submitInterviewAnswer } from '@/src/services/interview.service'
import { useMutation } from '@tanstack/react-query'
import { AnswerSubmitRequest } from '@/src/types/interview'

export const useSubmitInterviewAnswer = () => {
  return useMutation({
    mutationFn: ({ sessionId, request }: { sessionId: string; request: AnswerSubmitRequest }) =>
      submitInterviewAnswer(sessionId, request),
  })
}
