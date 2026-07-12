import { api } from '@/src/lib/axios'
import { ApiResponse, PageResponse } from '@/src/types/api'

import { CompanyMemberResponse, CompanyResponse, GetCompaniesParams, TopCompany } from '@/src/types/company'

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

export const getTopCompanies = async (limit = 6): Promise<TopCompany[]> => {
  const response = await api.get<ApiResponse<TopCompany[]>>('/companies/top', {
    params: { limit },
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

export interface AddMemberRequest {
  email: string
  fullName: string
  role: string
}

export const addCompanyMember = async (
  companyId: string,
  request: AddMemberRequest
): Promise<CompanyMemberResponse> => {
  const response = await api.post<ApiResponse<CompanyMemberResponse>>(
    `/companies/${companyId}/members`,
    request
  )
  return response.data.data
}

export const removeCompanyMember = async (
  companyId: string,
  memberId: string
): Promise<void> => {
  await api.delete<ApiResponse<void>>(`/companies/${companyId}/members/${memberId}`)
}

export const reactivateCompanyMember = async (
  companyId: string,
  memberId: string,
  resetPassword: boolean
): Promise<void> => {
  await api.post<ApiResponse<void>>(
    `/companies/${companyId}/members/${memberId}/reactivate`,
    null,
    { params: { resetPassword } }
  )
}

export const updateMemberRole = async (
  companyId: string,
  memberId: string,
  role: string
): Promise<void> => {
  await api.patch<ApiResponse<void>>(
    `/companies/${companyId}/members/${memberId}/role`,
    { role }
  )
}
