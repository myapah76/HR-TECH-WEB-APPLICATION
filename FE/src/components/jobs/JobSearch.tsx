'use client'

import { Search, MapPin, X } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'

interface JobSearchProps {
  keyword?: string
  setKeyword?: (val: string) => void
  location?: string
  onLocationChange?: (val: string) => void
  onSearch?: () => void
}

export default function JobSearch({
  keyword = '',
  setKeyword,
  location = '',
  onLocationChange,
  onSearch,
}: JobSearchProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const popularKeywords = ['React', 'Golang', 'Node.js', 'Remote', 'Senior']

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Cập nhật URL params và giữ lại các param hiện có (như size)
    const params = new URLSearchParams(searchParams.toString())
    if (keyword.trim()) params.set('keyword', keyword.trim())
    else params.delete('keyword')

    if (location.trim()) params.set('location', location.trim())
    else params.delete('location')

    // Luôn reset về trang 1 khi search từ khóa mới
    params.set('page', '1')

    const query = params.toString()
    router.push(`/jobs${query ? `?${query}` : ''}`)
    onSearch?.()
  }

  const handleTagClick = (tag: string) => {
    setKeyword?.(tag)
    const params = new URLSearchParams(searchParams.toString())
    params.set('keyword', tag)
    if (location.trim()) params.set('location', location.trim())
    else params.delete('location')

    params.set('page', '1')

    router.push(`/jobs?${params.toString()}`)
    onSearch?.()
  }

  const handleClearKeyword = () => {
    setKeyword?.('')
    const params = new URLSearchParams(searchParams.toString())
    params.delete('keyword')
    params.set('page', '1')
    const query = params.toString()
    router.push(`/jobs${query ? `?${query}` : ''}`)
    onSearch?.()
  }

  const handleClearLocation = () => {
    onLocationChange?.('')
    const params = new URLSearchParams(searchParams.toString())
    params.delete('location')
    params.set('page', '1')
    const query = params.toString()
    router.push(`/jobs${query ? `?${query}` : ''}`)
    onSearch?.()
  }

  return (
    <div className="w-full max-w-5xl mx-auto px-4">
      <form
        onSubmit={handleSubmit}
        className="w-full bg-white rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-[0_20px_50px_rgba(0,0,0,0.08)] flex flex-col md:flex-row overflow-hidden transition-all duration-300 hover:shadow-[0_20px_50px_rgba(0,0,0,0.12)] hover:border-slate-300 dark:hover:border-slate-600 p-1.5 gap-1 md:gap-0"
      >
        {/* Keyword Search */}
        <div className="flex-1 flex items-center px-4 py-3 rounded-xl hover:bg-slate-50/50 dark:hover:bg-slate-700/50 transition-colors group relative">
          <Search className="w-5 h-5 text-slate-400 mr-3 group-hover:text-indigo-500 transition-colors shrink-0" />
          <input
            type="text"
            value={keyword}
            onChange={(e) => setKeyword?.(e.target.value)}
            placeholder="Chức danh, từ khóa hoặc tên công ty..."
            className="w-full outline-none bg-transparent text-slate-800 dark:text-slate-100 font-bold text-sm placeholder:text-slate-400 placeholder:font-medium"
          />
          {keyword && (
            <button
              type="button"
              onClick={handleClearKeyword}
              className="ml-2 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Divider */}
        <div className="hidden md:block w-px bg-slate-200/80 dark:bg-slate-700/80 self-stretch my-2" />

        {/* Location Search */}
        <div className="md:w-72 flex items-center px-4 py-3 rounded-xl hover:bg-slate-50/50 dark:hover:bg-slate-700/50 transition-colors group relative">
          <MapPin className="w-5 h-5 text-slate-400 mr-3 group-hover:text-indigo-500 transition-colors shrink-0" />
          <input
            type="text"
            value={location}
            onChange={(e) => onLocationChange?.(e.target.value)}
            placeholder="Địa điểm hoặc Remote..."
            className="w-full outline-none bg-transparent text-slate-800 dark:text-slate-100 font-bold text-sm placeholder:text-slate-400 placeholder:font-medium"
          />
          {location && (
            <button
              type="button"
              onClick={handleClearLocation}
              className="ml-2 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Search Button */}
        <button
          type="submit"
          className="bg-indigo-600 hover:bg-indigo-700 active:scale-98 text-white font-black px-8 py-3.5 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-md hover:shadow-lg hover:shadow-indigo-600/10 cursor-pointer text-sm tracking-wide uppercase shrink-0"
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
            onClick={() => handleTagClick(tag)}
            className="px-3 py-1 bg-white/10 hover:bg-white/20 active:bg-white/30 border border-white/5 rounded-full transition-all duration-200 select-none text-white text-[11px] cursor-pointer"
          >
            {tag}
          </button>
        ))}
      </div>
    </div>
  )
}
