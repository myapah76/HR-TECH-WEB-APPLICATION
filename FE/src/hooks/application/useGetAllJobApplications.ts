import { useMemo } from 'react'
import { useQueries } from '@tanstack/react-query'
import { getApplicationsByJob } from '@/src/services/application.service'
import { ApplicationSummaryResponse } from '@/src/types'
import type { Job } from '@/src/types/job'

/**
 * Fetch ứng dụng của tất cả jobs song song bằng useQueries.
 * Chỉ enabled khi `enabled` = true (ví dụ: khi không chọn job cụ thể).
 * Kết quả được dedup theo `id`.
 */
export const useGetAllJobApplications = (jobs: Pick<Job, 'id'>[], enabled: boolean) => {
  const queries = useQueries({
    queries: jobs.map((job) => ({
      queryKey: ['applications', 'job', job.id] as const,
      queryFn: (): Promise<ApplicationSummaryResponse[]> =>
        getApplicationsByJob(job.id, 0, 100).then((res) => res.content),
      enabled: enabled && jobs.length > 0,
    })),
  })

  const data = useMemo<ApplicationSummaryResponse[]>(() => {
    const merged = queries.flatMap((q) => (q.data as ApplicationSummaryResponse[]) ?? [])
    const seen = new Set<string>()
    return merged.filter((a) => {
      if (seen.has(a.id)) return false
      seen.add(a.id)
      return true
    })
  }, [queries])

  const isLoading = enabled && jobs.length > 0 && queries.some((q) => q.isLoading)

  return { data, isLoading, queries }
}
