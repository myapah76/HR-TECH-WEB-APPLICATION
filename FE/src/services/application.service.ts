import { api } from '@/src/lib/axios'
import {
    ApplicationDetailResponse,
    ApplicationStatus,
    ApplicationSummaryResponse,
    ChangeInterviewScheduleRequest,
    ScheduleInterviewRequest,
    SubmitApplicationRequest,
} from '../types'
import { ApiResponse, PageResponse } from '../types/api'
import { getManageJobs } from './job.service'

export const getMyApplications = async (page = 0, size = 10): Promise<PageResponse<ApplicationSummaryResponse>> => {
  const response = await api.get<ApiResponse<PageResponse<ApplicationSummaryResponse>>>('/applications', {
    params: { page, size },
  })
  return response.data.data
}

export const getApplicationsByJob = async (
  jobId: string,
  page = 0,
  size = 10
): Promise<PageResponse<ApplicationSummaryResponse>> => {
  const response = await api.get<ApiResponse<PageResponse<ApplicationSummaryResponse>>>(
    `/applications/jobs/${jobId}`,
    { params: { page, size } }
  )
  return response.data.data
}

export const getCompanyApplications = async (companyId: string): Promise<ApplicationSummaryResponse[]> => {
  const firstPage = await getManageJobs(companyId, { page: 0, size: 100 })
  const jobs = [...firstPage.content]

  for (let page = 1; page < firstPage.totalPages; page += 1) {
    const nextPage = await getManageJobs(companyId, { page, size: 100 })
    jobs.push(...nextPage.content)
  }

  const applicationsByJob = await Promise.all(
    jobs.map((job) => getApplicationsByJob(job.id, 0, 100).then((res) => res.content))
  )
  return applicationsByJob.flat()
}

export const getCompanyApplicationCount = async (companyId: string): Promise<number> => {
  const apps = await getCompanyApplications(companyId)
  const applicationIds = new Set(apps.map((application) => application.id))
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

export const acceptInterviewSchedule = async (applicationId: string): Promise<ApplicationSummaryResponse> => {
  const response = await api.post<ApiResponse<ApplicationSummaryResponse>>(
    `/applications/${applicationId}/interview-schedule/accept`
  )
  return response.data.data
}

export const changeInterviewSchedule = async (
  applicationId: string,
  request: ChangeInterviewScheduleRequest
): Promise<ApplicationSummaryResponse> => {
  const response = await api.post<ApiResponse<ApplicationSummaryResponse>>(
    `/applications/${applicationId}/interview-schedule/change`,
    request
  )
  return response.data.data
}

export const acceptCandidateReschedule = async (applicationId: string): Promise<ApplicationSummaryResponse> => {
  const response = await api.post<ApiResponse<ApplicationSummaryResponse>>(
    `/applications/${applicationId}/interview-schedule/reschedule/accept`
  )
  return response.data.data
}

export const rejectCandidateReschedule = async (applicationId: string): Promise<ApplicationSummaryResponse> => {
  const response = await api.post<ApiResponse<ApplicationSummaryResponse>>(
    `/applications/${applicationId}/interview-schedule/reschedule/reject`
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

export const checkHasApplied = async (jobId: string): Promise<boolean> => {
  const response = await api.get<ApiResponse<boolean>>('/applications/check', {
    params: { jobId },
  })
  return response.data.data
}
