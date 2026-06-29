/**
 * Helper to format job salaries dynamically for both VND and USD.
 *
 * Examples:
 * - formatSalary(10000000, 20000000) => "10tr - 20tr"
 * - formatSalary(15500000, 25000000) => "15.5tr - 25tr"
 * - formatSalary(1000, 2500) => "$1,000 - $2,500"
 * - formatSalary(null, null) => "Thỏa thuận"
 */
export function formatSalary(min: number | undefined | null, max: number | undefined | null): string {
  if (!min && !max) return 'Thỏa thuận'

  const minVal = min || 0
  const maxVal = max || 0

  // Check if it's VND (large numbers > 100,000)
  if (minVal > 100000 || maxVal > 100000) {
    const formatMillions = (val: number) => {
      if (val % 1000000 === 0) {
        return `${val / 1000000}tr`
      }
      return `${(val / 1000000).toFixed(1).replace('.0', '')}tr`
    }

    if (minVal && maxVal) return `${formatMillions(minVal)} - ${formatMillions(maxVal)}`
    if (minVal) return `Từ ${formatMillions(minVal)}`
    return `Đến ${formatMillions(maxVal)}`
  }

  // If it's USD (small numbers <= 100,000)
  if (minVal && maxVal) return `$${minVal.toLocaleString()} - $${maxVal.toLocaleString()}`
  if (minVal) return `Từ $${minVal.toLocaleString()}`
  return `Đến $${maxVal.toLocaleString()}`
}
