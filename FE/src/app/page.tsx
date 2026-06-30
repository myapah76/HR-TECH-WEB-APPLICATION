'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

import HeroSection from '@/src/components/home/HeroSection'
import TopEmployers from '@/src/components/home/TopEmployers'
import PromoBanners from '@/src/components/home/PromoBanners'
import JobsSection from '@/src/components/home/JobsSection'
import Newsletter from '@/src/components/home/Newsletter'
import ProfileCircles from '@/src/components/home/ProfileCircles'
import TalentNetwork from '@/src/components/home/TalentNetwork'
import CareerHandbooks from '@/src/components/home/CareerHandbooks'
import RecruiterCta from '@/src/components/home/RecruiterCta'
import { Job } from '@/src/types'

export default function HomePage() {
  const router = useRouter()
  const [searchKeyword, setSearchKeyword] = useState('')
  const [searchLocation, setSearchLocation] = useState('')

  const handleSearch = (keyword: string, location: string) => {
    setSearchKeyword(keyword)
    setSearchLocation(location)
    const jSection = document.getElementById('all-jobs-feed')
    if (jSection) {
      jSection.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  return (
    <div className="space-y-1">
      <HeroSection onSearch={handleSearch} trendingCount={25465} />
      <TopEmployers />
      <PromoBanners />
      <JobsSection
        searchKeyword={searchKeyword}
        searchLocation={searchLocation}
        onJobSelect={(job: Job) => router.push(`/jobs/${job.id}`)}
        onViewAllLatestClick={() => router.push('/jobs')}
      />
      <Newsletter />
      <ProfileCircles />
      <TalentNetwork />
      <CareerHandbooks onArticleSelect={() => router.push('/handbook')} />
      <RecruiterCta onUploadCvClick={() => router.push('/candidate/ai-advisor')} />
    </div>
  )
}


