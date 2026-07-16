import { api } from '@/src/lib/axios'
import { ApiResponse } from '@/src/types/api'
import { CloudinarySignatureResponse } from '@/src/types'

export const getCloudinarySignature = async (
  folder: string
): Promise<CloudinarySignatureResponse> => {
  const response = await api.get<ApiResponse<CloudinarySignatureResponse>>(
    `/cloudinary/signature?folder=${folder}`
  )
  return response.data.data
}
