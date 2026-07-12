import { useQuery } from '@tanstack/react-query'
import { recommendCandidatesForJob } from '@/src/services/recommendation.service'

export const useRecommendCandidatesForJob = (
  jobId: string,
  enabled = true
) => {
  return useQuery({
    queryKey: ['recommendCandidates', jobId],
    queryFn: () => recommendCandidatesForJob(jobId),
    enabled: enabled && !!jobId,
    staleTime: 15 * 60 * 1000, // cache 15 phút – không refetch khi navigate lại trang
    retry: false,              // Không thử lại khi lỗi để tránh loop
  })
}