import { useQuery } from '@tanstack/react-query'
import { getCandidateDashboardSummary } from '@/services/candidate.service'
import { CandidateSummaryResponse } from '@/types'

export const useGetCandidateSummary = () => {
  return useQuery<CandidateSummaryResponse>({
    queryKey: ['candidate-summary'],
    queryFn: getCandidateDashboardSummary,
  })
}
