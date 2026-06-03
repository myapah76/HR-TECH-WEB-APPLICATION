/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ChevronLeft, ChevronRight, MapPin, Search, Sparkles } from 'lucide-react';
import React, { useEffect, useState } from 'react';

interface HeroSectionProps {
  onSearch: (keyword: string, location: string) => void;
  trendingCount: number;
  }

export default function HeroSection({ onSearch, trendingCount}: HeroSectionProps) {
  const [keyword, setKeyword] = useState('');
  const [location, setLocation] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);

  const slides = [
    {
      image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1600&q=80',
      title: 'Nền tảng tuyển dụng chuyên biệt dành cho kỹ sư phần mềm cao cấp và quản lý công nghệ tại Việt Nam'
    },
    {
      image: 'https://images.unsplash.com/photo-1542744094-3a31f103e35f?auto=format&fit=crop&w=1600&q=80',
      title: 'Kết nối cơ hội nghề nghiệp bứt phá tại các doanh nghiệp hàng đầu'
    },
    {
      image: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1600&q=80',
      title: 'Ứng tuyển thông minh cùng giải pháp khớp nối CV tự động tức thì'
    }
  ];

  // Auto scroll slides
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [slides.length]);

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % slides.length);
  };

  const trendingTags = ['React Native', 'Golang', 'System Design', 'DevOps'];
  const locations = [
    { value: '', label: 'Tất cả địa điểm' },
    { value: 'Hồ Chí Minh', label: 'Hồ Chí Minh' },
    { value: 'Hà Nội', label: 'Hà Nội' },
    { value: 'Đà Nẵng', label: 'Đà Nẵng' },
    { value: 'Vĩnh Phúc', label: 'Vĩnh Phúc / Phú Thọ' }
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(keyword, location);
  };

  const handleTagClick = (tag: string) => {
    setKeyword(tag);
    onSearch(tag, location);
  };

  return (
    <section className="relative overflow-hidden py-20 sm:py-28 text-white min-h-[540px] sm:min-h-[600px] flex items-center justify-center" id="hero-section">
      
      {/* Dynamic Sliding Background Images */}
      <div className="absolute inset-0 z-0 overflow-hidden" id="hero-slider-bg">
        <div 
          className="absolute inset-0 flex transition-transform duration-1000 ease-in-out"
          style={{ transform: `translateX(-${currentIndex * 100}%)` }}
        >
          {slides.map((slide, idx) => (
            <div 
              key={idx}
              className="w-full h-full shrink-0 bg-cover bg-center transition-all duration-1000"
              style={{ backgroundImage: `url(${slide.image})` }}
            />
          ))}
        </div>
        
      {/* Dimming and vignette gradient overlay for high visibility & premium styling */}
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/90 via-slate-900/75 to-slate-950/90" id="hero-overlay"></div>
      </div>

      {/* Manual Left/Right Controls */}
      <button
        type="button"
        onClick={handlePrev}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-20 p-2 sm:p-3 rounded-2xl bg-white/5 hover:bg-blue-600/80 border border-white/10 text-white backdrop-blur-md transition-all cursor-pointer group shrink-0 shadow-lg hover:shadow-blue-500/10 hover:border-blue-400/50"
        id="btn-hero-prev"
        aria-label="Previous slide"
      >
        <ChevronLeft className="h-5 w-5 group-hover:-translate-x-0.5 transition-transform" />
      </button>

      <button
        type="button"
        onClick={handleNext}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-20 p-2 sm:p-3 rounded-2xl bg-white/5 hover:bg-blue-600/80 border border-white/10 text-white backdrop-blur-md transition-all cursor-pointer group shrink-0 shadow-lg hover:shadow-blue-500/10 hover:border-blue-400/50"
        id="btn-hero-next"
        aria-label="Next slide"
      >
        <ChevronRight className="h-5 w-5 group-hover:translate-x-0.5 transition-transform" />
      </button>

      {/* Slide Pagination Dots */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2" id="hero-dots">
        {slides.map((_, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => setCurrentIndex(idx)}
            className={`h-2 rounded-full transition-all duration-500 cursor-pointer ${currentIndex === idx ? 'w-8 bg-blue-500 shadow-md shadow-blue-500/50' : 'w-2 bg-white/30 hover:bg-white/60'}`}
            id={`hero-dot-${idx}`}
          />
        ))}
      </div>

      <div className="mx-auto max-w-5xl px-4 text-center sm:px-6 lg:px-8 relative z-10">
        
        {/* Main Header Tagline */}
        <div className="inline-flex items-center gap-2 rounded-full bg-white/5 px-4 py-2 text-xs font-bold text-white mb-8 border border-white/10 backdrop-blur-xl shadow-inner shadow-white/5" id="badge-stat">
          <Sparkles className="h-4 w-4 text-amber-400 animate-pulse" />
          <span className="tracking-wide text-slate-100">
            <>Đón lấy thành công với <span className="text-blue-400 font-extrabold">{trendingCount.toLocaleString()}</span> cơ hội nghề nghiệp</>
          </span>
        </div>

        {/* Dynamic Slide Title */}
        <h1 className="text-2.5xl font-extrabold tracking-tight text-white sm:text-4xl max-w-4xl mx-auto leading-snug drop-shadow-lg min-h-[96px] sm:min-h-[120px] font-sans line-clamp-3 overflow-hidden" id="hero-title">
          {slides[currentIndex].title}
        </h1>

        {/* Form Container */}
        <form 
          onSubmit={handleSubmit} 
          className="mt-10 mx-auto max-w-4xl bg-white/95 backdrop-blur-md p-2 rounded-2.5xl shadow-2xl border border-slate-200/80 flex flex-col sm:flex-row gap-2 items-stretch text-gray-800 transition-all focus-within:border-blue-400/60 focus-within:ring-4 focus-within:ring-blue-500/10"
          id="search-form"
        >
          {/* Keyword Search Input */}
          <div className="relative flex-1 flex items-center" id="search-input-wrapper">
            <Search className="absolute left-4 h-5 w-5 text-slate-400" />
            <input
              type="text"
              placeholder={'Vị trí, Kỹ năng, Công ty...'}
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              className="w-full pl-12 pr-4 py-3.5 sm:py-4 text-sm sm:text-base text-slate-800 placeholder-slate-400 bg-transparent rounded-2xl focus:outline-none font-semibold"
              id="input-keyword"
            />
          </div>

          <div className="h-px sm:h-8 w-full sm:w-px bg-slate-200 self-center"></div>

          {/* Location Dropdown selector */}
          <div className="relative w-full sm:w-[230px] flex items-center" id="location-select-wrapper">
            <MapPin className="absolute left-4 h-5 w-5 text-slate-400" />
            <select
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full pl-12 pr-10 py-3.5 sm:py-4 text-sm sm:text-base text-slate-750 bg-transparent rounded-2xl focus:outline-none appearance-none font-semibold cursor-pointer"
              id="input-location"
            >
              {locations.map((loc) => (
                <option key={loc.value} value={loc.value} className="text-slate-800 font-semibold bg-white">{loc.label}</option>
              ))}
            </select>
            <div className="absolute right-4 pointer-events-none text-slate-400">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>

          {/* Submit Search Button */}
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white font-black text-sm px-10 py-4 sm:py-4.5 rounded-2xl transition-all duration-300 shadow-lg shadow-blue-600/20 hover:shadow-xl hover:shadow-blue-600/35 hover:scale-[1.03] hover:-translate-y-0.5 active:scale-95 flex items-center justify-center gap-2 whitespace-nowrap cursor-pointer uppercase tracking-wider"
            id="btn-submit-search"
          >
            <span>{'Tìm kiếm ngay'}</span>
          </button>
        </form>

        {/* Trending terms list */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3 text-sm" id="trending-tags-container">
          <span className="text-slate-300 font-bold tracking-wide">{'Xu hướng:'}</span>
          {trendingTags.map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => handleTagClick(tag)}
              className="bg-white/5 hover:bg-blue-600/70 text-slate-100 hover:text-white font-bold px-4.5 py-1.5 rounded-full border border-white/10 hover:border-blue-400/50 transition-all backdrop-blur-md cursor-pointer hover:scale-105 active:scale-95 shadow-sm"
              id={`trending-${tag.toLowerCase().replace(/\s+/g, '-')}`}
            >
              {tag}
            </button>
          ))}
        </div>

      </div>
    </section>
  );
}

