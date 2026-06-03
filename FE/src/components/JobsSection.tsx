"use client";
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ArrowRight, ChevronLeft, ChevronRight, DollarSign, MapPin } from 'lucide-react';
import { useState } from 'react';
import { ALL_NUMERIC_PAGES_JOBS } from '@/src/data';
import { Job } from '@/src/types';

interface JobsSectionProps {
  jobs: Job[];
  searchKeyword: string;
  searchLocation: string;
  onJobSelect: (job: Job) => void;
  onViewAllLatestClick: () => void;
  }

export default function JobsSection({ jobs, searchKeyword, searchLocation, onJobSelect, onViewAllLatestClick }: JobsSectionProps) {
  const [activeTab, setActiveTab] = useState<'featured' | 'vip' | 'headhunter'>('featured');
  const [currentPage, setCurrentPage] = useState<number>(8); // Default active page is 8 as shown in screenshot

  // Filter jobs based on active tab AND search keywords
  const getFilteredJobs = () => {
    let result = [...jobs];

    // Search query filtering
    if (searchKeyword.trim() !== '') {
      const kw = searchKeyword.toLowerCase();
      result = result.filter(
        (j) =>
          j.title.toLowerCase().includes(kw) ||
          j.company.toLowerCase().includes(kw) ||
          j.skills.some((sk) => sk.toLowerCase().includes(kw))
      );
    }

    if (searchLocation.trim() !== '') {
      const loc = searchLocation.toLowerCase();
      result = result.filter((j) => j.location.toLowerCase().includes(loc));
    }

    // Checking if we are on a numeric page change (4, 5, 6, etc.) instead of the default 8
    if (currentPage !== 8 && ALL_NUMERIC_PAGES_JOBS[currentPage]) {
      return ALL_NUMERIC_PAGES_JOBS[currentPage];
    }

    // Filter by Tab Type (only if the user is not actively searching everything, which should override tabs matching criteria)
    if (searchKeyword.trim() === '' && searchLocation.trim() === '') {
      result = result.filter((j) => j.type === activeTab);
    }

    return result;
  };

  const filteredJobs = getFilteredJobs();

  // Pagination click handler
  const handlePageSelect = (page: number) => {
    setCurrentPage(page);
    // Scroll smoothly to start of jobs section
    const sec = document.getElementById('all-jobs-feed');
    if (sec) {
      sec.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const pageNumbers = [4, 5, 6, 7, 8, 9, 10];

  return (
    <section className="bg-slate-50/30 py-16 scroll-mt-20" id="all-jobs-feed">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Navigation Tabs */}
        <div className="border-b border-slate-200/80 mb-8" id="jobs-tabs-container">
          <div className="flex space-x-8 overflow-x-auto scrollbar-hide" id="jobs-tabs-row">
            <button
              onClick={() => { setActiveTab('featured'); setCurrentPage(8); }}
              className={`pb-4 text-sm font-extrabold whitespace-nowrap border-b-2 transition-all cursor-pointer ${
                activeTab === 'featured' && currentPage === 8
                  ? 'border-blue-600 text-blue-650' 
                  : 'border-transparent text-slate-500 hover:text-slate-900 hover:border-slate-300'
              }`}
              id="tab-featured"
            >
              {'Việc Làm Nổi Bật'}
            </button>
            <button
              onClick={() => { setActiveTab('vip'); setCurrentPage(8); }}
              className={`pb-4 text-sm font-extrabold whitespace-nowrap border-b-2 transition-all cursor-pointer ${
                activeTab === 'vip' && currentPage === 8
                  ? 'border-blue-600 text-blue-650' 
                  : 'border-transparent text-slate-500 hover:text-slate-900 hover:border-slate-300'
              }`}
              id="tab-vip"
            >
              {'Việc Làm VIP ($1000+)'}
            </button>
            <button
              onClick={() => { setActiveTab('headhunter'); setCurrentPage(8); }}
              className={`pb-4 text-sm font-extrabold whitespace-nowrap border-b-2 transition-all cursor-pointer ${
                activeTab === 'headhunter' && currentPage === 8
                  ? 'border-blue-600 text-blue-650' 
                  : 'border-transparent text-slate-500 hover:text-slate-900 hover:border-slate-300'
              }`}
              id="tab-headhunter"
            >
              {'Việc Làm Từ Top Headhunter'}
            </button>
          </div>
        </div>

        {/* Jobs Feed Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5.5" id="jobs-cards-grid">
          {filteredJobs.length > 0 ? (
            filteredJobs.map((job: Job) => (
              <div
                key={job.id}
                onClick={() => onJobSelect(job)}
                className="group relative bg-white/80 backdrop-blur-xs border border-slate-200/80 hover:border-blue-400 hover:bg-white p-5 rounded-2xl shadow-xs hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 cursor-pointer flex gap-4 items-start active:scale-99"
                id={`job-feed-card-${job.id}`}
              >
                {/* Logo with Dynamic Initial background color */}
                <div className={`h-13 w-13 rounded-2xl text-white font-extrabold text-base flex items-center justify-center shrink-0 shadow-inner transition-transform group-hover:scale-105 ${job.logoBg}`} id={`job-logo-${job.id}`}>
                  {job.logo}
                </div>

                {/* Info Container */}
                <div className="flex-1 min-w-0" id={`job-details-wrapper-${job.id}`}>
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-sm sm:text-base font-extrabold text-slate-900 group-hover:text-blue-650 transition-colors tracking-tight line-clamp-1" id={`job-title-${job.id}`}>
                      {job.title}
                    </h3>
                    
                    {/* Unique badge tags match screenshot styles */}
                    <div className="flex gap-1 shrink-0">
                      {job.tags?.map((tag: string, idx: number) => (
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
                          {tag === 'MỚI' ? ('MỚI') : tag}
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
          
          {/* Real paginator control */}
          <div className="flex items-center gap-1.5" id="paginator-controls">
            <button 
              onClick={() => handlePageSelect(Math.max(4, currentPage - 1))}
              disabled={currentPage === 4}
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
                    : 'border-slate-200 text-slate-600 bg-white hover:bg-slate-50'
                }`}
                id={`paginator-btn-${page}`}
              >
                {page}
              </button>
            ))}

            <span className="text-slate-400 px-1 font-bold">...</span>

            <button 
              onClick={() => handlePageSelect(Math.min(10, currentPage + 1))}
              disabled={currentPage === 10}
              className="p-2 border border-slate-200 rounded-xl hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-2xs hover:scale-102 cursor-pointer bg-white"
              id="paginator-next"
            >
              <ChevronRight className="h-4 w-4 text-slate-600" />
            </button>
          </div>

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
