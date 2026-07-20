import { ArrowRight, Star } from 'lucide-react'
import { useGetTopCompanies } from '@/src/hooks/company'
import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'

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

export default function TopEmployers() {
  const { data, isLoading } = useGetTopCompanies(6)
  const companies = data || []

  const [failedLogos, setFailedLogos] = useState<Record<string, boolean>>({})

  return (
    <section
      className="bg-white py-12 border-b border-slate-100 transition-colors"
      id="top-employers-section"
    >
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
            <h2 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white tracking-tight">
              {'NHÀ TUYỂN DỤNG HÀNG ĐẦU'}
            </h2>
          </div>
          <Link
            href="/companies"
            className="flex items-center gap-1 text-sm font-bold text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition-colors group"
            id="link-view-more-employers"
          >
            <span>{'Xem thêm'}</span>
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        {/* Recruiter Logos grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-5" id="employers-grid">
          {isLoading ? (
            // Loading Skeletons
            Array.from({ length: 6 }).map((_, idx) => (
              <div
                key={idx}
                className="animate-pulse bg-slate-50 border border-slate-200/70 rounded-3xl h-36"
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
                  className="group relative flex flex-col items-center justify-center bg-white rounded-3xl border border-slate-200/70 shadow-[0_4px_20px_rgba(0,0,0,0.02)] hover:shadow-md hover:border-blue-500/40 hover:-translate-y-1 transition-all duration-300 overflow-hidden cursor-pointer p-4 h-36"
                  id={`employer-card-${company.id}`}
                >
                  {showFallback ? (
                    <div
                      className={`w-12 h-12 rounded-2xl bg-linear-to-br ${getGradientClass(company.name)} flex items-center justify-center shadow-inner select-none mb-3`}
                    >
                      <span className="text-white font-black text-xl">{initial}</span>
                    </div>
                  ) : (
                    <div className="h-12 flex items-center justify-center mb-3">
                      <Image
                        src={company.logoUrl}
                        alt={company.name}
                        width={48}
                        height={48}
                        unoptimized
                        onError={() => setFailedLogos((prev) => ({ ...prev, [company.id]: true }))}
                        className="max-h-full max-w-full object-contain transition-transform group-hover:scale-105 duration-300"
                        id={`employer-img-${company.id}`}
                      />
                    </div>
                  )}

                  {/* Company Name (Always visible) */}
                  <span className="text-[11px] font-black text-slate-800 text-center line-clamp-1 max-w-full group-hover:text-blue-600 transition-colors">
                    {company.name}
                  </span>

                  {/* Jobs Count Badge (Always visible) */}
                  {'activeJobsCount' in company && company.activeJobsCount !== undefined && (
                    <span className="mt-2.5 bg-blue-50 text-blue-650 text-[9px] font-black px-2 py-0.5 rounded-lg border border-blue-100/50 uppercase tracking-wider">
                      {company.activeJobsCount} Jobs
                    </span>
                  )}
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
