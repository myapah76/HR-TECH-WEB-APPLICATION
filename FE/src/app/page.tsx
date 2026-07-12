'use client'
import { useRouter } from 'next/navigation'

import HeroSection from '@/src/components/home/HeroSection'
import TopEmployers from '@/src/components/home/TopEmployers'
import PromoBanners from '@/src/components/home/PromoBanners'
import JobsSection from '@/src/components/home/JobsSection'
import MarketStats from '@/src/components/home/MarketStats'
import TrendingSkills from '@/src/components/home/TrendingSkills'
import HotPositions from '@/src/components/home/HotPositions'

import { Job } from '@/src/types'
import { useGetLandingStats } from '@/src/hooks/job'

export default function HomePage() {
  const router = useRouter()

  const { data: stats, isLoading: statsLoading } = useGetLandingStats()

  return (
    <div className="space-y-1">
      <HeroSection trendingCount={stats?.totalJobs || 2546} />
      <PromoBanners />

      <JobsSection
        onJobSelect={(job: Job) => router.push(`/jobs/${job.id}`)}
        onViewAllLatestClick={() => router.push('/jobs')}
      />

      <TopEmployers />

      <TrendingSkills />

      <HotPositions />
      <MarketStats
        totalJobs={stats?.totalJobs || 0}
        totalCompanies={stats?.totalCompanies || 0}
        totalApplications={stats?.totalApplications || 0}
        onUploadCvClick={() => router.push('/candidate/ai-advisor')}
      />
    </div>
  )
}
