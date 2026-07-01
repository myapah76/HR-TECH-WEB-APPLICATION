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
  const response = await api.get<ApiResponse<PageResponse<CompanyResponse>>>('/companies', { params })
  return response.data.data
}

export const getCompanyMembers = async (companyId: string): Promise<CompanyMemberResponse[]> => {
  const response = await api.get<ApiResponse<CompanyMemberResponse[]>>(
    `/companies/${companyId}/members`
  )
  return response.data.data
}

