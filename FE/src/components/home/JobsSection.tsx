"use client";

import { ArrowRight, ChevronLeft, ChevronRight, DollarSign, MapPin, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { useSearchJobs } from '@/src/hooks/job';
import { Job } from '@/src/types';
import { formatSalary } from '@/src/utils/salary';

interface JobsSectionProps {
  searchKeyword: string;
  searchLocation: string;
  onJobSelect: (job: Job) => void;
  onViewAllLatestClick: () => void;
}

const mapBackendJobToUiJob = (bj: any): Job => {
  const colors = [
    'bg-blue-650',
    'bg-emerald-600',
    'bg-rose-600',
    'bg-amber-600',
    'bg-purple-650',
    'bg-indigo-650',
  ];
  const colorIndex = bj.companyName ? bj.companyName.charCodeAt(0) % colors.length : 0;
  const logoBg = colors[colorIndex];

  const companyInitials = bj.companyName
    ? bj.companyName
        .split(' ')
        .filter((w: string) => w.length > 0)
        .slice(0, 2)
        .map((w: string) => w[0].toUpperCase())
        .join('')
    : '??';

  const salaryText = formatSalary(bj.salaryMin, bj.salaryMax);
  const skillsArray = bj.skills ? bj.skills.map((sk: any) => sk.skillName) : [];

  const tags: string[] = [];
  if (bj.jobType) {
    const typeLabel = bj.jobType === 'FULL_TIME' ? 'Fulltime' : bj.jobType === 'PART_TIME' ? 'Parttime' : bj.jobType;
    tags.push(typeLabel);
  }
  const createdDate = new Date(bj.createdAt);
  const today = new Date();
  const diffDays = Math.ceil(Math.abs(today.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24));
  if (diffDays <= 7) {
    tags.push('MỚI');
  }

  return {
    id: bj.id,
    title: bj.title,
    company: bj.companyName,
    logo: bj.companyLogoUrl || companyInitials,
    logoBg,
    salary: salaryText,
    location: bj.location,
    tags,
    type: 'featured',
    description: bj.description || '',
    requirements: bj.requirements ? bj.requirements.split('\n').filter((l: string) => l.trim().length > 0) : [],
    benefits: [],
    postedAt: bj.createdAt ? `${diffDays} ngày trước` : 'Mới cập nhật',
    skills: skillsArray,
  };
};

const JobCardSkeleton = () => (
  <div className="bg-white border border-slate-200/80 p-5 rounded-2xl flex gap-4 items-start animate-pulse h-40">
    <div className="h-13 w-13 rounded-2xl bg-slate-100 shrink-0" />
    <div className="flex-1 space-y-3">
      <div className="h-4 bg-slate-100 rounded-md w-3/4" />
      <div className="h-3 bg-slate-100 rounded-md w-1/2" />
      <div className="h-6 bg-slate-105 rounded-lg w-1/3 mt-4" />
      <div className="flex gap-2 mt-3">
        <div className="h-5 bg-slate-100 rounded-md w-16" />
        <div className="h-5 bg-slate-100 rounded-md w-16" />
      </div>
    </div>
  </div>
);

export default function JobsSection({ searchKeyword, searchLocation, onJobSelect, onViewAllLatestClick }: JobsSectionProps) {
  const [activeTab, setActiveTab] = useState<'featured' | 'vip'>('featured');
  const [currentPage, setCurrentPage] = useState<number>(0); // 0-indexed for backend API

  // Build API search criteria based on current inputs and active tab
  const params: any = {
    page: currentPage,
    size: 6, // 6 jobs per page
    keyword: searchKeyword.trim() ? searchKeyword.trim() : undefined,
    location: searchLocation.trim() ? searchLocation.trim() : undefined,
  };

  // If activeTab is 'vip', we query jobs with salary >= 20,000,000 VND
  if (activeTab === 'vip') {
    params.salaryMin = 20000000;
  }

  const { data, isLoading } = useSearchJobs(params);
  const backendJobs = data?.content || [];
  const totalPages = data?.totalPages || 1;

  // Convert backend jobs to UI format
  const mappedJobs = backendJobs.map(mapBackendJobToUiJob);

  // Tab switching handler
  const handleTabChange = (tab: 'featured' | 'vip') => {
    setActiveTab(tab);
    setCurrentPage(0); // Reset page on tab change
  };

  // Pagination page click
  const handlePageSelect = (page: number) => {
    setCurrentPage(page);
    const sec = document.getElementById('all-jobs-feed');
    if (sec) {
      sec.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const pageNumbers = Array.from({ length: totalPages }, (_, i) => i);

  return (
    <section className="bg-slate-50/30 py-16 scroll-mt-20" id="all-jobs-feed">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Navigation Tabs */}
        <div className="border-b border-slate-200/80 mb-8" id="jobs-tabs-container">
          <div className="flex space-x-8 overflow-x-auto scrollbar-hide" id="jobs-tabs-row">
            <button
              onClick={() => handleTabChange('featured')}
              className={`pb-4 text-sm font-extrabold whitespace-nowrap border-b-2 transition-all cursor-pointer ${
                activeTab === 'featured'
                  ? 'border-blue-600 text-blue-650' 
                  : 'border-transparent text-slate-500 hover:text-slate-900 hover:border-slate-300'
              }`}
              id="tab-featured"
            >
              {'Việc Làm Nổi Bật'}
            </button>
            <button
              onClick={() => handleTabChange('vip')}
              className={`pb-4 text-sm font-extrabold whitespace-nowrap border-b-2 transition-all cursor-pointer ${
                activeTab === 'vip'
                  ? 'border-blue-600 text-blue-650' 
                  : 'border-transparent text-slate-500 hover:text-slate-900 hover:border-slate-300'
              }`}
              id="tab-vip"
            >
              {'Việc Làm VIP (trên 20tr)'}
            </button>
          </div>
        </div>

        {/* Jobs Feed Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5.5" id="jobs-cards-grid">
          {isLoading ? (
            Array.from({ length: 6 }).map((_, idx) => (
              <JobCardSkeleton key={idx} />
            ))
          ) : mappedJobs.length > 0 ? (
            mappedJobs.map((job: Job) => (
              <div
                key={job.id}
                onClick={() => onJobSelect(job)}
                className="group relative bg-white/80 backdrop-blur-xs border border-slate-200/80 hover:border-blue-400 hover:bg-white p-5 rounded-2xl shadow-xs hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 cursor-pointer flex gap-4 items-start active:scale-99"
                id={`job-feed-card-${job.id}`}
              >
                {/* Logo with Initials or Image Logo */}
                <div className="h-13 w-13 rounded-2xl overflow-hidden shrink-0 shadow-inner transition-transform group-hover:scale-105 border border-slate-100 flex items-center justify-center bg-white" id={`job-logo-${job.id}`}>
                  {job.logo && (job.logo.startsWith('http') || job.logo.startsWith('/')) ? (
                    <img
                      src={job.logo}
                      alt={job.company}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-contain p-1"
                    />
                  ) : (
                    <div className={`w-full h-full text-white font-extrabold text-base flex items-center justify-center ${job.logoBg}`}>
                      {job.logo}
                    </div>
                  )}
                </div>

                {/* Info Container */}
                <div className="flex-1 min-w-0" id={`job-details-wrapper-${job.id}`}>
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-sm sm:text-base font-extrabold text-slate-900 group-hover:text-blue-650 transition-colors tracking-tight line-clamp-1" id={`job-title-${job.id}`}>
                      {job.title}
                    </h3>
                    
                    {/* Unique badge tags */}
                    <div className="flex gap-1 shrink-0">
                      {job.tags?.map((tag: string) => (
                        <span 
                          key={tag} 
                          className={`text-[9px] font-extrabold px-2.5 py-0.75 rounded-md uppercase tracking-wider ${
                            tag === 'MỚI' 
                              ? 'bg-red-50 text-red-600 border border-red-200/50' 
                              : tag === 'URGENT'
                              ? 'bg-amber-50 text-amber-700 border border-amber-200/50'
                              : 'bg-indigo-50 text-indigo-750 border border-indigo-200/50'
                          }`}
                          id={`job-tag-${tag}-${job.id}`}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  <p className="text-xs font-semibold text-slate-500 mt-1 line-clamp-1" id={`job-company-${job.id}`}>
                    {job.company}
                  </p>

                  <div className="mt-4 flex flex-wrap items-center gap-y-2 gap-x-4 text-xs font-semibold text-slate-500" id={`job-meta-row-${job.id}`}>
                    <span className="flex items-center gap-1.5 text-emerald-700 bg-emerald-50/80 border border-emerald-100/50 px-2.5 py-1 rounded-lg font-bold shadow-2xs" id={`job-salary-${job.id}`}>
                      <DollarSign className="h-3.5 w-3.5 shrink-0" />
                      <span>{job.salary}</span>
                    </span>
                    <span className="flex items-center gap-1" id={`job-location-${job.id}`}>
                      <MapPin className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                      <span>{job.location}</span>
                    </span>
                  </div>

                  {/* Skills preview bar */}
                  <div className="mt-3.5 flex flex-wrap gap-1.5" id={`job-skills-list-${job.id}`}>
                    {job.skills && job.skills.slice(0, 3).map((sk: string) => (
                      <span key={sk} className="bg-slate-100 hover:bg-slate-200 text-slate-650 text-[10px] font-bold px-2.5 py-1 rounded-md transition-colors" id={`job-skill-${sk}-${job.id}`}>
                        {sk}
                      </span>
                    ))}
                  </div>

                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full bg-white border border-slate-200 rounded-2xl p-12 text-center text-slate-500 font-semibold shadow-xs" id="jobs-empty-state">
              {'Không tìm thấy việc làm phù hợp với tiêu chí tìm kiếm của bạn. Hãy thử đổi từ khóa khác!'}
            </div>
          )}
        </div>

        {/* Dynamic Pagination & CTA row */}
        <div className="mt-12 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-250/20 pt-8" id="pagination-panel">
          {totalPages > 1 ? (
            /* Real paginator control */
            <div className="flex items-center gap-1.5" id="paginator-controls">
              <button 
                onClick={() => handlePageSelect(Math.max(0, currentPage - 1))}
                disabled={currentPage === 0}
                className="p-2 border border-slate-200 rounded-xl hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-2xs hover:scale-102 cursor-pointer bg-white"
                id="paginator-prev"
              >
                <ChevronLeft className="h-4 w-4 text-slate-600" />
              </button>
              
              {pageNumbers.map((page) => (
                <button
                  key={page}
                  onClick={() => handlePageSelect(page)}
                  className={`h-9 w-9 text-xs font-bold rounded-xl border transition-all cursor-pointer hover:scale-102 ${
                    currentPage === page 
                      ? 'bg-amber-500 border-amber-500 text-white shadow-md shadow-amber-500/20' 
                      : 'border-slate-200 text-slate-650 bg-white hover:bg-slate-50'
                  }`}
                  id={`paginator-btn-${page}`}
                >
                  {page + 1}
                </button>
              ))}

              <button 
                onClick={() => handlePageSelect(Math.min(totalPages - 1, currentPage + 1))}
                disabled={currentPage === totalPages - 1}
                className="p-2 border border-slate-200 rounded-xl hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-2xs hover:scale-102 cursor-pointer bg-white"
                id="paginator-next"
              >
                <ChevronRight className="h-4 w-4 text-slate-600" />
              </button>
            </div>
          ) : (
            <div />
          )}

          <button
            onClick={onViewAllLatestClick}
            className="flex items-center gap-1 text-sm font-extrabold text-blue-600 hover:text-blue-800 transition-colors group cursor-pointer hover:scale-102"
            id="btn-latest-redirect"
          >
            <span>{'Xem việc làm mới cập nhật'}</span>
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </button>
        </div>
      </div>
    </section>
  );
}
