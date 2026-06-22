import { useQuery } from '@tanstack/react-query'
import { getCvDetail } from '@/src/services/cv.service'

export const useGetCvDetail = (cvId: string, enabled = true) => {
  return useQuery({
    queryKey: ['cvs', cvId],
    queryFn: () => getCvDetail(cvId),
    enabled,
  })
}
