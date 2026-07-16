import { api } from '@/src/lib/axios'
import {
    ApplicationDetailResponse,
    ApplicationSummaryResponse,
    ApplicationStatus,
    ChangeInterviewScheduleRequest,
    ScheduleInterviewRequest,
    SubmitApplicationRequest,
    UpdateApplicationStatusRequest,
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

  const totalPagesVal = firstPage.page?.totalPages ?? 0
  for (let page = 1; page < totalPagesVal; page += 1) {
    const nextPage = await getManageJobs(companyId, { page, size: 100 })
    jobs.push(...nextPage.content)
  }

  const applicationsByJob = await Promise.all(
    jobs.map((job) => getApplicationsByJob(job.id, 0, 100).then((res) => res.content))
  )
  return applicationsByJob.flat()
}

const INTERVIEW_SCHEDULE_STATUSES = new Set<ApplicationStatus>([
  ApplicationStatus.PENDING_INTERVIEW_SCHEDULE,
  ApplicationStatus.CANDIDATE_REQUESTED_INTERVIEW_RESCHEDULE,
  ApplicationStatus.INTERVIEW,
  ApplicationStatus.INTERVIEW_COMPLETED,
  ApplicationStatus.NO_SHOW,
])

export const getRecruiterInterviewSchedules = async (
  companyId: string
): Promise<ApplicationDetailResponse[]> => {
  const applications = await getCompanyApplications(companyId)
  const interviewApplications = applications.filter((application) =>
    INTERVIEW_SCHEDULE_STATUSES.has(application.status)
  )

  const details = await Promise.all(
    interviewApplications.map((application) => getApplicationDetail(application.id))
  )

  return details.sort((a, b) => {
    const timeA = new Date(a.interviewDateTime || a.candidatePreferredInterviewDateTime || a.appliedAt).getTime()
    const timeB = new Date(b.interviewDateTime || b.candidatePreferredInterviewDateTime || b.appliedAt).getTime()
    return timeA - timeB
  })
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
  request: UpdateApplicationStatusRequest
): Promise<ApplicationSummaryResponse> => {
  const response = await api.put<ApiResponse<ApplicationSummaryResponse>>(
    `/applications/${id}/status`,
    request
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
