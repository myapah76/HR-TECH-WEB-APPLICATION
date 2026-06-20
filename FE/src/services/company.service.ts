import { api } from '@/src/lib/axios'
import { ApiResponse } from '@/src/types/api'

import { CompanyResponse } from '@/src/types/company'

export const getMyCompany = async (): Promise<ApiResponse<CompanyResponse>> => {
  const response = await api.get<ApiResponse<CompanyResponse>>('/companies/my-company')
  return response.data
}
