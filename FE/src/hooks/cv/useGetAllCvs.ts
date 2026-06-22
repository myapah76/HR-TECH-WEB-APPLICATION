import { useQuery } from '@tanstack/react-query'
import { getAllCvs } from '@/src/services/cv.service'

export const useGetAllCvs = (enabled = true) => {
  return useQuery({
    queryKey: ['cvs'],
    queryFn: getAllCvs,
    enabled,
    refetchInterval: (query) => {
      const cvs = query.state?.data || []
      const hasPending = cvs.some(cv => cv.extractionStatus === 'PENDING' || cv.extractionStatus === 'PROCESSING')
      return hasPending ? 3000 : false
    }
  })
}
