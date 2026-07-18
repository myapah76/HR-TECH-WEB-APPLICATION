'use client'

import { CircleX } from 'lucide-react'
import { Job } from '@/src/types/job'
import RejectionReasonDisplay from './RejectionReasonDisplay'
import { formatDate, formatSalary } from '@/src/utils'
import {
  EXPERIENCE_LEVEL_LABELS,
  JobStatus,
  JOB_TYPE_LABELS,
  JOB_STATUS_LABELS,
} from '@/src/enums/job.enum'

interface JobPreviewModalProps {
  job: Job
  onClose: () => void
}

export default function JobPreviewModal({ job, onClose }: JobPreviewModalProps) {
  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
      <div className="max-h-[90vh] w-full max-w-4xl overflow-hidden rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl">
        <div className="flex items-start justify-between gap-4 border-b border-slate-100 dark:border-slate-800 px-6 py-5">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-600 dark:text-blue-400">
              Xem nội bộ
            </p>
            <h2 className="mt-1 text-2xl font-black text-slate-900 dark:text-slate-100">
              {job.title}
            </h2>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              {job.companyName || 'Chưa có tên công ty'} ·{' '}
              {JOB_STATUS_LABELS[job.status] || job.status}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-slate-400 dark:text-slate-500 transition-colors hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-300"
            aria-label="Đóng xem nội bộ"
          >
            <CircleX className="h-5 w-5" />
          </button>
        </div>

        <div className="max-h-[calc(90vh-88px)] overflow-y-auto p-6">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 p-4">
              <p className="text-xs font-bold uppercase tracking-wide text-slate-400 dark:text-slate-500">
                Địa điểm
              </p>
              <p className="mt-2 text-sm font-semibold text-slate-900 dark:text-slate-100">
                {job.location || 'Chưa cập nhật'}
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 p-4">
              <p className="text-xs font-bold uppercase tracking-wide text-slate-400 dark:text-slate-500">
                Hình thức
              </p>
              <p className="mt-2 text-sm font-semibold text-slate-900 dark:text-slate-100">
                {JOB_TYPE_LABELS[job.jobType] || job.jobType || 'Chưa cập nhật'}
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 p-4">
              <p className="text-xs font-bold uppercase tracking-wide text-slate-400 dark:text-slate-500">
                Kinh nghiệm
              </p>
              <p className="mt-2 text-sm font-semibold text-slate-900 dark:text-slate-100">
                {EXPERIENCE_LEVEL_LABELS[job.experienceLevel] || job.experienceLevel}
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 p-4">
              <p className="text-xs font-bold uppercase tracking-wide text-slate-400 dark:text-slate-500">
                Mức lương
              </p>
              <p className="mt-2 text-sm font-semibold text-slate-900 dark:text-slate-100">
                {formatSalary(job.salaryMin, job.salaryMax)}
              </p>
            </div>
          </div>

          <div className="mt-6 grid gap-6 lg:grid-cols-[1.4fr_1fr]">
            <div className="space-y-6">
              <section className="rounded-2xl border border-slate-200 dark:border-slate-800 p-5 bg-white dark:bg-slate-900">
                <h3 className="text-sm font-black uppercase tracking-wide text-slate-700 dark:text-slate-300">
                  Mô tả
                </h3>
                <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-slate-600 dark:text-slate-400">
                  {job.description || 'Chưa có mô tả'}
                </p>
              </section>

              <section className="rounded-2xl border border-slate-200 dark:border-slate-800 p-5 bg-white dark:bg-slate-900">
                <h3 className="text-sm font-black uppercase tracking-wide text-slate-700 dark:text-slate-300">
                  Yêu cầu
                </h3>
                <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-slate-600 dark:text-slate-400">
                  {job.requirements || 'Chưa có yêu cầu'}
                </p>
              </section>

              <section className="rounded-2xl border border-slate-200 dark:border-slate-800 p-5 bg-white dark:bg-slate-900">
                <h3 className="text-sm font-black uppercase tracking-wide text-slate-700 dark:text-slate-300">
                  Quyền lợi
                </h3>
                <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-slate-600 dark:text-slate-400">
                  {job.benefits || 'Chưa có quyền lợi'}
                </p>
              </section>
            </div>

            <div className="space-y-6">
              <section className="rounded-2xl border border-slate-200 dark:border-slate-800 p-5 bg-white dark:bg-slate-900">
                <h3 className="text-sm font-black uppercase tracking-wide text-slate-700 dark:text-slate-300">
                  Kỹ năng
                </h3>
                <div className="mt-3 flex flex-wrap gap-2">
                  {job.skills?.length ? (
                    job.skills.map((skill) => (
                      <span
                        key={skill.id}
                        className="inline-flex items-center gap-1.5 rounded-full border border-blue-200 dark:border-blue-900/50 bg-blue-50 dark:bg-blue-950/30 px-3 py-1.5 text-xs font-semibold text-blue-700 dark:text-blue-400"
                      >
                        {skill.skillName}
                        {skill.requiredLevel && (
                          <span className="text-blue-500 dark:text-blue-400">
                            · {skill.requiredLevel}
                          </span>
                        )}
                      </span>
                    ))
                  ) : (
                    <p className="text-sm text-slate-500 dark:text-slate-400">Chưa có kỹ năng</p>
                  )}
                </div>
              </section>

              {(job.status === JobStatus.REJECTED ||
                job.status === JobStatus.FAILED_AI ||
                job.status === JobStatus.REJECTED_BY_ADMIN) &&
                job.rejectionReason && (
                  <RejectionReasonDisplay reason={job.rejectionReason} />
                )}

              <section className="rounded-2xl border border-slate-200 dark:border-slate-800 p-5 bg-white dark:bg-slate-900">
                <h3 className="text-sm font-black uppercase tracking-wide text-slate-700 dark:text-slate-300">
                  Thông tin khác
                </h3>
                <div className="mt-3 space-y-3 text-sm text-slate-600 dark:text-slate-400">
                  <div className="flex items-start justify-between gap-4">
                    <span className="font-semibold text-slate-500 dark:text-slate-400">
                      Người tạo
                    </span>
                    <span className="text-right font-medium text-slate-900 dark:text-slate-100">
                      {job.createdByName || 'Chưa cập nhật'}
                    </span>
                  </div>
                  <div className="flex items-start justify-between gap-4">
                    <span className="font-semibold text-slate-500 dark:text-slate-400">
                      Hạn nộp
                    </span>
                    <span className="text-right font-medium text-slate-900 dark:text-slate-100">
                      {job.deadline ? formatDate(job.deadline) : 'Chưa cập nhật'}
                    </span>
                  </div>
                  <div className="flex items-start justify-between gap-4">
                    <span className="font-semibold text-slate-500 dark:text-slate-400">
                      Ngày tạo
                    </span>
                    <span className="text-right font-medium text-slate-900 dark:text-slate-100">
                      {job.createdAt ? formatDate(job.createdAt) : 'Chưa cập nhật'}
                    </span>
                  </div>
                </div>
              </section>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
