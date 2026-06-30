import { api } from '@/src/lib/axios'
import { ApiResponse } from '../types/api'
import {
  ApplicationSummaryResponse,
  ApplicationDetailResponse,
  ApplicationStatus,
  RejectInterviewScheduleRequest,
  ScheduleInterviewRequest,
  SubmitApplicationRequest,
} from '../types'
import { getManageJobs } from './job.service'

export const getMyApplications = async (): Promise<ApplicationSummaryResponse[]> => {
  const response = await api.get<ApiResponse<ApplicationSummaryResponse[]>>('/applications')
  return response.data.data
}

export const getApplicationsByJob = async (jobId: string): Promise<ApplicationSummaryResponse[]> => {
  const response = await api.get<ApiResponse<ApplicationSummaryResponse[]>>(`/applications/jobs/${jobId}`)
  return response.data.data
}

export const getCompanyApplicationCount = async (companyId: string): Promise<number> => {
  const firstPage = await getManageJobs(companyId, { page: 0, size: 100 })
  const jobs = [...firstPage.content]

  for (let page = 1; page < firstPage.totalPages; page += 1) {
    const nextPage = await getManageJobs(companyId, { page, size: 100 })
    jobs.push(...nextPage.content)
  }

  const applicationsByJob = await Promise.all(
    jobs.map((job) => getApplicationsByJob(job.id))
  )
  const applicationIds = new Set(
    applicationsByJob.flat().map((application) => application.id)
  )

  return applicationIds.size
}

export const getApplicationDetail = async (id: string): Promise<ApplicationDetailResponse> => {
  const response = await api.get<ApiResponse<ApplicationDetailResponse>>(`/applications/${id}`)
  return response.data.data
}

export const updateApplicationStatus = async (
  id: string,
  status: ApplicationStatus
): Promise<ApplicationSummaryResponse> => {
  const response = await api.put<ApiResponse<ApplicationSummaryResponse>>(
    `/applications/${id}/status?status=${status}`
  )
  return response.data.data
}

export const scheduleInterview = async (
  id: string,
  request: ScheduleInterviewRequest
): Promise<ApplicationSummaryResponse> => {
  const response = await api.put<ApiResponse<ApplicationSummaryResponse>>(
    `/applications/${id}/interview-schedule`,
    request
  )
  return response.data.data
}

export const rejectInterviewSchedule = async (
  token: string,
  request: RejectInterviewScheduleRequest
): Promise<ApplicationSummaryResponse> => {
  const response = await api.post<ApiResponse<ApplicationSummaryResponse>>(
    `/applications/interview-schedule/reject?token=${encodeURIComponent(token)}`,
    request
  )
  return response.data.data
}

export const acceptInterviewSchedule = async (token: string): Promise<ApplicationSummaryResponse> => {
  const response = await api.post<ApiResponse<ApplicationSummaryResponse>>(
    `/applications/interview-schedule/accept?token=${encodeURIComponent(token)}`
  )
  return response.data.data
}

export const submitApplication = async (request: SubmitApplicationRequest): Promise<ApplicationSummaryResponse> => {
  const response = await api.post<ApiResponse<ApplicationSummaryResponse>>('/applications', request)
  return response.data.data
}

export const withdrawApplication = async (id: string): Promise<void> => {
  await api.put<ApiResponse<void>>(`/applications/${id}/withdraw`)
}
