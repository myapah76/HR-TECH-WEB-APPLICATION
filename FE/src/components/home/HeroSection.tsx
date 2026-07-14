'use client'

import { ChevronLeft, ChevronRight, Sparkles } from 'lucide-react'
import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function HeroSection() {
  const router = useRouter()
  const [currentIndex, setCurrentIndex] = useState(0)

  const slides = [
    {
      image:
        'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1600&q=80',
      title:
        'Nền tảng tuyển dụng chuyên biệt dành cho kỹ sư phần mềm cao cấp và quản lý công nghệ tại Việt Nam',
    },
    {
      image:
        'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=1600&q=80',
      title: 'Kết nối cơ hội nghề nghiệp bứt phá tại các doanh nghiệp hàng đầu',
    },
    {
      image:
        'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1600&q=80',
      title: 'Ứng tuyển thông minh cùng giải pháp khớp nối CV tự động tức thì',
    },
  ]

  // Auto scroll slides
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % slides.length)
    }, 6000)
    return () => clearInterval(timer)
  }, [slides.length])

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + slides.length) % slides.length)
  }

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % slides.length)
  }

  const trendingTags = ['React Native', 'Golang', 'System Design', 'DevOps']

  const handleTagClick = (tag: string) => {
    router.push(`/jobs?skills=${encodeURIComponent(tag)}`)
  }

  return (
    <section
      className="relative overflow-hidden py-20 sm:py-28 text-white min-h-125 sm:min-h-140 flex items-center justify-center"
      id="hero-section"
    >
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
        <div
          className="absolute inset-0 bg-linear-to-b from-slate-950/90 via-slate-900/75 to-slate-950/90"
          id="hero-overlay"
        ></div>
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
      <div
        className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2"
        id="hero-dots"
      >
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
        <div
          className="inline-flex items-center gap-2 rounded-full bg-white/5 px-4 py-2 text-xs font-bold text-white mb-8 border border-white/10 backdrop-blur-xl shadow-inner shadow-white/5"
          id="badge-stat"
        >
          <Sparkles className="h-4 w-4 text-amber-400 animate-pulse" />
          <span className="tracking-wide text-slate-100">
            <>Đón lấy thành công với hằng nghìn cơ hội nghề nghiệp</>
          </span>
        </div>

        {/* Dynamic Slide Title */}
        <h1
          className="text-2.5xl font-extrabold tracking-tight text-white sm:text-4xl max-w-4xl mx-auto leading-snug drop-shadow-lg min-h-24 sm:min-h-30 font-sans line-clamp-3 overflow-hidden mb-8"
          id="hero-title"
        >
          {slides[currentIndex].title}
        </h1>

        {/* Trending terms list */}
        <div
          className="mt-8 flex flex-wrap items-center justify-center gap-3 text-sm"
          id="trending-tags-container"
        >
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
  )
}
