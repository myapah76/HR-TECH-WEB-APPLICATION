import Link from 'next/link'
import { Eye, MapPin, Pencil, Trash2 } from 'lucide-react'

import { Job } from '@/src/types/job'

interface ManageJobTableProps {
  jobs: Job[]
}

const jobTypeLabels: Record<string, string> = {
  FULL_TIME: 'Toàn thời gian',
  PART_TIME: 'Bán thời gian',
}

const statusStyles: Record<string, string> = {
  APPROVED: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  OPEN: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  CLOSED: 'bg-slate-100 text-slate-600 border-slate-200',
  DRAFT: 'bg-amber-50 text-amber-700 border-amber-200',
  PENDING_APPROVAL: 'bg-blue-50 text-blue-700 border-blue-200',
  REJECTED: 'bg-red-50 text-red-700 border-red-200',
}

const statusLabels: Record<string, string> = {
  APPROVED: 'Đã duyệt',
  OPEN: 'Đang tuyển',
  CLOSED: 'Đã đóng',
  DRAFT: 'Bản nháp',
  PENDING_APPROVAL: 'Chờ duyệt',
  REJECTED: 'Bị từ chối',
}

export default function ManageJobTable({ jobs }: ManageJobTableProps) {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full min-w-225 text-left">
          <thead className="border-b border-slate-200 bg-slate-50/80">
            <tr className="text-xs font-bold uppercase tracking-wide text-slate-500">
              <th className="px-6 py-4">Tin tuyển dụng</th>
              <th className="px-4 py-4">Địa điểm</th>
              <th className="px-4 py-4">Hình thức</th>
              <th className="px-4 py-4">Trạng thái</th>
              <th className="px-4 py-4">Ngày tạo</th>
              <th className="px-6 py-4 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {jobs.map((job) => (
              <tr key={job.id} className="transition-colors hover:bg-slate-50/70">
                <td className="px-6 py-5">
                  <div className="max-w-80">
                    <p className="font-bold text-slate-900">{job.title}</p>
                    <p className="mt-1 truncate text-sm text-slate-500">
                      {job.companyName || 'Chưa có tên công ty'}
                    </p>
                  </div>
                </td>
                <td className="px-4 py-5">
                  <span className="flex items-center gap-1.5 text-sm font-medium text-slate-600">
                    <MapPin className="h-4 w-4 shrink-0 text-slate-400" />
                    {job.location || 'Chưa cập nhật'}
                  </span>
                </td>
                <td className="px-4 py-5 text-sm font-semibold text-slate-600">
                  {jobTypeLabels[job.jobType] || job.jobType || 'Chưa cập nhật'}
                </td>
                <td className="px-4 py-5">
                  <span
                    className={`inline-flex rounded-full border px-3 py-1 text-xs font-bold ${
                      statusStyles[job.status] || statusStyles.CLOSED
                    }`}
                  >
                    {statusLabels[job.status] || job.status || 'Chưa xác định'}
                  </span>
                </td>
                <td className="px-4 py-5 text-sm font-medium text-slate-600">
                  {job.createdAt
                    ? new Date(job.createdAt).toLocaleDateString('vi-VN')
                    : 'Chưa cập nhật'}
                </td>
                <td className="px-6 py-5">
                  <div className="flex items-center justify-end gap-2">
                    <Link
                      href={`/jobs/${job.id}`}
                      aria-label={`Xem ${job.title}`}
                      className="rounded-lg p-2 text-blue-600 transition-colors hover:bg-blue-50"
                      title="Xem tin"
                    >
                      <Eye className="h-4 w-4" />
                    </Link>

                    <Link
                      href={`/recruiter/manage-jobs/${job.id}/update`}
                      aria-label={`Chỉnh sửa ${job.title}`}
                      className="rounded-lg p-2 text-amber-600 transition-colors hover:bg-amber-50"
                      title="Chỉnh sửa tin"
                    >
                      <Pencil className="h-4 w-4" />
                    </Link>

                    {/* TODO: Enable when a delete-job service is available. */}
                    <button
                      type="button"
                      disabled
                      aria-label={`Xóa ${job.title}`}
                      className="cursor-not-allowed rounded-lg p-2 text-slate-300"
                      title="Chưa có chức năng xóa"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
