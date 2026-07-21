import { useMutation, useQueryClient } from '@tanstack/react-query'
import { bulkScoreByJob } from '@/src/services/application.service'
import { BulkScoreResponse } from '@/src/types/application'

export const useBulkScoreByJob = (jobId: string) => {
  const queryClient = useQueryClient()
  return useMutation<
    BulkScoreResponse,
    Error,
    { thresholdPercent: number; autoRejectBelowThreshold: boolean }
  >({
    mutationFn: (options) => bulkScoreByJob(jobId, options),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['applications', 'job', jobId] })
    },
  })
}
