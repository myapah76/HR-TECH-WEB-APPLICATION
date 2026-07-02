import { api } from '@/src/lib/axios'
import { PublicSystemConfigResponse, SystemConfigRequest, SystemConfigResponse } from '@/src/types/system'
import { ApiResponse } from '@/src/types/api'

export const getSystemConfig = async (): Promise<SystemConfigResponse> => {
  const response = await api.get<ApiResponse<SystemConfigResponse>>('/system/configs')
  return response.data.data
}

export const getPublicSystemConfig = async (): Promise<PublicSystemConfigResponse> => {
  const response = await api.get<ApiResponse<PublicSystemConfigResponse>>('/system/configs/public')
  return response.data.data
}

export const updateSystemConfig = async (
  data: SystemConfigRequest
): Promise<SystemConfigResponse> => {
  const response = await api.put<ApiResponse<SystemConfigResponse>>('/system/configs', data)
  return response.data.data
}
