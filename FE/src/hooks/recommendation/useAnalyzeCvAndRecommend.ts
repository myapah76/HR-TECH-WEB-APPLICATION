import { useMutation } from '@tanstack/react-query'
import { analyzeCvAndRecommend } from '@/src/services/recommendation.service'

export const useAnalyzeCvAndRecommend = () => {
  return useMutation({
    mutationFn: ({ cvId, limit }: { cvId: string; limit?: number }) =>
      analyzeCvAndRecommend(cvId, limit),
  })
}
