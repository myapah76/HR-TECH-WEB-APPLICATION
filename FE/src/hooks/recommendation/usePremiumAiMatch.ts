import { useMutation } from '@tanstack/react-query'
import { performPremiumAiMatch } from '@/src/services/recommendation.service'

export const usePremiumAiMatch = () => {
  return useMutation({
    mutationFn: ({ cvId, jobId }: { cvId: string; jobId: string }) =>
      performPremiumAiMatch(cvId, jobId),
  })
}
