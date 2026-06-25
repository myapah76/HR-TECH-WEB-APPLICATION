import { useMutation } from '@tanstack/react-query'
import { submitAndEvaluateInterview } from '@/src/services/interview.service'

export const useSubmitAndEvaluateInterview = () => {
  return useMutation({
    mutationFn: (sessionId: string) => submitAndEvaluateInterview(sessionId),
  })
}
