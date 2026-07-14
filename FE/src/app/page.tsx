'use client'

import HeroSection from '@/src/components/home/HeroSection'
import TopEmployers from '@/src/components/home/TopEmployers'
import PromoBanners from '@/src/components/home/PromoBanners'
import JobsSection from '@/src/components/home/JobsSection'
import MarketStats from '@/src/components/home/MarketStats'
import TrendingSkills from '@/src/components/home/TrendingSkills'
import HotPositions from '@/src/components/home/HotPositions'

export default function HomePage() {
  return (
    <div className="space-y-1">
      <HeroSection />
      <PromoBanners />

      <JobsSection />

      <TopEmployers />

      <TrendingSkills />

      <HotPositions />
      <MarketStats />
    </div>
  )
}
