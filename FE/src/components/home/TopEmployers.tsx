import { ArrowRight, Star } from 'lucide-react'
import { useGetCompanies } from '@/src/hooks/company'
import { useState } from 'react'
import Link from 'next/link'

interface TopEmployersProps {}

const getGradientClass = (name: string) => {
  const code = name.charCodeAt(0) % 5
  switch (code) {
    case 0:
      return 'from-blue-500 to-indigo-650'
    case 1:
      return 'from-emerald-450 to-teal-600'
    case 2:
      return 'from-rose-500 to-pink-600'
    case 3:
      return 'from-amber-450 to-orange-500'
    default:
      return 'from-violet-500 to-purple-600'
  }
}

export default function TopEmployers({}: TopEmployersProps) {
  const { data, isLoading } = useGetCompanies({ page: 0, size: 6 })
  const companies = data?.content || []
  const [failedLogos, setFailedLogos] = useState<Record<string, boolean>>({})

  return (
    <section className="bg-white py-12 border-b border-gray-50" id="top-employers-section">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header container */}
        <div className="flex items-end justify-between mb-8" id="top-employers-header">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Star className="h-4.5 w-4.5 text-amber-500 fill-amber-500" />
              <span className="text-xs font-bold text-amber-600 uppercase tracking-widest">
                {'Được xác minh'}
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">
              {'NHÀ TUYỂN DỤNG HÀNG ĐẦU'}
            </h2>
          </div>
          <Link
            href="/companies"
            className="flex items-center gap-1 text-sm font-bold text-blue-600 hover:text-blue-800 transition-colors group"
            id="link-view-more-employers"
          >
            <span>{'Xem thêm'}</span>
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        {/* Recruiter Logos grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4" id="employers-grid">
          {isLoading ? (
            // Loading Skeletons
            Array.from({ length: 6 }).map((_, idx) => (
              <div
                key={idx}
                className="animate-pulse bg-slate-100 border border-slate-150 rounded-xl h-28"
              />
            ))
          ) : companies.length > 0 ? (
            companies.map((company) => {
              const showFallback = !company.logoUrl || failedLogos[company.id]
              const initial = company.name?.charAt(0)?.toUpperCase() ?? '?'
              return (
                <Link
                  key={company.id}
                  href={`/companies/${company.id}`}
                  className="group relative flex flex-col items-center justify-center bg-white border border-gray-150 rounded-xl hover:border-blue-300 hover:shadow-md transition-all duration-300 overflow-hidden cursor-pointer h-28"
                  id={`employer-card-${company.id}`}
                >
                  {showFallback ? (
                    <div
                      className={`w-full h-full bg-linear-to-br ${getGradientClass(company.name)} flex flex-col items-center justify-center p-3 select-none`}
                    >
                      <span className="text-white font-black text-2xl drop-shadow-md">
                        {initial}
                      </span>
                    </div>
                  ) : (
                    <img
                      src={company.logoUrl}
                      alt={company.name}
                      referrerPolicy="no-referrer"
                      onError={() => setFailedLogos((prev) => ({ ...prev, [company.id]: true }))}
                      className="h-10 w-auto object-contain filter grayscale opacity-70 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-300"
                      id={`employer-img-${company.id}`}
                    />
                  )}
                  <span className="absolute bottom-2 text-[10px] font-bold text-gray-400 group-hover:text-blue-600 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-1 group-hover:translate-y-0">
                    {company.name}
                  </span>
                </Link>
              )
            })
          ) : (
            <div className="col-span-full py-6 text-center text-sm font-semibold text-slate-400">
              Chưa có nhà tuyển dụng nào được cập nhật
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

