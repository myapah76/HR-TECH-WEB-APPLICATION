import { useMutation, useQueryClient } from '@tanstack/react-query'
import { bulkRejectApplications } from '@/src/services/application.service'
import { ApplicationSummaryResponse } from '@/src/types/application'

export const useBulkRejectApplications = (jobId: string) => {
  const queryClient = useQueryClient()
  return useMutation<ApplicationSummaryResponse[], Error, string[]>({
    mutationFn: bulkRejectApplications,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['applications', 'job', jobId] })
    },
  })
}
