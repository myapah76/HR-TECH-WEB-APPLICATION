import { api } from '@/src/lib/axios'
import { ApiResponse } from '@/src/types/api'
import { AdminDashboardSummary } from '@/src/types'

export const getAdminDashboardSummary = async (): Promise<AdminDashboardSummary> => {
  const response = await api.get<ApiResponse<AdminDashboardSummary>>('/admin/dashboard/summary')
  return response.data.data
}
