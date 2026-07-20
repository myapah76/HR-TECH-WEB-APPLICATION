import { api } from '@/src/lib/axios'
import { ApiResponse, PageResponse } from '@/src/types/api'
import { Job, AdminJobsParams } from '@/src/types/job'

export const getJobReport = async (
  params?: Omit<AdminJobsParams, 'status'>
): Promise<PageResponse<Job>> => {
  const response = await api.get<ApiResponse<PageResponse<Job>>>('/admin/jobs', { params })
  return response.data.data
}

export const adminApproveAppeal = async (id: string): Promise<Job> => {
  const response = await api.put<ApiResponse<Job>>(`/admin/jobs/${id}/approve-appeal`)
  return response.data.data
}

export const adminRejectAppeal = async (id: string, reason: string): Promise<Job> => {
  const response = await api.put<ApiResponse<Job>>(`/admin/jobs/${id}/reject-appeal`, undefined, {
    params: { reason },
  })
  return response.data.data
}
