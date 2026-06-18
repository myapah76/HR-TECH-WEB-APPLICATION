import { apiRaw } from '@/src/lib/axios'
import { ApiResponse } from '@/src/types/api'

export const uploadFile = async (
  file: File,
  folder: string = 'hrtech/companies'
): Promise<ApiResponse<string>> => {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('folder', folder)

  const response = await apiRaw.post('/files/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })
  return response.data
}
