import { api } from '@/src/lib/axios'
import {
  CreateJobRequest,
  Job,
  ManageJobsParams,
  JobStatusAction,
  JobSearchParams,
  LandingStatsResponse,
  HotPosition,
  RecruiterJobStatsResponse,
} from '@/src/types/job'
import { ApiResponse, PageResponse } from '../types/api'
import { TrendingSkill } from '@/src/types/skill'

export const getJobs = async (page = 0, size = 10): Promise<PageResponse<Job>> => {
  const response = await api.get<ApiResponse<PageResponse<Job>>>(`/jobs`, {
    params: { page, size },
  })

  return response.data.data
}

export const searchJobs = async (params: JobSearchParams): Promise<PageResponse<Job>> => {
  const {
    page = 0,
    size = 10,
    keyword,
    location,
    jobType,
    experienceLevel,
    salaryMin,
    salaryMax,
    skills,
    sort,
  } = params

  // Build query params, only include non-empty values
  const queryParams = new URLSearchParams()
  queryParams.set('page', String(page))
  queryParams.set('size', String(size))
  if (keyword?.trim()) queryParams.set('keyword', keyword.trim())
  if (location?.trim()) queryParams.set('location', location.trim())
  if (jobType) queryParams.set('jobType', jobType)
  if (experienceLevel) queryParams.set('experienceLevel', experienceLevel)
  if (salaryMin !== undefined && salaryMin >= 0) queryParams.set('salaryMin', String(salaryMin))
  if (salaryMax !== undefined && salaryMax >= 0) queryParams.set('salaryMax', String(salaryMax))
  if (skills && skills.length > 0) {
    skills.forEach((skill) => queryParams.append('skills', skill))
  }
  if (sort) queryParams.set('sort', sort)

  const response = await api.get<ApiResponse<PageResponse<Job>>>(
    `/jobs/search?${queryParams.toString()}`
  )
  return response.data.data
}

export const getSavedJobs = async (page = 0, size = 100): Promise<Job[]> => {
  const response = await api.get<ApiResponse<PageResponse<Job>>>('/saved-jobs', {
    params: { page, size },
  })
  return response.data.data.content || []
}

export const saveJob = async (jobId: string): Promise<void> => {
  await api.post<ApiResponse<void>>(`/saved-jobs/${jobId}`)
}

export const unsaveJob = async (jobId: string): Promise<void> => {
  await api.delete<ApiResponse<void>>(`/saved-jobs/${jobId}`)
}

export const getJobById = async (id: string): Promise<Job> => {
  const response = await api.get<ApiResponse<Job>>(`/jobs/${id}`)
  return response.data.data
}

export const getManageJobs = async (
  companyId: string,
  params?: ManageJobsParams
): Promise<PageResponse<Job>> => {
  if (params?.experienceLevel) {
    const { page = 0, size = 10, experienceLevel, ...serverParams } = params
    const firstPage = await api.get<ApiResponse<PageResponse<Job>>>(
      `/recruiter/companies/${companyId}/jobs`,
      { params: { ...serverParams, page: 0, size: 100 } }
    )
    const allJobs = [...firstPage.data.data.content]

    const totalPagesVal = firstPage.data.data.page?.totalPages ?? 0
    for (let nextPage = 1; nextPage < totalPagesVal; nextPage += 1) {
      const response = await api.get<ApiResponse<PageResponse<Job>>>(
        `/recruiter/companies/${companyId}/jobs`,
        { params: { ...serverParams, page: nextPage, size: 100 } }
      )
      allJobs.push(...response.data.data.content)
    }

    const filteredJobs = allJobs.filter((job) => job.experienceLevel === experienceLevel)
    const start = page * size

    return {
      content: filteredJobs.slice(start, start + size),
      page: {
        totalElements: filteredJobs.length,
        totalPages: Math.ceil(filteredJobs.length / size),
        size,
        number: page,
      },
    }
  }

  const response = await api.get<ApiResponse<PageResponse<Job>>>(
    `/recruiter/companies/${companyId}/jobs`,
    {
      params,
    }
  )
  return response.data.data
}

export const createJob = async (data: CreateJobRequest): Promise<Job> => {
  const companyId = data.companyId
  const response = await api.post<ApiResponse<Job>>(`/recruiter/companies/${companyId}/jobs`, data)
  return response.data.data
}

export const duplicateJob = async (jobId: string, companyId: string): Promise<Job> => {
  const response = await api.post<ApiResponse<Job>>(
    `/recruiter/companies/${companyId}/jobs/${jobId}/duplicate`
  )
  return response.data.data
}

export const updateJob = async (id: string, data: CreateJobRequest): Promise<Job> => {
  const companyId = data.companyId
  const response = await api.put<ApiResponse<Job>>(
    `/recruiter/companies/${companyId}/jobs/${id}`,
    data
  )
  return response.data.data
}

export const updateJobStatus = async (
  jobId: string,
  action: JobStatusAction,
  companyId: string,
  reason?: string
): Promise<Job> => {
  const response = await api.put<ApiResponse<Job>>(
    `/recruiter/companies/${companyId}/jobs/${jobId}/${action}`,
    undefined,
    {
      params: reason ? { reason } : undefined,
    }
  )
  return response.data.data
}

export const deleteJob = async (jobId: string, companyId: string): Promise<void> => {
  await api.delete<ApiResponse<void>>(`/recruiter/companies/${companyId}/jobs/${jobId}`)
}

export const getLandingStats = async (): Promise<LandingStatsResponse> => {
  const response = await api.get<ApiResponse<LandingStatsResponse>>('/jobs/landing-stats')
  return response.data.data
}

export const getTrendingSkills = async (limit = 8): Promise<TrendingSkill[]> => {
  const response = await api.get<ApiResponse<TrendingSkill[]>>(`/jobs/trending-skills`, {
    params: { limit },
  })
  return response.data.data
}

export const getHotPositions = async (limit = 6): Promise<HotPosition[]> => {
  const response = await api.get<ApiResponse<HotPosition[]>>('/jobs/hot-positions', {
    params: { limit },
  })
  return response.data.data
}

export const appealJob = async (id: string, companyId: string): Promise<Job> => {
  const response = await api.put<ApiResponse<Job>>(
    `/recruiter/companies/${companyId}/jobs/${id}/appeal`
  )
  return response.data.data
}

export const getRecruiterJobStats = async (
  companyId: string
): Promise<RecruiterJobStatsResponse> => {
  const response = await api.get<ApiResponse<RecruiterJobStatsResponse>>(
    `/recruiter/companies/${companyId}/jobs/stats`
  )
  return response.data.data
}
