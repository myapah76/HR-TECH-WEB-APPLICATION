import { api } from '@/src/lib/axios'
import { ApiResponse, PageResponse } from '@/src/types/api'
import { Job } from '@/src/types/job'

export interface AdminJobsParams {
  keyword?: string
  status?: string
  page?: number
  size?: number
}

export const getJobsForAdmin = async (
  params?: AdminJobsParams
): Promise<PageResponse<Job>> => {
  const response = await api.get<ApiResponse<PageResponse<Job>>>(
    '/admin/jobs',
    { params }
  )
  return response.data.data
}

/**
 * Admin state transitions via /api/admin/jobs/{id}/{action}
 *
 * - approve: PENDING_APPROVAL → APPROVED
 * - reject:  PENDING_APPROVAL → REJECTED  (requires reason)
 * - close:   APPROVED → CLOSED
 *
 * NOTE: submit (DRAFT → PENDING_APPROVAL) is the HR's responsibility,
 * not available here.
 */
export const adminApproveJob = async (id: string): Promise<Job> => {
  const response = await api.put<ApiResponse<Job>>(`/admin/jobs/${id}/approve`)
  return response.data.data
}

export const adminRejectJob = async (id: string): Promise<Job> => {
  const response = await api.put<ApiResponse<Job>>(`/admin/jobs/${id}/reject`)
  return response.data.data
}

export const adminCloseJob = async (id: string): Promise<Job> => {
  const response = await api.put<ApiResponse<Job>>(`/admin/jobs/${id}/close`)
  return response.data.data
}

export const deleteJobForAdmin = async (id: string): Promise<void> => {
  await api.delete<ApiResponse<void>>(`/admin/jobs/${id}`)
}
