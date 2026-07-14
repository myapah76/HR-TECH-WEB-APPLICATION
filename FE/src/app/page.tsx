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

export default function HomePage() {
  const router = useRouter()

  return (
    <div className="space-y-1">
      <HeroSection />
      <PromoBanners />

      <JobsSection
        onJobSelect={(job: Job) => router.push(`/jobs/${job.id}`)}
        onViewAllLatestClick={() => router.push('/jobs')}
      />

      <TopEmployers />

      <TrendingSkills />

      <HotPositions />
      <MarketStats />
    </div>
  )
}
