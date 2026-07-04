import { useQuery } from '@tanstack/react-query'
import { checkHasApplied } from '@/src/services/application.service'

export const useCheckHasApplied = (jobId: string | undefined, enabled = true) => {
  return useQuery({
    queryKey: ['hasApplied', jobId],
    queryFn: () => checkHasApplied(jobId!),
    enabled: enabled && !!jobId,
  })
}
