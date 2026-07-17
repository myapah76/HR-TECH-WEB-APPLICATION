import dayjs from 'dayjs'
import 'dayjs/locale/vi'

dayjs.locale('vi')

export const formatDateForInput = (dateString: string | Date): string => {
  if (!dateString) return ''
  const date = new Date(dateString)
  if (isNaN(date.getTime())) return ''
  return date.toISOString().split('T')[0]
}

export const formatDateForDisplay = (dateString: string | Date): string => {
  if (!dateString) return ''
  const date = new Date(dateString)
  if (isNaN(date.getTime())) return ''
  return dayjs(date).format('DD/MM/YYYY')
}

export const dateInputToInstant = (dateString: string): string => {
  if (!dateString) return ''

  const [year, month, day] = dateString.split('-').map(Number)
  if (!year || !month || !day) return ''

  const localEndOfDay = new Date(year, month - 1, day, 23, 59, 59, 999)
  if (isNaN(localEndOfDay.getTime())) return ''

  return localEndOfDay.toISOString()
}

export const displayDateToInstant = (dateString: string): string => {
  if (!dateString) return ''

  const [day, month, year] = dateString.split('/').map(Number)
  if (!day || !month || !year) return ''

  const localDate = new Date(year, month - 1, day, 23, 59, 59, 999)
  if (isNaN(localDate.getTime())) return ''

  return localDate.toISOString()
}

export function formatDate(dateStr: string | number | Date | null | undefined): string {
  if (!dateStr) return ''
  return dayjs(dateStr).format('DD/MM/YYYY')
}

export function formatDateTime(dateStr: string | number | Date | null | undefined): string {
  if (!dateStr) return ''
  return dayjs(dateStr).format('HH:mm - DD/MM/YYYY')
}

export const getRelativeTime = (dateStr: string | number | Date | null | undefined): string => {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  if (diffMs < 0) return 'Vừa xong'

  const diffMins = Math.floor(diffMs / (1000 * 60))
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffMins < 60) return `${Math.max(1, diffMins)} phút`
  if (diffHours < 24) return `${diffHours} giờ`
  return `${diffDays} ngày`
}

export const getRelativeUrgency = (dateStr: string | number | Date | null | undefined) => {
  if (!dateStr) {
    return {
      label: 'Không xác định',
      badgeClass: 'bg-slate-100 text-slate-700 border-slate-200/80',
      borderClass: 'border-slate-200/50',
    }
  }
  const date = new Date(dateStr)
  const now = new Date()
  const diffHours = (date.getTime() - now.getTime()) / (1000 * 60 * 60)

  if (diffHours < 0) {
    return {
      label: 'Đã diễn ra',
      badgeClass: 'bg-slate-100 text-slate-700 border-slate-200/80',
      borderClass: 'border-slate-200/50',
    }
  }
  if (diffHours <= 24) {
    return {
      label: 'Gần đến (Trong 24h)',
      badgeClass: 'bg-rose-50 text-rose-700 border-rose-100 animate-pulse',
      borderClass: 'border-rose-200 bg-rose-50/10 shadow-[0_0_12px_rgba(244,63,94,0.04)]',
    }
  }
  if (diffHours <= 72) {
    return {
      label: 'Gần đến (Trong 3 ngày)',
      badgeClass: 'bg-amber-50 text-amber-700 border-amber-100',
      borderClass: 'border-amber-200 bg-amber-50/5',
    }
  }
  return {
    label: 'Sắp đến',
    badgeClass: 'bg-indigo-50 text-indigo-700 border-indigo-100',
    borderClass: 'border-indigo-100 bg-indigo-50/5',
  }
}

