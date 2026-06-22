import { api } from '@/src/lib/axios'
import { ApiResponse } from '@/src/types/api'

import { CompanyResponse } from '@/src/types/company'

export const getMyCompany = async (): Promise<ApiResponse<CompanyResponse>> => {
  const response = await api.get<ApiResponse<CompanyResponse>>('/companies/my-company')
  return response.data
}

export interface GetCompaniesParams {
  keyword?: string
  page?: number
  size?: number
}

export interface PageResponse<T> {
  content: T[]
  totalPages: number
  totalElements: number
  size: number
  number: number
  first: boolean
  last: boolean
}

export const getCompanies = async (
  params?: GetCompaniesParams
): Promise<ApiResponse<PageResponse<CompanyResponse>>> => {
  const response = await api.get<ApiResponse<PageResponse<CompanyResponse>>>('/companies', { params })
  return response.data
}

