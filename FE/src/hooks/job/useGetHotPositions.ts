import { useQuery } from '@tanstack/react-query'
import { getHotPositions } from '@/src/services/job.service'
import { HotPosition } from '@/src/types/job'

export const useGetHotPositions = (limit = 6) => {
  return useQuery<HotPosition[]>({
    queryKey: ['hotPositions', 'top-positions', limit],
    queryFn: () => getHotPositions(limit),
  })
}
