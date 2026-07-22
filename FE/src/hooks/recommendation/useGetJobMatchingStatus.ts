import { useQuery } from '@tanstack/react-query'
import { getJobMatchingStatus } from '@/src/services/recommendation.service'

export const useGetJobMatchingStatus = (taskId: string | null, enabled = false) => {
  return useQuery({
    queryKey: ['jobMatchingStatus', taskId],
    queryFn: () => (taskId ? getJobMatchingStatus(taskId) : Promise.reject('No task ID')),
    enabled: enabled && !!taskId,
    refetchInterval: (query) => {
      const data = query?.state?.data
      const isError = query?.state?.status === 'error'
      if (isError || data?.status === 'DONE' || data?.status === 'FAILED') {
        return false
      }
      return 2000 // Poll every 2 seconds
    },
    retry: (failureCount, error: any) => {
      if (error?.response?.status === 404) return false
      return failureCount < 2
    },
  })
}
