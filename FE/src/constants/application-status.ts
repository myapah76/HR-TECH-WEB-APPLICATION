import { ApplicationStatus } from '@/src/types'

/**
 * Cấu hình hiển thị thống nhất cho từng ApplicationStatus.
 * Đây là nguồn sự thật duy nhất (single source of truth) – không khai báo lại ở nơi khác.
 */
export const APPLICATION_STATUS_CONFIG: Record<
  ApplicationStatus,
  {
    label: string
    color: string
    bg: string
    border: string
    dot: string
  }
> = {
  [ApplicationStatus.SUBMITTED]: {
    label: 'Mới nộp',
    color: 'text-blue-700',
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    dot: 'bg-blue-500',
  },
  [ApplicationStatus.SCORED]: {
    label: 'Đã chấm điểm',
    color: 'text-violet-700',
    bg: 'bg-violet-50',
    border: 'border-violet-200',
    dot: 'bg-violet-500',
  },
  [ApplicationStatus.PENDING_INTERVIEW_SCHEDULE]: {
    label: 'CHỜ LỊCH PHỎNG VẤN',
    color: 'text-orange-700',
    bg: 'bg-orange-50',
    border: 'border-orange-200',
    dot: 'bg-orange-500',
  },
  [ApplicationStatus.CANDIDATE_REQUESTED_INTERVIEW_RESCHEDULE]: {
    label: 'ỨNG VIÊN XIN ĐỔI LỊCH',
    color: 'text-cyan-700',
    bg: 'bg-cyan-50',
    border: 'border-cyan-200',
    dot: 'bg-cyan-500',
  },
  [ApplicationStatus.INTERVIEW]: {
    label: 'PHỎNG VẤN',
    color: 'text-indigo-700',
    bg: 'bg-indigo-50',
    border: 'border-indigo-200',
    dot: 'bg-indigo-500',
  },
  [ApplicationStatus.INTERVIEW_COMPLETED]: {
    label: 'ĐÃ PHỎNG VẤN',
    color: 'text-teal-700',
    bg: 'bg-teal-50',
    border: 'border-teal-200',
    dot: 'bg-teal-500',
  },
  [ApplicationStatus.NO_SHOW]: {
    label: 'KHÔNG THAM GIA',
    color: 'text-gray-700',
    bg: 'bg-gray-100',
    border: 'border-gray-200',
    dot: 'bg-gray-500',
  },
  [ApplicationStatus.ACCEPTED]: {
    label: 'ĐÃ NHẬN',
    color: 'text-green-700',
    bg: 'bg-green-50',
    border: 'border-green-200',
    dot: 'bg-green-500',
  },
  [ApplicationStatus.REJECTED]: {
    label: 'TỪ CHỐI',
    color: 'text-rose-700',
    bg: 'bg-rose-50',
    border: 'border-rose-200',
    dot: 'bg-rose-500',
  },
  [ApplicationStatus.WITHDRAWN]: {
    label: 'Đã rút',
    color: 'text-slate-600',
    bg: 'bg-slate-100',
    border: 'border-slate-200',
    dot: 'bg-slate-400',
  },
}
