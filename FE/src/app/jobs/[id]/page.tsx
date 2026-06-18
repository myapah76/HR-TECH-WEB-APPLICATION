'use client'

import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useState } from 'react'
import {
  MapPin,
  Briefcase,
  Heart,
  DollarSign,
  Calendar,
  ArrowLeft,
  Sparkles,
  Building2,
  X,
  PlusCircle,
  Share2,
  Check,
  ShieldCheck,
  Award,
  Clock,
} from 'lucide-react'
import { useGetJobById, useGetJobs } from '@/src/hooks/job/job.hooks'
import { toast } from 'sonner'

/** Generates a deterministic gradient from a company name */
function getAvatarGradient(name: string): string {
  const gradients = [
    'from-blue-500 to-indigo-600',
    'from-violet-500 to-purple-600',
    'from-rose-500 to-pink-600',
    'from-amber-500 to-orange-600',
    'from-teal-500 to-cyan-600',
    'from-emerald-500 to-green-600',
    'from-sky-500 to-blue-600',
    'from-fuchsia-500 to-violet-600',
  ]
  const index = (name?.charCodeAt(0) ?? 0) % gradients.length
  return gradients[index]
}

interface CompanyLogoProps {
  url?: string | null
  name: string
  sizeClassName?: string
  textClassName?: string
}

function CompanyLogo({
  url,
  name,
  sizeClassName = 'w-16 h-16 rounded-2xl',
  textClassName = 'text-2xl',
}: CompanyLogoProps) {
  const [imgError, setImgError] = useState(false)
  const initial = name?.charAt(0)?.toUpperCase() ?? '?'
  const gradient = getAvatarGradient(name)

  const showFallback = !url || imgError

  return (
    <div
      className={`relative shrink-0 ${sizeClassName} overflow-hidden shadow-inner border border-slate-100 bg-white flex items-center justify-center`}
    >
      {showFallback ? (
        <div
          className={`w-full h-full bg-gradient-to-br ${gradient} flex items-center justify-center`}
        >
          <span className={`text-white font-black ${textClassName} tracking-tight select-none drop-shadow`}>
            {initial}
          </span>
        </div>
      ) : (
        <img
          src={url!}
          alt={name}
          onError={() => setImgError(true)}
          className="w-full h-full object-contain p-2"
        />
      )}
    </div>
  )
}

export default function JobDetailPage() {
  const params = useParams()
  const router = useRouter()
  const jobId = params.id as string

  const { data: job, isLoading: loadingJob, error } = useGetJobById(jobId)

  // Similar jobs query
  const { data: jobsData } = useGetJobs(0, 10)
  const allJobs = jobsData?.content ?? []
  const similarJobs = allJobs.filter((j) => j.id !== jobId).slice(0, 3)

  // Interaction states
  const [isSaved, setIsSaved] = useState(false)

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href)
    toast.success('Đã sao chép liên kết công việc vào khay nhớ tạm!')
  }

  // Fallback Mock Benefits (if job doesn't provide them)
  const mockBenefits = [
    'Mức lương cạnh tranh kèm theo lương tháng 13 & thưởng hiệu suất cuối năm.',
    'Gói bảo hiểm sức khỏe cao cấp dành riêng cho nhân viên và người thân.',
    'Trang thiết bị làm việc hiện đại (Macbook Pro/Dell XPS + Màn hình phụ).',
    'Thời gian làm việc linh hoạt (Hybrid: 2 ngày WFH/tuần), nghỉ phép 15 ngày/năm.',
    'Lộ trình đào tạo rõ ràng, hỗ trợ 100% chi phí thi các chứng chỉ quốc tế.',
  ]

  if (loadingJob) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center space-y-4">
        <div className="relative w-12 h-12">
          <div className="absolute inset-0 rounded-full border-4 border-blue-100 animate-pulse"></div>
          <div className="absolute inset-0 rounded-full border-4 border-t-blue-600 animate-spin"></div>
        </div>
        <p className="text-sm font-bold text-slate-550 animate-pulse">Đang tải chi tiết công việc...</p>
      </div>
    )
  }

  if (error || !job) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
        <div className="bg-white p-8 rounded-3xl border border-slate-200/80 shadow-md max-w-md space-y-4">
          <div className="w-16 h-16 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mx-auto">
            <X className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-black text-slate-900">Không tìm thấy công việc</h2>
          <p className="text-sm text-slate-500 font-semibold leading-relaxed">
            Tin tuyển dụng này có thể đã bị đóng hoặc đường dẫn không chính xác.
          </p>
          <Link
            href="/jobs"
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm py-3 px-6 rounded-xl transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            Quay lại danh sách
          </Link>
        </div>
      </div>
    )
  }

  // Split requirements/description strings into arrays of sentences for beautiful styling
  const requirementsList = job.requirements
    ? job.requirements.split('\n').filter((line) => line.trim())
    : []

  const descriptionList = job.description
    ? job.description.split('\n').filter((line) => line.trim())
    : []

  const formatSalary = (min: number, max: number) => {
    if (!min && !max) return 'Thỏa thuận'
    return `$${min.toLocaleString()} - $${max.toLocaleString()}`
  }

  return (
    <div className="min-h-screen bg-slate-50/50 flex flex-col font-sans">
      {/* Back Button */}
      <div className="max-w-6xl mx-auto w-full px-4 lg:px-8 pt-8 pb-4">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-blue-600 cursor-pointer transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Quay lại danh sách</span>
        </button>
      </div>

      {/* Main Page Content Body */}
      <main className="max-w-6xl mx-auto w-full px-4 lg:px-8 pb-16 flex-1">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Left Description Column (2/3) */}
          <div className="lg:col-span-2 space-y-6">
            {/* Job Header Card */}
            <div className="bg-white rounded-3xl border border-slate-200/60 p-6 sm:p-8 shadow-[0_5px_25px_rgba(0,0,0,0.015)] relative overflow-hidden group">
              {/* Decorative gradient border on top */}
              <div className="absolute top-0 left-0 w-full h-[4px] bg-gradient-to-r from-blue-500 via-indigo-500 to-violet-500" />
              
              <div className="flex flex-col sm:flex-row items-start gap-5">
                <CompanyLogo url={job.companyLogoUrl} name={job.companyName} sizeClassName="w-16 h-16 rounded-2xl" textClassName="text-2xl" />
                <div className="flex-1 min-w-0 space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-black px-2.5 py-0.75 bg-slate-100 text-slate-600 rounded-lg uppercase tracking-wide">
                      {job.companyName}
                    </span>
                    {job.jobType && (
                      <span className="text-xs font-black px-2.5 py-0.75 bg-blue-50 text-blue-700 rounded-lg border border-blue-100/50">
                        {job.jobType}
                      </span>
                    )}
                    {job.experienceLevel && (
                      <span className="text-xs font-black px-2.5 py-0.75 bg-emerald-50 text-emerald-700 rounded-lg border border-emerald-100/50 flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-emerald-550" />
                        {job.experienceLevel}
                      </span>
                    )}
                    {job.status === 'OPEN' ? (
                      <span className="text-[10px] font-black tracking-widest bg-emerald-50 text-emerald-600 border border-emerald-200 px-2.5 py-0.75 rounded-lg uppercase leading-none">
                        Đang tuyển
                      </span>
                    ) : (
                      <span className="text-[10px] font-black tracking-widest bg-slate-100 text-slate-500 border border-slate-200 px-2.5 py-0.75 rounded-lg uppercase leading-none">
                        Đóng tuyển
                      </span>
                    )}
                  </div>

                  <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight leading-tight">
                    {job.title}
                  </h1>

                  <div className="flex flex-wrap gap-2.5 mt-3 text-xs font-bold text-slate-500">
                    <span className="flex items-center gap-1.5 bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-xl border border-emerald-150/40">
                      <DollarSign className="h-4 w-4" />
                      <span>{formatSalary(job.salaryMin, job.salaryMax)}</span>
                    </span>
                    <span className="flex items-center gap-1.5 bg-blue-50/50 text-blue-700 px-3 py-1.5 rounded-xl border border-blue-100/40">
                      <MapPin className="h-4 w-4" />
                      <span>{job.location}</span>
                    </span>
                    <span className="flex items-center gap-1.5 bg-slate-50 text-slate-600 px-3 py-1.5 rounded-xl border border-slate-200/50">
                      <Clock className="h-4 w-4" />
                      <span>Hạn nộp: {job.deadline ? new Date(job.deadline).toLocaleDateString('vi-VN') : 'Không thời hạn'}</span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons Row */}
              <div className="flex flex-wrap items-center gap-3 mt-8 pt-6 border-t border-slate-100">
                <button
                  onClick={() => toast.info('Tính năng nộp đơn ứng tuyển tạm thời đóng!')}
                  disabled={job.status !== 'OPEN'}
                  className="flex-1 min-w-[200px] bg-blue-600 hover:bg-blue-700 disabled:bg-slate-700 disabled:opacity-50 text-white font-black text-sm py-4 rounded-2xl transition-all duration-300 hover:scale-[1.02] hover:-translate-y-0.5 shadow-md shadow-blue-600/10 hover:shadow-lg hover:shadow-blue-600/20 active:scale-98 cursor-pointer uppercase tracking-wider flex items-center justify-center gap-2"
                >
                  <PlusCircle className="w-5 h-5" />
                  <span>Ứng tuyển ngay</span>
                </button>
                
                <button
                  onClick={() => {
                    setIsSaved(!isSaved)
                    toast.success(isSaved ? 'Đã hủy lưu công việc!' : 'Lưu công việc thành công!')
                  }}
                  className={`p-4 border rounded-2xl transition-all duration-200 cursor-pointer flex justify-center items-center ${
                    isSaved
                      ? 'bg-rose-50 border-rose-200 text-rose-500 shadow-sm'
                      : 'bg-white border-slate-200 text-slate-500 hover:border-slate-350 hover:bg-slate-50'
                  }`}
                  title="Lưu công việc"
                >
                  <Heart className={`w-5 h-5 transition-transform duration-200 ${isSaved ? 'fill-rose-500 scale-110' : 'hover:scale-105'}`} />
                </button>

                <button
                  onClick={handleShare}
                  className="p-4 bg-white border border-slate-200 hover:border-slate-350 rounded-2xl text-slate-500 hover:bg-slate-50 transition-all cursor-pointer flex justify-center items-center"
                  title="Chia sẻ công việc"
                >
                  <Share2 className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Description */}
            <div className="bg-white rounded-3xl border border-slate-200/60 p-6 sm:p-8 shadow-[0_5px_25px_rgba(0,0,0,0.015)] space-y-5">
              <h2 className="text-base font-black text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-4">
                <Briefcase className="w-5 h-5 text-blue-600 shrink-0" />
                <span>Mô tả công việc</span>
              </h2>
              <div className="space-y-4">
                {descriptionList.length > 0 ? (
                  descriptionList.map((paragraph, index) => (
                    <p key={index} className="text-sm text-slate-650 leading-relaxed font-semibold">
                      {paragraph}
                    </p>
                  ))
                ) : (
                  <p className="text-sm text-slate-400 font-semibold italic">Không có mô tả chi tiết.</p>
                )}
              </div>
            </div>

            {/* Requirements */}
            <div className="bg-white rounded-3xl border border-slate-200/60 p-6 sm:p-8 shadow-[0_5px_25px_rgba(0,0,0,0.015)] space-y-5">
              <h2 className="text-base font-black text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-4">
                <Award className="w-5 h-5 text-indigo-650 shrink-0" />
                <span>Yêu cầu ứng viên</span>
              </h2>
              <ul className="space-y-3.5">
                {requirementsList.length > 0 ? (
                  requirementsList.map((req, index) => (
                    <li key={index} className="flex items-start gap-3 text-sm font-semibold text-slate-655 leading-relaxed">
                      <span className="w-5 h-5 rounded-full bg-blue-50 text-blue-655 flex items-center justify-center shrink-0 mt-0.5 border border-blue-100/40">
                        <Check className="w-3.5 h-3.5" strokeWidth={3} />
                      </span>
                      <span>{req}</span>
                    </li>
                  ))
                ) : (
                  <p className="text-sm text-slate-400 font-semibold italic">Không có yêu cầu chi tiết.</p>
                )}
              </ul>
            </div>

            {/* Benefits */}
            <div className="bg-white rounded-3xl border border-slate-200/60 p-6 sm:p-8 shadow-[0_5px_25px_rgba(0,0,0,0.015)] space-y-5">
              <h2 className="text-base font-black text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-4">
                <Sparkles className="w-5 h-5 text-amber-500 shrink-0 animate-pulse" />
                <span>Quyền lợi & Đãi ngộ</span>
              </h2>
              <ul className="space-y-3.5">
                {mockBenefits.map((ben, index) => (
                  <li key={index} className="flex items-start gap-3 text-sm font-semibold text-slate-655 leading-relaxed">
                    <span className="w-5 h-5 rounded-full bg-emerald-50 text-emerald-650 flex items-center justify-center shrink-0 mt-0.5 border border-emerald-100/40">
                      <Check className="w-3.5 h-3.5 text-emerald-600" strokeWidth={3} />
                    </span>
                    <span>{ben}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Skills & Technologies Required */}
            <div className="bg-white rounded-3xl border border-slate-200/60 p-6 sm:p-8 shadow-[0_5px_25px_rgba(0,0,0,0.015)] space-y-5">
              <h2 className="text-base font-black text-slate-900 border-b border-slate-100 pb-4">
                Kỹ năng & Công nghệ yêu cầu
              </h2>
              <div className="flex flex-wrap gap-2">
                {job.skills?.length > 0 ? (
                  job.skills.map((skill, index) => (
                    <span
                      key={index}
                      className="px-3.5 py-2 bg-blue-50/50 hover:bg-blue-100/60 text-blue-700 border border-blue-100/50 text-xs font-black rounded-xl uppercase tracking-wider transition-all cursor-pointer"
                    >
                      {skill.skillName}
                    </span>
                  ))
                ) : (
                  <span className="text-sm text-slate-450 font-bold italic">Không có kỹ năng cụ thể</span>
                )}
              </div>
            </div>
          </div>

          {/* Right Summary Sidebar Column (1/3) */}
          <div className="space-y-6">
            {/* Company Info Widget */}
            <div className="bg-white rounded-3xl border border-slate-200/60 p-6 shadow-[0_5px_25px_rgba(0,0,0,0.015)] space-y-4">
              <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
                <CompanyLogo url={job.companyLogoUrl} name={job.companyName} sizeClassName="w-12 h-12 rounded-xl" textClassName="text-lg" />
                <div>
                  <h3 className="font-extrabold text-slate-850 text-sm leading-snug">
                    {job.companyName}
                  </h3>
                  <span className="inline-flex items-center gap-1 text-[9px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100/50 mt-1 uppercase tracking-wide">
                    <ShieldCheck className="w-3 h-3" />
                    Đã xác minh
                  </span>
                </div>
              </div>
              <p className="text-slate-500 font-semibold leading-relaxed text-xs">
                Nhà tuyển dụng công nghệ uy tín hàng đầu, mang tới môi trường làm việc sáng tạo cùng nhiều quyền lợi bứt phá sự nghiệp.
              </p>
              <div className="pt-2 text-xs font-semibold text-slate-600 space-y-2">
                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                  <span>{job.location}</span>
                </div>
              </div>
              <Link
                href="/jobs"
                className="block w-full text-center bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs py-3 rounded-xl transition-all"
              >
                <Building2 className="h-3.5 w-3.5 inline mr-1.5" />
                Xem tất cả công việc
              </Link>
            </div>

            {/* Similar Jobs Widget */}
            {similarJobs.length > 0 && (
              <div className="bg-white rounded-3xl border border-slate-200/60 p-6 shadow-[0_5px_25px_rgba(0,0,0,0.015)] space-y-4">
                <h3 className="text-sm font-black text-slate-900 mb-2">Việc làm tương tự</h3>
                <div className="space-y-3">
                  {similarJobs.map((rj) => (
                    <Link
                      key={rj.id}
                      href={`/jobs/${rj.id}`}
                      className="block p-3.5 rounded-2xl border border-slate-100 hover:border-blue-500/20 hover:bg-slate-50/50 transition-all duration-300 group"
                    >
                      <div className="flex items-center gap-3">
                        <CompanyLogo url={rj.companyLogoUrl} name={rj.companyName} sizeClassName="w-10 h-10 rounded-xl" textClassName="text-sm" />
                        <div className="min-w-0 flex-1">
                          <h4 className="text-xs font-extrabold text-slate-800 group-hover:text-blue-600 transition-colors line-clamp-1">
                            {rj.title}
                          </h4>
                          <p className="text-[10px] font-bold text-slate-450 line-clamp-1">{rj.companyName}</p>
                        </div>
                      </div>
                      <div className="flex justify-between items-center mt-2.5 pt-2 border-t border-slate-50/60">
                        <span className="text-[10px] font-bold text-emerald-600">{formatSalary(rj.salaryMin, rj.salaryMax)}</span>
                        <span className="text-[9px] font-semibold text-slate-400">{rj.location}</span>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
