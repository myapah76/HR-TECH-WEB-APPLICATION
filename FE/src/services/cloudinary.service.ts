import { api } from '@/src/lib/axios'
import { ApiResponse } from '@/src/types/api'

export interface CloudinarySignatureResponse {
  signature: string
  timestamp: number
  apiKey: string
  cloudName: string
}

export const getCloudinarySignature = async (
  folder: string
): Promise<CloudinarySignatureResponse> => {
  const response = await api.get<ApiResponse<CloudinarySignatureResponse>>(
    `/cloudinary/signature?folder=${folder}`
  )
  return response.data.data
}
