import { useQuery } from '@tanstack/react-query'
import { getHotPositions } from '@/src/services/job.service'
import { HotPosition } from '@/src/types/job'

export const useGetHotPositions = () => {
  return useQuery<HotPosition[]>({
    queryKey: ['hotPositions'],
    queryFn: async () => {
      try {
        return await getHotPositions()
      } catch (error) {
        console.warn('API /jobs/hot-positions failed, falling back to mock data.', error)
        return [
          { name: 'Frontend Developer', jobCount: 45 },
          { name: 'Backend Developer', jobCount: 52 },
          { name: 'DevOps Engineer', jobCount: 22 },
          { name: 'Mobile Developer', jobCount: 15 },
          { name: 'Data Engineer / Analyst', jobCount: 18 },
          { name: 'Business Analyst / PM', jobCount: 12 }
        ]
      }
    }
  })
}
