import { ApplicationStatus } from '@/src/types'

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
  [ApplicationStatus.INTERVIEW]: {
    label: 'Đang phỏng vấn',
    color: 'text-indigo-700',
    bg: 'bg-indigo-50',
    border: 'border-indigo-200',
    dot: 'bg-indigo-500',
  },
  [ApplicationStatus.ACCEPTED]: {
    label: 'ĐÃ TRÚNG TUYỂN',
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
