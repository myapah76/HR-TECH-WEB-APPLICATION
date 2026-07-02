import { api } from '@/src/lib/axios'
import { ApiResponse, PageResponse } from '@/src/types/api'
import { CompanyResponse } from '@/src/types/company'

export const getCompaniesForAdmin = async (
  keyword?: string,
  page = 0,
  size = 10
): Promise<PageResponse<CompanyResponse>> => {
  const response = await api.get<ApiResponse<PageResponse<CompanyResponse>>>(
    '/admin/companies',
    {
      params: { keyword, page, size },
    }
  )
  return response.data.data
}

export const approveCompany = async (id: string): Promise<CompanyResponse> => {
  const response = await api.put<ApiResponse<CompanyResponse>>(`/admin/companies/${id}/approve`)
  return response.data.data
}

export const rejectCompany = async (id: string): Promise<CompanyResponse> => {
  const response = await api.put<ApiResponse<CompanyResponse>>(`/admin/companies/${id}/reject`)
  return response.data.data
}

export const deleteCompanyForAdmin = async (id: string): Promise<void> => {
  await api.delete<ApiResponse<void>>(`/admin/companies/${id}`)
}

export const restoreCompany = async (id: string): Promise<CompanyResponse> => {
  const response = await api.put<ApiResponse<CompanyResponse>>(`/admin/companies/${id}/restore`)
  return response.data.data
}
