/**
 * Helper to format job salaries dynamically.
 *
 * Examples:
 * - formatSalary(10000000, 20000000) => "10tr - 20tr/tháng"
 * - formatSalary(50000, 200000, 'HOURLY') => "50k - 200k/giờ"
 * - formatSalary(null, null) => "Thỏa thuận"
 */
export function formatSalary(
  min: number | undefined | null,
  max: number | undefined | null,
  salaryType?: string | null
): string {
  if (!min && !max) return 'Thỏa thuận'

  const minVal = min || 0
  const maxVal = max || 0

  // Hourly salary (PART_TIME with HOURLY type)
  if (salaryType === 'HOURLY') {
    const formatK = (val: number) => {
      if (val >= 1000) return `${(val / 1000).toFixed(0)}k`
      return `${val}`
    }
    if (minVal && maxVal) return `${formatK(minVal)} - ${formatK(maxVal)}/giờ`
    if (minVal) return `Từ ${formatK(minVal)}/giờ`
    return `Đến ${formatK(maxVal)}/giờ`
  }

  // Monthly VND (large numbers > 100,000)
  if (minVal > 100000 || maxVal > 100000) {
    const formatMillions = (val: number) => {
      if (val % 1000000 === 0) {
        return `${val / 1000000}tr`
      }
      return `${(val / 1000000).toFixed(1).replace('.0', '')}tr`
    }

    if (minVal && maxVal) return `${formatMillions(minVal)} - ${formatMillions(maxVal)}/tháng`
    if (minVal) return `Từ ${formatMillions(minVal)}/tháng`
    return `Đến ${formatMillions(maxVal)}/tháng`
  }

  // USD (small numbers <= 100,000)
  if (minVal && maxVal) return `$${minVal.toLocaleString()} - $${maxVal.toLocaleString()}`
  if (minVal) return `Từ $${minVal.toLocaleString()}`
  return `Đến $${maxVal.toLocaleString()}`
}


export function formatVND(value: unknown): string {
  if (value === undefined || value === null || value === '') return ''
  const cleanValue = String(value).replace(/\D/g, '')
  if (!cleanValue) return ''
  return Number(cleanValue).toLocaleString('vi-VN')
}

export function parseVND(value: string): string {
  return value.replace(/\D/g, '')
}
