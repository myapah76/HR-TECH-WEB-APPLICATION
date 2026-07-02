'use client'

import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
import { api } from '@/src/lib/axios'
import { ArrowLeft, MapPin, Users, Star, Calendar, Globe, CheckCircle, Briefcase } from 'lucide-react'
import { motion } from 'motion/react'

// Define interfaces locally or import them
interface CompanyDetail {
  id: string
  name: string
  description: string
  logoUrl: string
  website: string
  address: string
  email: string
  phone: string
  taxCode: string
  industry?: string
  size?: string
}

interface JobItem {
  id: string
  title: string
  location: string
  salary: string
  jobType: string
  postedAt?: string
}

export default function CompanyDetailPage() {
  const params = useParams()
  const router = useRouter()
  const id = params?.id as string

  // 1. Fetch Company details from API /api/companies/{id}
  const { data: company, isLoading: isLoadingCompany } = useQuery<CompanyDetail>({
    queryKey: ['companyDetail', id],
    queryFn: async () => {
      const res = await api.get(`/companies/${id}`)
      return res.data.data
    },
    enabled: !!id
  })

  // 2. Fetch Jobs of this company from API /api/companies/{id}/jobs (or public list filtered by company)
  const { data: pageData, isLoading: isLoadingJobs } = useQuery({
    queryKey: ['companyJobsPublic', id],
    queryFn: async () => {
      const res = await api.get(`/companies/${id}/jobs`)
      return res.data.data
    },
    enabled: !!id
  })

  // Extract jobs from Spring Page wrapper
  const companyJobs: JobItem[] = pageData?.content || []

  if (isLoadingCompany || isLoadingJobs) {
    return (
      <div className="flex flex-col items-center justify-center py-32 space-y-4">
        <div className="relative w-10 h-10">
          <div className="absolute inset-0 rounded-full border-4 border-blue-100 animate-pulse"></div>
          <div className="absolute inset-0 rounded-full border-4 border-t-blue-600 animate-spin"></div>
        </div>
        <p className="text-xs font-bold text-slate-500">Đang tải thông tin chi tiết công ty...</p>
      </div>
    )
  }

  if (!company) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-20 text-center font-sans">
        <h2 className="text-xl font-black text-slate-800">Không tìm thấy công ty</h2>
        <Link href="/companies" className="text-blue-600 font-bold text-sm mt-3 inline-block hover:underline">
          ← Quay lại danh sách
        </Link>
      </div>
    )
  }

  // Generate deterministic logo background/initials if no logo exists
  const initials = company.name.split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase()
  const bgColors = ['bg-emerald-600', 'bg-blue-600', 'bg-amber-600', 'bg-purple-600', 'bg-rose-600', 'bg-teal-600', 'bg-indigo-600', 'bg-cyan-600']
  const colorIdx = company.name.length % bgColors.length
  const logoBg = bgColors[colorIdx]

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 font-sans">
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-blue-600 mb-6 cursor-pointer transition-colors"
      >
        <ArrowLeft className="h-4 w-4" /> Quay lại
      </button>

      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl border border-slate-200/60 p-8 shadow-xs mb-6"
      >
        <div className="flex flex-col md:flex-row items-start gap-6">
          {company.logoUrl ? (
            <img
              src={company.logoUrl}
              alt={company.name}
              className="h-28 w-28 rounded-2xl object-contain bg-white p-1 border border-slate-200 shadow-md"
              onError={(e) => {
                (e.target as HTMLElement).style.display = 'none'
                const sibling = (e.target as HTMLElement).nextElementSibling
                if (sibling) sibling.removeAttribute('style')
              }}
            />
          ) : null}
          <div
            className={`h-28 w-28 rounded-2xl text-white font-black text-3xl flex items-center justify-center shrink-0 border-2 border-white shadow-md ${logoBg}`}
            style={company.logoUrl ? { display: 'none' } : undefined}
          >
            {initials}
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-black text-slate-900">{company.name}</h1>
            <p className="text-sm font-bold text-slate-400 mt-1">{company.industry || 'Doanh nghiệp công nghệ'}</p>
            <div className="flex flex-wrap gap-3 mt-4">
              <span className="flex items-center gap-1.5 text-xs font-bold text-slate-600 bg-slate-50 px-3 py-1.5 rounded-lg">
                <MapPin className="h-3.5 w-3.5" />
                {company.address ? company.address.split(',').pop()?.trim() : 'Việt Nam'}
              </span>
              <span className="flex items-center gap-1.5 text-xs font-bold text-slate-600 bg-slate-50 px-3 py-1.5 rounded-lg">
                <Users className="h-3.5 w-3.5" />
                {company.size || '100 - 500 nhân sự'}
              </span>
              <span className="flex items-center gap-1.5 text-xs font-bold text-slate-600 bg-slate-50 px-3 py-1.5 rounded-lg">
                <Calendar className="h-3.5 w-3.5" />
                MST: {company.taxCode || 'Đang cập nhật'}
              </span>
              <span className="flex items-center gap-1.5 text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg">
                <Briefcase className="h-3.5 w-3.5" />
                {companyJobs.length} vị trí đang tuyển
              </span>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200/60 p-6 shadow-xs">
            <h2 className="text-base font-black text-slate-900 mb-3 flex items-center gap-2">
              <Globe className="h-5 w-5 text-blue-600" /> Giới thiệu công ty
            </h2>
            <p className="text-sm text-slate-600 leading-relaxed font-medium">
              {company.description || `Chào mừng bạn đến với ${company.name}. Chúng tôi liên tục tìm kiếm và chào đón những tài năng mới gia nhập đội ngũ chuyên nghiệp.`}
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/60 p-6 shadow-xs">
            <h2 className="text-base font-black text-slate-900 mb-4">Phúc lợi nổi bật</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                'Môi trường làm việc năng động, sáng tạo',
                'Đào tạo phát triển kỹ năng liên tục',
                'Bảo hiểm sức khỏe toàn diện',
                'Du lịch công ty hàng năm'
              ].map((b, i) => (
                <div
                  key={i}
                  className="flex items-center gap-2.5 text-sm font-medium text-slate-600 bg-emerald-50/40 p-3 rounded-xl border border-emerald-100/50"
                >
                  <CheckCircle className="h-4 w-4 text-emerald-500 shrink-0" />
                  {b}
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/60 p-6 shadow-xs">
            <h2 className="text-base font-black text-slate-900 mb-4">Vị trí đang tuyển</h2>
            <div className="space-y-3">
              {companyJobs.length === 0 ? (
                <p className="text-xs font-bold text-slate-400 py-4 text-center">
                  Hiện tại công ty chưa đăng tin tuyển dụng nào.
                </p>
              ) : (
                companyJobs.map((job) => (
                  <Link
                    key={job.id}
                    href={`/jobs/${job.id}`}
                    className="block p-4 rounded-xl border border-slate-200/60 hover:border-blue-200 hover:shadow-sm transition-all group"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-sm font-extrabold text-slate-800 group-hover:text-blue-600">
                          {job.title}
                        </h3>
                        <p className="text-[11px] font-bold text-slate-400 mt-0.5">
                          {job.location} • {job.jobType}
                        </p>
                      </div>
                      <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg">
                        {job.salary}
                      </span>
                    </div>
                  </Link>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="space-y-5">
          <div className="bg-white rounded-2xl border border-slate-200/60 p-5 shadow-xs text-center">
            <p className="text-3xl font-black text-blue-600">{companyJobs.length}</p>
            <p className="text-xs font-bold text-slate-500 mt-1">Vị trí đang tuyển</p>
            <Link
              href={`/jobs?keyword=${encodeURIComponent(company.name)}`}
              className="mt-4 block w-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs py-3 rounded-xl transition-all"
            >
              Xem tất cả việc làm
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
