import { api } from '@/src/lib/axios'
import { ApiResponse, PageResponse } from '@/src/types/api'
import {
  AddMemberRequest,
  CompanyMemberResponse,
  CompanyResponse,
  CompanyUpdateRequest,
  GetCompaniesParams,
  RecruiterActiveJob,
  RecruiterAnalyticsResponse,
  RecruiterDashboardSummary,
  RecruiterUpcomingInterview,
  TopCompany,
} from '@/src/types/company'

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

export const updateCompany = async (
  id: string,
  request: CompanyUpdateRequest
): Promise<CompanyResponse> => {
  const response = await api.put<ApiResponse<CompanyResponse>>(`/companies/${id}`, request)
  return response.data.data
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

// ─── Dashboard API calls ─────────────────────────────────────────────────────

export const getRecruiterDashboardSummary = async (): Promise<RecruiterDashboardSummary> => {
  const response = await api.get<ApiResponse<RecruiterDashboardSummary>>('/applications/recruiter/dashboard/summary')
  return response.data.data
}

export const getRecruiterUpcomingInterviews = async (): Promise<RecruiterUpcomingInterview[]> => {
  const response = await api.get<ApiResponse<RecruiterUpcomingInterview[]>>('/applications/recruiter/dashboard/upcoming-interviews')
  return response.data.data
}

export const getRecruiterActiveJobs = async (): Promise<RecruiterActiveJob[]> => {
  const response = await api.get<ApiResponse<RecruiterActiveJob[]>>('/jobs/recruiter/dashboard/active-jobs')
  return response.data.data
}

export const getRecruiterAnalytics = async (): Promise<RecruiterAnalyticsResponse> => {
  const response = await api.get<ApiResponse<RecruiterAnalyticsResponse>>('/applications/recruiter/dashboard/analytics')
  return response.data.data
}
