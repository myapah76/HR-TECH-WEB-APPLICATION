'use client'

import { useGetCompanies } from '@/src/hooks/company'
import { Briefcase } from 'lucide-react'
import { useState } from 'react'
import CompanyCard from '@/src/components/company/CompanyCard'
import SearchInput from '@/src/components/common/SearchInput'


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

      <div className="max-w-lg mx-auto mb-8">
        <SearchInput
          value={keyword}
          onChange={setKeyword}
          placeholder="Tìm công ty, ngành nghề..."
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
          {companiesList.map((company, i) => (
            <CompanyCard key={company.id} company={company} index={i} />
          ))}
        </div>
      )}
    </div>
  )
}


