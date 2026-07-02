import { api } from '@/src/lib/axios'
import { ApiResponse, PageResponse } from '@/src/types/api'

import { CompanyMemberResponse, CompanyResponse, GetCompaniesParams } from '@/src/types/company'

export const getMyCompany = async (): Promise<CompanyResponse> => {
  const response = await api.get<ApiResponse<CompanyResponse>>('/companies/my-company')
  return response.data.data
}

export const getCompanies = async (
  params?: GetCompaniesParams
): Promise<PageResponse<CompanyResponse>> => {
  const response = await api.get<ApiResponse<PageResponse<CompanyResponse>>>('/companies', {
    params,
  })
  return response.data.data
}

export const getCompanyMembers = async (companyId: string): Promise<CompanyMemberResponse[]> => {
  const response = await api.get<ApiResponse<CompanyMemberResponse[]>>(
    `/companies/${companyId}/members`
  )
  return response.data.data
}

export interface CompanyUpdateRequest {
  name: string
  description?: string
  logoUrl?: string
  website?: string
  industry?: string
  size?: string
  address?: string
}

export const updateCompany = async (
  id: string,
  request: CompanyUpdateRequest
): Promise<CompanyResponse> => {
  const response = await api.put<ApiResponse<CompanyResponse>>(`/companies/${id}`, request)
  return response.data.data
}
