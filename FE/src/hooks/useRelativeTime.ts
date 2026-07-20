import { useState, useEffect, useCallback } from 'react'
import { calcTimeAgo } from '@/src/utils'

export function useRelativeTime(dateStr: string, intervalMs = 30_000) {
  const compute = useCallback(() => calcTimeAgo(dateStr), [dateStr])
  const [label, setLabel] = useState(() => calcTimeAgo(dateStr))

  useEffect(() => {
    setLabel(compute())
  }, [compute])

  useEffect(() => {
    if (!dateStr) return
    const id = setInterval(() => setLabel(compute()), intervalMs)
    return () => clearInterval(id)
  }, [compute, dateStr, intervalMs])

  return label
}
