'use client'

import Link from 'next/link'
import { useGetCompanies } from '@/src/hooks/company'
import { Search, MapPin, Users, Star, Briefcase } from 'lucide-react'
import { useState } from 'react'
import { motion } from 'motion/react'

export default function CompaniesListPage() {
  const [keyword, setKeyword] = useState('')

  const { data: pageRes, isLoading } = useGetCompanies({
    keyword: keyword || undefined,
    page: 0,
    size: 50,
  })

  const companiesList = pageRes?.content || []

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 font-sans">
      <div className="text-center mb-8">
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
          Công Ty Hàng Đầu
        </h1>
        <p className="text-sm text-slate-500 font-medium mt-2">
          Khám phá văn hóa và cơ hội tại các doanh nghiệp uy tín
        </p>
      </div>

      <div className="max-w-lg mx-auto mb-8 relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-slate-400" />
        <input
          type="text"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          placeholder="Tìm công ty, ngành nghề..."
          className="w-full pl-11 pr-4 py-3.5 bg-white border border-slate-200 rounded-2xl text-sm font-semibold focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all shadow-xs"
        />
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 space-y-4">
          <div className="relative w-10 h-10">
            <div className="absolute inset-0 rounded-full border-4 border-blue-100 animate-pulse"></div>
            <div className="absolute inset-0 rounded-full border-4 border-t-blue-600 animate-spin"></div>
          </div>
          <p className="text-xs font-bold text-slate-500">Đang tải danh sách công ty...</p>
        </div>
      ) : companiesList.length === 0 ? (
        <div className="text-center py-20 bg-white border border-slate-200/60 rounded-3xl max-w-md mx-auto shadow-xs">
          <Briefcase className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-black text-slate-900 mb-1">Không tìm thấy công ty nào</h3>
          <p className="text-xs font-semibold text-slate-500 px-6">
            Thử tìm kiếm với từ khóa khác hoặc quay lại sau.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {companiesList.map((company, i) => {
            const initials = company.name.split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase()
            const bgColors = ['bg-emerald-600', 'bg-blue-600', 'bg-amber-600', 'bg-purple-600', 'bg-rose-600', 'bg-teal-600', 'bg-indigo-600', 'bg-cyan-600']
            const colorIdx = company.name.length % bgColors.length
            const logoBg = bgColors[colorIdx]

            return (
              <motion.div
                key={company.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <Link
                  href={`/companies/${company.id}`}
                  className="block bg-white rounded-2xl border border-slate-200/60 p-6 hover:shadow-md hover:border-blue-200 transition-all duration-300 group h-full"
                >
                  <div className="flex items-center gap-4 mb-4">
                    {company.logoUrl ? (
                      <img
                        src={company.logoUrl}
                        alt={company.name}
                        className="h-14 w-14 rounded-2xl object-cover border border-slate-100"
                        onError={(e) => {
                          // Fallback to text initials on error
                          (e.target as HTMLElement).style.display = 'none'
                          const sibling = (e.target as HTMLElement).nextElementSibling
                          if (sibling) sibling.removeAttribute('style')
                        }}
                      />
                    ) : null}
                    <div
                      className={`h-14 w-14 rounded-2xl text-white font-extrabold text-lg flex items-center justify-center ${logoBg}`}
                      style={company.logoUrl ? { display: 'none' } : undefined}
                    >
                      {initials}
                    </div>
                    <div>
                      <h3 className="text-base font-black text-slate-900 group-hover:text-blue-600 transition-colors">
                        {company.name}
                      </h3>
                      <p className="text-xs font-bold text-slate-400">
                        {company.website || 'Chưa cập nhật website'}
                      </p>
                    </div>
                  </div>
                  <p className="text-xs text-slate-500 font-medium leading-relaxed line-clamp-2 mb-4">
                    {company.description || `Chào mừng bạn đến với ${company.name}. Khám phá các cơ hội nghề nghiệp hấp dẫn ngay hôm nay.`}
                  </p>
                  <div className="flex flex-wrap gap-2 mb-4">
                    <span className="flex items-center gap-1 text-[10px] font-bold text-slate-500 bg-slate-50 px-2 py-0.5 rounded-md">
                      <MapPin className="h-3 w-3" />
                      {company.address ? company.address.split(',').pop()?.trim() : 'Việt Nam'}
                    </span>
                    <span className="flex items-center gap-1 text-[10px] font-bold text-slate-500 bg-slate-50 px-2 py-0.5 rounded-md">
                      <Users className="h-3 w-3" />
                      Doanh nghiệp
                    </span>
                    <span className="flex items-center gap-1 text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md">
                      <Star className="h-3 w-3" />
                      4.8/5
                    </span>
                  </div>
                  <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                    <span className="flex items-center gap-1 text-xs font-bold text-blue-600">
                      <Briefcase className="h-3.5 w-3.5" />
                      Xem các vị trí đang tuyển
                    </span>
                  </div>
                </Link>
              </motion.div>
            )
          })}
        </div>
      )}
    </div>
  )
}


