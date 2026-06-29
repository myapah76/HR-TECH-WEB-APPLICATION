import dayjs from 'dayjs'
import 'dayjs/locale/vi'

dayjs.locale('vi')

export const formatDateForInput = (dateString: string | Date): string => {
  if (!dateString) return ''
  const date = new Date(dateString)
  if (isNaN(date.getTime())) return ''
  return date.toISOString().split('T')[0]
}

export function formatDate(dateStr: string | number | Date | null | undefined): string {
  if (!dateStr) return ''
  return dayjs(dateStr).format('DD/MM/YYYY')
}

export function formatDateTime(dateStr: string | number | Date | null | undefined): string {
  if (!dateStr) return ''
  return dayjs(dateStr).format('HH:mm - DD/MM/YYYY')
}
