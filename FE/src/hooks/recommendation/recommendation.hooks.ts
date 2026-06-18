import { useQuery, useMutation } from '@tanstack/react-query'
import {
  analyzeCvAndRecommend,
  recommendJobsForCv,
  calculateMatchScore,
  startJobMatching,
  getJobMatchingStatus,
} from '@/src/services/recommendation.service'

export const useAnalyzeCvAndRecommend = () => {
  return useMutation({
    mutationFn: ({ cvId, limit }: { cvId: string; limit?: number }) =>
      analyzeCvAndRecommend(cvId, limit),
  })
}

export const useRecommendJobsForCv = (cvId: string, limit = 10, enabled = true) => {
  return useQuery({
    queryKey: ['recommendJobs', cvId, limit],
    queryFn: () => recommendJobsForCv(cvId, limit),
    enabled: enabled && !!cvId,
  })
}

export const useCalculateMatchScore = () => {
  return useMutation({
    mutationFn: ({ cvId, jobId }: { cvId: string; jobId: string }) =>
      calculateMatchScore(cvId, jobId),
  })
}

export const useStartJobMatching = () => {
  return useMutation({
    mutationFn: (cvId: string) => startJobMatching(cvId),
  })
}

export const useGetJobMatchingStatus = (taskId: string | null, enabled = false) => {
  return useQuery({
    queryKey: ['jobMatchingStatus', taskId],
    queryFn: () => (taskId ? getJobMatchingStatus(taskId) : Promise.reject('No task ID')),
    enabled: enabled && !!taskId,
    refetchInterval: (query) => {
      const data = query?.state?.data
      if (data?.status === 'DONE' || data?.status === 'FAILED') {
        return false
      }
      return 2000 // Poll every 2 seconds
    },
  })
}
