'use client'

import { Search, MapPin } from 'lucide-react'

interface JobSearchProps {
  keyword?: string
  onKeywordChange?: (val: string) => void
  location?: string
  onLocationChange?: (val: string) => void
  onSearch?: () => void
}

export default function JobSearch({}: JobSearchProps) {
  const popularKeywords = ['React', 'Golang', 'Node.js', 'Remote', 'Senior']

  return (
    <div className="w-full max-w-5xl mx-auto px-4">
      <form
        onSubmit={(e) => e.preventDefault()}
        className="w-full bg-white/95 backdrop-blur-md rounded-2xl border border-slate-200/80 shadow-[0_20px_50px_rgba(0,0,0,0.08)] flex flex-col md:flex-row overflow-hidden transition-all duration-300 hover:shadow-[0_20px_50px_rgba(0,0,0,0.12)] hover:border-slate-300 p-1.5 gap-1 md:gap-0"
      >
        {/* Keyword Search */}
        <div className="flex-1 flex items-center px-4 py-3 rounded-xl hover:bg-slate-50/50 transition-colors group relative">
          <Search className="w-5 h-5 text-slate-400 mr-3 group-hover:text-blue-500 transition-colors shrink-0" />
          <input
            type="text"
            placeholder="Chức danh, từ khóa hoặc tên công ty..."
            className="w-full outline-none bg-transparent text-slate-800 font-bold text-sm placeholder:text-slate-400 placeholder:font-medium"
          />
        </div>

        {/* Divider */}
        <div className="hidden md:block w-px bg-slate-200/80 self-stretch my-2" />

        {/* Location Search */}
        <div className="md:w-72 flex items-center px-4 py-3 rounded-xl hover:bg-slate-50/50 transition-colors group relative">
          <MapPin className="w-5 h-5 text-slate-400 mr-3 group-hover:text-blue-500 transition-colors shrink-0" />
          <input
            type="text"
            placeholder="Địa điểm hoặc Remote..."
            className="w-full outline-none bg-transparent text-slate-800 font-bold text-sm placeholder:text-slate-400 placeholder:font-medium"
          />
        </div>

        {/* Search Button */}
        <button
          type="submit"
          className="bg-blue-600 hover:bg-blue-700 active:scale-98 text-white font-black px-8 py-3.5 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-md hover:shadow-lg hover:shadow-blue-600/10 cursor-pointer text-sm tracking-wide uppercase shrink-0"
        >
          <Search className="w-4 h-4" />
          <span>Tìm kiếm</span>
        </button>
      </form>

      {/* Popular Suggestions */}
      <div className="flex flex-wrap items-center gap-2 mt-4 text-xs font-bold text-white/80">
        <span className="text-white/60 font-medium select-none">Tìm kiếm phổ biến:</span>
        {popularKeywords.map((tag) => (
          <button
            key={tag}
            type="button"
            className="px-3 py-1 bg-white/10 hover:bg-white/20 active:bg-white/30 border border-white/5 rounded-full transition-all duration-200 cursor-pointer select-none text-white text-[11px]"
          >
            {tag}
          </button>
        ))}
      </div>
    </div>
  )
}