"use client";
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { INITIAL_JOBS } from '@/src/data';

import HeroSection from '@/src/components/HeroSection';
import TopEmployers from '@/src/components/TopEmployers'
import PromoBanners from '@/src/components/PromoBanners';
import JobsSection from '@/src/components/JobsSection';
import Newsletter from '@/src/components/Newsletter';
import JobCategories from '@/src/components/JobCategories';
import ProfileCircles from '@/src/components/ProfileCircles';
import KeyIndustries from '@/src/components/KeyIndustries';
import TalentNetwork from '@/src/components/TalentNetwork';
import CareerHandbooks from '@/src/components/CareerHandbooks';
import RecruiterCta from '@/src/components/RecruiterCta';
import { Job } from '@/src/types';

export default function HomePage() {
  const router = useRouter();
  const [searchKeyword, setSearchKeyword] = useState('');
  const [searchLocation, setSearchLocation] = useState('');

  const handleSearch = (keyword: string, location: string) => {
    setSearchKeyword(keyword);
    setSearchLocation(location);
    const jSection = document.getElementById('all-jobs-feed');
    if (jSection) {
      jSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleSelectIndustry = (categoryName: string) => {
    setSearchKeyword(categoryName);
    const jSection = document.getElementById('all-jobs-feed');
    if (jSection) {
      jSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="space-y-1">
      <HeroSection onSearch={handleSearch} trendingCount={INITIAL_JOBS.length + 25445} />
      <TopEmployers />
      <PromoBanners />
      <JobsSection 
        jobs={INITIAL_JOBS}
        searchKeyword={searchKeyword}
        searchLocation={searchLocation}
        onJobSelect={(job: Job) => router.push(`/jobs/${job.id}`)}
        onViewAllLatestClick={() => router.push('/jobs')}
      />
      <Newsletter />
      <JobCategories />
      <ProfileCircles />
      <KeyIndustries onSelectCategory={handleSelectIndustry} />
      <TalentNetwork />
      <CareerHandbooks onArticleSelect={() => router.push('/handbook')} />
      <RecruiterCta onUploadCvClick={() => router.push('/candidate/ai-advisor')} />
    </div>
  );
}
