'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Briefcase, CheckCircle, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import * as z from 'zod'

import Loading from '@/src/app/loading'
import RequiredSkillInput, { RequiredSkill } from '@/src/components/company/job/RequiredSkillInput'
import SkillTagInput from '@/src/components/company/job/SkillTagInput'
import { useGetJobById, useUpdateJobMutation } from '@/src/hooks/job'
import { jobSchema, JobFormData } from '@/src/schemas/job.schema'
import { Job } from '@/src/types/job'
import { Skill } from '@/src/types/skill'
import { dateInputToInstant, formatDateForInput, formatVND, parseVND } from '@/src/utils'
import {
  JobType,
  ExperienceLevel,
  JOB_TYPE_LABELS,
  EXPERIENCE_LEVEL_LABELS,
  JobStatus,
} from '@/src/enums/job.enum'

export default function UpdateJobPage() {
  const { jobId } = useParams<{ jobId: string }>()
  const { data: job, isLoading, isError } = useGetJobById(jobId)

  if (isLoading) return <Loading />

  if (isError || !job) {
    return (
      <div className="mx-auto max-w-5xl rounded-2xl border border-red-200 bg-red-50 px-6 py-10 text-center text-sm font-semibold text-red-600">
        Không thể tải thông tin tin tuyển dụng. Vui lòng thử lại sau.
      </div>
    )
  }

  return <UpdateJobForm job={job} />
}

function UpdateJobForm({ job }: { job: Job }) {
  const router = useRouter()
  const updateJobMutation = useUpdateJobMutation(job.id)
  const [requiredSkills, setRequiredSkills] = useState<RequiredSkill[]>(() =>
    (job.skills ?? [])
      .filter((skill) => Boolean(skill.requiredLevel))
      .map((skill) => ({
        id: skill.skillNeo4jId,
        name: skill.skillName,
        level: skill.requiredLevel,
      }))
  )
  const [relatedSkills, setRelatedSkills] = useState<Skill[]>(() =>
    (job.skills ?? [])
      .filter((skill) => !skill.requiredLevel)
      .map((skill) => ({ id: skill.skillNeo4jId, name: skill.skillName }))
  )

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<z.input<typeof jobSchema>, unknown, JobFormData>({
    resolver: zodResolver(jobSchema),
    defaultValues: {
      title: job.title,
      position: job.position,
      jobType: job.jobType,
      experienceLevel: job.experienceLevel,
      location: job.location,
      description: job.description || '',
      requirements: job.requirements || '',
      deadline: formatDateForInput(job.deadline),
      salaryMin: job.salaryMin ?? undefined,
      salaryMax: job.salaryMax ?? undefined,
    } as any,
  })

  const formatNumber = (val: string | number) => {
    if (val === undefined || val === null || val === '') return ''
    const clean = String(val).replace(/\D/g, '')
    return clean.replace(/\B(?=(\d{3})+(?!\d))/g, '.')
  }

  const onSubmit = (data: JobFormData) => {
    if (requiredSkills.length === 0) {
      toast.error('Vui lòng chọn ít nhất một kỹ năng bắt buộc!')
      return
    }

    const updatePayload = {
      ...data,
      companyId: job.companyId,
      deadline: dateInputToInstant(data.deadline),
      skills: [
        ...requiredSkills.map((skill: RequiredSkill) => ({
          skillNeo4jId: skill.id,
          requiredLevel: skill.level,
        })),
        ...relatedSkills.map((skill: Skill) => ({ skillNeo4jId: skill.id })),
      ],
    }

    updateJobMutation.mutate(updatePayload, {
      onSuccess: () => {
        toast.success('Cập nhật tin tuyển dụng thành công!')
        router.push('/recruiter/manage-jobs')
      },
    })
  }

  return (
    <div className="pb-12">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <Briefcase className="w-6 h-6 text-emerald-600" />
          Chỉnh sửa tin tuyển dụng
        </h1>
        <p className="text-slate-500 mt-1">
          Chỉnh sửa các thông tin dưới đây cho tin tuyển dụng của bạn.
        </p>
      </div>

      {job.status === JobStatus.REJECTED && job.rejectionReason && (
        <div className="mb-6 rounded-2xl border border-rose-200 bg-rose-50 px-5 py-4 text-sm text-rose-800">
          <p className="font-bold uppercase tracking-wide text-rose-700">Lý do bị từ chối</p>
          <p className="mt-2 whitespace-pre-wrap leading-6">{job.rejectionReason}</p>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
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

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">
                Lĩnh vực vị trí (Position) <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                placeholder="VD: Frontend Developer, DevOps Engineer, Business Analyst..."
                {...register('position')}
              />
              {errors.position && (
                <p className="text-red-500 text-xs mt-1">{errors.position.message}</p>
              )}
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
              <Controller
                control={control}
                name="salaryMin"
                render={({ field: { onChange, value } }) => (
                  <input
                    type="text"
                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                    placeholder="VD: 10.000.000"
                    value={formatNumber(value ?? '')}
                    onChange={(e) => {
                      const raw = e.target.value.replace(/\D/g, '')
                      onChange(raw ? Number(raw) : undefined)
                    }}
                  />
                )}
              />
              {errors.salaryMin && (
                <p className="text-red-500 text-xs mt-1">{errors.salaryMin.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">
                Lương tối đa (VND)
              </label>
              <Controller
                control={control}
                name="salaryMax"
                render={({ field }) => (
                  <input
                    ref={field.ref}
                    name={field.name}
                    type="text"
                    inputMode="numeric"
                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                    placeholder="VD: 25.000.000"
                    value={formatVND(field.value)}
                    onChange={(e) => {
                      const rawValue = parseVND(e.target.value)
                      field.onChange(rawValue ? Number(rawValue) : undefined)
                    }}
                    onBlur={field.onBlur}
                  />
                )}
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

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2 border-b pb-3">
            <span className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-sm font-bold">
              4
            </span>
            Kỹ năng chuyên môn
          </h2>

          <div className="space-y-8">
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

        <div className="flex items-center justify-end gap-4 pt-4">
          <button
            type="button"
            onClick={() => router.push('/recruiter/manage-jobs')}
            className="px-6 py-2.5 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-100 transition-colors"
          >
            Hủy bỏ
          </button>
          <button
            type="submit"
            disabled={updateJobMutation.isPending}
            className="px-6 py-2.5 rounded-xl text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 transition-colors shadow-sm shadow-emerald-600/20 flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {updateJobMutation.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <CheckCircle className="w-4 h-4" />
            )}
            Cập nhật tin tuyển dụng
          </button>
        </div>
      </form>
    </div>
  )
}
