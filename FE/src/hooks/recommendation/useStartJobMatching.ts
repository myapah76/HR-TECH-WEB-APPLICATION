import { useMutation } from '@tanstack/react-query'
import { startJobMatching } from '@/src/services/recommendation.service'

export const useStartJobMatching = () => {
  return useMutation({
    mutationFn: (cvId: string) => startJobMatching(cvId),
  })
}
