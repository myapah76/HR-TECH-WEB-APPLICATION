'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { useCreateJobMutation } from '@/src/hooks/job'
import { useGetMyCompany } from '@/src/hooks/company'
import SkillTagInput from '@/src/components/company/job/SkillTagInput'
import RequiredSkillInput, { RequiredSkill } from '@/src/components/company/job/RequiredSkillInput'
import { Skill } from '@/src/types/skill'
import { Loader2, Briefcase, CheckCircle } from 'lucide-react'
import { jobSchema, JobFormData } from '@/src/schemas/job.schema'
import Loading from '@/src/app/loading'
import {
  JobType,
  ExperienceLevel,
  JOB_TYPE_LABELS,
  EXPERIENCE_LEVEL_LABELS,
} from '@/src/enums/job.enum'

export default function PostJobPage() {
  const router = useRouter()
  const createJobMutation = useCreateJobMutation()
  const { data: myCompany, isLoading: isCompanyLoading } = useGetMyCompany()

  const [requiredSkills, setRequiredSkills] = useState<RequiredSkill[]>([])
  const [relatedSkills, setRelatedSkills] = useState<Skill[]>([])

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(jobSchema),
    defaultValues: {
      title: '',
      jobType: '',
      experienceLevel: '',
      location: '',
      description: '',
      requirements: '',
      deadline: '',
      salaryMin: undefined,
      salaryMax: undefined,
    },
  })

  const onSubmit = (data: JobFormData) => {
    if (!myCompany?.id) {
      toast.error('Không tìm thấy thông tin công ty của bạn!')
      return
    }

    const companyId = myCompany.id

    const skills = [
      ...requiredSkills.map((s) => ({ skillNeo4jId: s.id, requiredLevel: s.level })),
      ...relatedSkills.map((s) => ({ skillNeo4jId: s.id })),
    ]

    const payload = {
      ...data,
      companyId,
      skills,
    }

    createJobMutation.mutate(payload, {
      onSuccess: () => {
        toast.success('Đăng tin tuyển dụng thành công!')
        router.push('/recruiter/manage-jobs')
      },
    })
  }

  if (isCompanyLoading) {
    return <Loading />
  }

  return (
    <div className="max-w-5xl mx-auto pb-12">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <Briefcase className="w-6 h-6 text-emerald-600" />
          Tạo tin tuyển dụng mới
        </h1>
        <p className="text-slate-500 mt-1">
          Điền các thông tin dưới đây để đăng tin tuyển dụng tìm kiếm ứng viên tài năng.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* Section 1: Basic Info */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2 border-b pb-3">
            <span className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-sm font-bold">
              1
            </span>
            Thông tin cơ bản
          </h2>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">
                Tên công việc (Title) <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                placeholder="VD: Senior React Developer"
                {...register('title')}
              />
              {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title.message}</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">
                  Hình thức <span className="text-red-500">*</span>
                </label>
                <select
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all bg-white"
                  {...register('jobType')}
                >
                  <option value="">-- Chọn hình thức --</option>
                  {Object.values(JobType).map((type) => (
                    <option key={type} value={type}>
                      {JOB_TYPE_LABELS[type]} ({type})
                    </option>
                  ))}
                </select>
                {errors.jobType && (
                  <p className="text-red-500 text-xs mt-1">{errors.jobType.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">
                  Cấp bậc <span className="text-red-500">*</span>
                </label>
                <select
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all bg-white"
                  {...register('experienceLevel')}
                >
                  <option value="">-- Chọn cấp bậc --</option>
                  {Object.values(ExperienceLevel).map((level) => (
                    <option key={level} value={level}>
                      {EXPERIENCE_LEVEL_LABELS[level]} ({level})
                    </option>
                  ))}
                </select>
                {errors.experienceLevel && (
                  <p className="text-red-500 text-xs mt-1">{errors.experienceLevel.message}</p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">
                Địa điểm làm việc <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                placeholder="VD: Quận 1, TP. Hồ Chí Minh"
                {...register('location')}
              />
              {errors.location && (
                <p className="text-red-500 text-xs mt-1">{errors.location.message}</p>
              )}
            </div>
          </div>
        </div>

        {/* Section 2: Salary & Deadline */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2 border-b pb-3">
            <span className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-sm font-bold">
              2
            </span>
            Lương & Thời hạn
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">
                Lương tối thiểu (VND)
              </label>
              <input
                type="number"
                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                placeholder="VD: 10000000"
                {...register('salaryMin')}
              />
              {errors.salaryMin && (
                <p className="text-red-500 text-xs mt-1">{errors.salaryMin.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">
                Lương tối đa (VND)
              </label>
              <input
                type="number"
                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                placeholder="VD: 25000000"
                {...register('salaryMax')}
              />
              {errors.salaryMax && (
                <p className="text-red-500 text-xs mt-1">{errors.salaryMax.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">
                Hạn nộp hồ sơ <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                {...register('deadline')}
              />
              {errors.deadline && (
                <p className="text-red-500 text-xs mt-1">{errors.deadline.message}</p>
              )}
            </div>
          </div>
        </div>

        {/* Section 3: Description */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2 border-b pb-3">
            <span className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-sm font-bold">
              3
            </span>
            Mô tả chi tiết
          </h2>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">
                Mô tả công việc <span className="text-red-500">*</span>
              </label>
              <textarea
                rows={6}
                className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all resize-y"
                placeholder="Mô tả chi tiết nhiệm vụ và trách nhiệm..."
                {...register('description')}
              />
              {errors.description && (
                <p className="text-red-500 text-xs mt-1">{errors.description.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">
                Yêu cầu ứng viên <span className="text-red-500">*</span>
              </label>
              <textarea
                rows={6}
                className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all resize-y"
                placeholder="Yêu cầu về kinh nghiệm, bằng cấp, tính cách..."
                {...register('requirements')}
              />
              {errors.requirements && (
                <p className="text-red-500 text-xs mt-1">{errors.requirements.message}</p>
              )}
            </div>
          </div>
        </div>

        {/* Section 4: Skills (Separated List) */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2 border-b pb-3">
            <span className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-sm font-bold">
              4
            </span>
            Kỹ năng chuyên môn
          </h2>

          <div className="space-y-8">
            {/* REQUIRED SKILLS */}
            <div>
              <label className="block text-base font-bold text-slate-900 mb-1">
                Kỹ năng bắt buộc (Required Skills) <span className="text-red-500">*</span>
              </label>
              <p className="text-sm text-slate-500 mb-4">
                Các kỹ năng trọng yếu và mức độ trình độ bắt buộc ứng viên phải có.
              </p>
              <RequiredSkillInput value={requiredSkills} onChange={setRequiredSkills} />
            </div>

            <div className="border-t border-slate-100" />

            {/* RELATED SKILLS */}
            <div>
              <label className="block text-base font-bold text-slate-900 mb-1">
                Kỹ năng liên quan (Related Skills)
              </label>
              <p className="text-sm text-slate-500 mb-4">
                Các kỹ năng phụ trợ, điểm cộng thêm, không yêu cầu mức độ cụ thể.
              </p>
              <SkillTagInput
                value={relatedSkills}
                onChange={setRelatedSkills}
                colorTheme="blue"
                placeholder="Tìm kiếm kỹ năng liên quan..."
              />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-4 pt-4">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-6 py-2.5 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-100 transition-colors"
          >
            Hủy bỏ
          </button>
          <button
            type="submit"
            disabled={createJobMutation.isPending}
            className="px-6 py-2.5 rounded-xl text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 transition-colors shadow-sm shadow-emerald-600/20 flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {createJobMutation.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <CheckCircle className="w-4 h-4" />
            )}
            Đăng tin tuyển dụng
          </button>
        </div>
      </form>
    </div>
  )
}
