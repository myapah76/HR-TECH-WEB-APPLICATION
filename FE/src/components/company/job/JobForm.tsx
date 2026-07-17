'use client'

import { useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2, Briefcase, CheckCircle } from 'lucide-react'
import { toast } from 'sonner'
import * as z from 'zod'

import { jobSchema, JobFormData } from '@/src/schemas/job.schema'
import { Job } from '@/src/types/job'
import { Skill } from '@/src/types/skill'
import RequiredSkillInput, { RequiredSkill } from './RequiredSkillInput'
import SkillTagInput from './SkillTagInput'
import { formatDateForInput, formatVND, parseVND } from '@/src/utils'
import {
  JobType,
  ExperienceLevel,
  JOB_TYPE_LABELS,
  EXPERIENCE_LEVEL_LABELS,
  JobStatus,
} from '@/src/enums/job.enum'

interface JobFormProps {
  job?: Job
  onSubmit: (data: JobFormData, requiredSkills: RequiredSkill[], relatedSkills: Skill[]) => void
  isPending: boolean
  submitLabel: string
  title: string
  subtitle: string
  onCancel: () => void
}

export default function JobForm({
  job,
  onSubmit,
  isPending,
  submitLabel,
  title,
  subtitle,
  onCancel,
}: JobFormProps) {
  const [requiredSkills, setRequiredSkills] = useState<RequiredSkill[]>(() =>
    job
      ? (job.skills ?? [])
          .filter((skill) => Boolean(skill.requiredLevel))
          .map((skill) => ({
            id: skill.skillNeo4jId,
            name: skill.skillName,
            level: skill.requiredLevel,
          }))
      : []
  )
  const [relatedSkills, setRelatedSkills] = useState<Skill[]>(() =>
    job
      ? (job.skills ?? [])
          .filter((skill) => !skill.requiredLevel)
          .map((skill) => ({ id: skill.skillNeo4jId, name: skill.skillName }))
      : []
  )

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<z.input<typeof jobSchema>, unknown, JobFormData>({
    resolver: zodResolver(jobSchema),
    defaultValues: {
      title: job?.title ?? '',
      position: job?.position ?? '',
      jobType: job?.jobType ?? '',
      experienceLevel: job?.experienceLevel ?? '',
      location: job?.location ?? '',
      description: job?.description ?? '',
      requirements: job?.requirements ?? '',
      deadline: job ? formatDateForInput(job.deadline) : '',
      salaryMin: job?.salaryMin ?? undefined,
      salaryMax: job?.salaryMax ?? undefined,
    } as any,
  })

  const formatNumber = (val: string | number) => {
    if (val === undefined || val === null || val === '') return ''
    const clean = String(val).replace(/\D/g, '')
    return clean.replace(/\B(?=(\d{3})+(?!\d))/g, '.')
  }

  const handleFormSubmit = (data: JobFormData) => {
    if (requiredSkills.length === 0) {
      toast.error('Vui lòng chọn ít nhất một kỹ năng bắt buộc!')
      return
    }
    onSubmit(data, requiredSkills, relatedSkills)
  }

  return (
    <div className="pb-12">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <Briefcase className="w-6 h-6 text-emerald-600 dark:text-emerald-500" />
          {title}
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">
          {subtitle}
        </p>
      </div>

      {job && (job.status === JobStatus.REJECTED ||
        job.status === JobStatus.FAILED_AI ||
        job.status === JobStatus.REJECTED_BY_ADMIN) &&
        job.rejectionReason && (
        <div className="mb-6 rounded-2xl border border-rose-200 dark:border-rose-900/50 bg-rose-50 dark:bg-rose-950/20 px-5 py-4 text-sm text-rose-800 dark:text-rose-200">
          <p className="font-bold uppercase tracking-wide text-rose-700 dark:text-rose-400">Lý do bị từ chối</p>
          <p className="mt-2 whitespace-pre-wrap leading-6">{job.rejectionReason}</p>
        </div>
      )}

      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-8">
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-6 flex items-center gap-2 border-b dark:border-slate-800 pb-3">
            <span className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-sm font-bold">
              1
            </span>
            Thông tin cơ bản
          </h2>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Tên công việc (Title) <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                className="w-full border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-slate-800 dark:text-slate-100"
                placeholder="VD: Senior React Developer"
                {...register('title')}
              />
              {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Lĩnh vực vị trí (Position) <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                className="w-full border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-slate-800 dark:text-slate-100"
                placeholder="VD: Frontend Developer, DevOps Engineer, Business Analyst..."
                {...register('position')}
              />
              {errors.position && (
                <p className="text-red-500 text-xs mt-1">{errors.position.message}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Hình thức <span className="text-red-500">*</span>
                </label>
                <select
                  className="w-full border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-slate-800 dark:text-slate-100"
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
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Cấp bậc <span className="text-red-500">*</span>
                </label>
                <select
                  className="w-full border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-slate-800 dark:text-slate-100"
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
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Địa điểm làm việc <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                className="w-full border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-slate-800 dark:text-slate-100"
                placeholder="VD: Quận 1, TP. Hồ Chí Minh"
                {...register('location')}
              />
              {errors.location && (
                <p className="text-red-500 text-xs mt-1">{errors.location.message}</p>
              )}
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-6 flex items-center gap-2 border-b dark:border-slate-800 pb-3">
            <span className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-sm font-bold">
              2
            </span>
            Lương & Thời hạn
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Lương tối thiểu (VND)
              </label>
              <Controller
                control={control}
                name="salaryMin"
                render={({ field: { onChange, value } }) => (
                  <input
                    type="text"
                    className="w-full border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-slate-800 dark:text-slate-100"
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
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">
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
                    className="w-full border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-slate-800 dark:text-slate-100"
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
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Hạn nộp hồ sơ <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                className="w-full border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-slate-800 dark:text-slate-100"
                {...register('deadline')}
              />
              {errors.deadline && (
                <p className="text-red-500 text-xs mt-1">{errors.deadline.message}</p>
              )}
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-6 flex items-center gap-2 border-b dark:border-slate-800 pb-3">
            <span className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-sm font-bold">
              3
            </span>
            Mô tả chi tiết
          </h2>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Mô tả công việc <span className="text-red-500">*</span>
              </label>
              <textarea
                rows={6}
                className="w-full border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all resize-y text-slate-800 dark:text-slate-100"
                placeholder="Mô tả chi tiết nhiệm vụ và trách nhiệm..."
                {...register('description')}
              />
              {errors.description && (
                <p className="text-red-500 text-xs mt-1">{errors.description.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Yêu cầu ứng viên <span className="text-red-500">*</span>
              </label>
              <textarea
                rows={6}
                className="w-full border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all resize-y text-slate-800 dark:text-slate-100"
                placeholder="Yêu cầu về kinh nghiệm, bằng cấp, tính cách..."
                {...register('requirements')}
              />
              {errors.requirements && (
                <p className="text-red-500 text-xs mt-1">{errors.requirements.message}</p>
              )}
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-6 flex items-center gap-2 border-b dark:border-slate-800 pb-3">
            <span className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-sm font-bold">
              4
            </span>
            Kỹ năng chuyên môn
          </h2>

          <div className="space-y-8">
            <div>
              <label className="block text-base font-bold text-slate-900 dark:text-slate-100 mb-1">
                Kỹ năng bắt buộc (Required Skills) <span className="text-red-500">*</span>
              </label>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
                Các kỹ năng trọng yếu và mức độ trình độ bắt buộc ứng viên phải có.
              </p>
              <RequiredSkillInput value={requiredSkills} onChange={setRequiredSkills} />
            </div>

            <div className="border-t border-slate-100 dark:border-slate-800" />

            <div>
              <label className="block text-base font-bold text-slate-950 dark:text-slate-100 mb-1">
                Kỹ năng liên quan (Related Skills)
              </label>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
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
            onClick={onCancel}
            className="px-6 py-2.5 rounded-xl text-sm font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            Hủy bỏ
          </button>
          <button
            type="submit"
            disabled={isPending}
            className="px-6 py-2.5 rounded-xl text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 transition-colors shadow-sm shadow-emerald-600/20 flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <CheckCircle className="w-4 h-4" />
            )}
            {submitLabel}
          </button>
        </div>
      </form>
    </div>
  )
}
