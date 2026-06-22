import { useMutation } from '@tanstack/react-query'
import { calculateMatchScore } from '@/src/services/recommendation.service'

export const useCalculateMatchScore = () => {
  return useMutation({
    mutationFn: ({ cvId, jobId }: { cvId: string; jobId: string }) =>
      calculateMatchScore(cvId, jobId),
  })
}
