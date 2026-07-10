import { useQuery } from '@tanstack/react-query'
import { getLandingStats } from '@/src/services/job.service'
import { LandingStatsResponse } from '@/src/types/job'

export const useGetLandingStats = () => {
  return useQuery<LandingStatsResponse>({
    queryKey: ['landingStats'],
    queryFn: async () => {
      try {
        return await getLandingStats()
      } catch (error) {
        console.warn('API /jobs/landing-stats failed, falling back to mock data.', error)
        return {
          totalJobs: 2546,
          totalCompanies: 154,
          totalApplications: 14820,
          trendingSkills: [
            { name: 'React Native', jobCount: 15 },
            { name: 'Golang', jobCount: 12 },
            { name: 'System Design', jobCount: 9 },
            { name: 'DevOps', jobCount: 22 },
            { name: 'Spring Boot', jobCount: 30 },
            { name: 'Python', jobCount: 18 },
            { name: 'Kubernetes', jobCount: 14 },
            { name: 'TypeScript', jobCount: 25 }
          ],
          topCompanies: [
            { id: '1', name: 'Google Inc.', logoUrl: 'https://images.unsplash.com/photo-1572021335469-31706a17aaef?auto=format&fit=crop&w=150&q=80', activeJobsCount: 12 },
            { id: '2', name: 'FPT Corporation', logoUrl: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=150&q=80', activeJobsCount: 28 },
            { id: '3', name: 'Vingroup JSC', logoUrl: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=150&q=80', activeJobsCount: 18 },
            { id: '4', name: 'Techcombank', logoUrl: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&w=150&q=80', activeJobsCount: 15 },
            { id: '5', name: 'Viettel Telecom', logoUrl: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=150&q=80', activeJobsCount: 20 },
            { id: '6', name: 'HDBank Group', logoUrl: 'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?auto=format&fit=crop&w=150&q=80', activeJobsCount: 11 }
          ],
          hotRoles: [
            { name: 'Frontend Developer', jobCount: 45 },
            { name: 'Backend Developer', jobCount: 52 },
            { name: 'DevOps Engineer', jobCount: 22 },
            { name: 'Mobile Developer', jobCount: 15 },
            { name: 'Data Engineer / Analyst', jobCount: 18 },
            { name: 'Business Analyst / PM', jobCount: 12 }
          ]
        }
      }
    }
  })
}
