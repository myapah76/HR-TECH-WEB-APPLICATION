import axios from 'axios'
import { api } from '@/src/lib/axios'
import { CreateJobRequest, Job } from '@/src/types/job'
import { ApiResponse } from '../types/api'

const API_URL = process.env.NEXT_PUBLIC_API_URL

export interface PageResponse<T> {
  content: T[]
  totalPages: number
  totalElements: number
  size: number
  number: number
  first: boolean
  last: boolean
}

export interface ManageJobsParams {
  status?: string
  jobType?: string
  experienceLevel?: string
  page?: number
  size?: number
}

export type JobStatusAction = 'submit' | 'approve' | 'reject' | 'close'

export interface JobSearchParams {
  keyword?: string
  location?: string
  jobType?: string
  experienceLevel?: string
  salaryMin?: number
  salaryMax?: number
  page?: number
  size?: number
}

export const getJobs = async (page = 0, size = 10): Promise<PageResponse<Job>> => {
  const response = await axios.get(`${API_URL}/jobs?page=${page}&size=${size}`)

  return response.data.data
}

export const searchJobs = async (params: JobSearchParams): Promise<PageResponse<Job>> => {
  const { page = 0, size = 10, keyword, location, jobType, experienceLevel, salaryMin, salaryMax } = params

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

  const response = await axios.get(`${API_URL}/jobs/search?${queryParams.toString()}`)
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
  const response = await axios.get(`${API_URL}/jobs/${id}`)
  return response.data.data
}

export const getManageJobs = async (
  companyId: string,
  params?: ManageJobsParams
): Promise<PageResponse<Job>> => {
  if (params?.experienceLevel) {
    const { page = 0, size = 10, experienceLevel, ...serverParams } = params
    const firstPage = await api.get<ApiResponse<PageResponse<Job>>>(
      `/companies/${companyId}/jobs`,
      { params: { ...serverParams, page: 0, size: 100 } }
    )
    const allJobs = [...firstPage.data.data.content]

    for (let nextPage = 1; nextPage < firstPage.data.data.totalPages; nextPage += 1) {
      const response = await api.get<ApiResponse<PageResponse<Job>>>(
        `/companies/${companyId}/jobs`,
        { params: { ...serverParams, page: nextPage, size: 100 } }
      )
      allJobs.push(...response.data.data.content)
    }

    const filteredJobs = allJobs.filter((job) => job.experienceLevel === experienceLevel)
    const start = page * size

    return {
      ...firstPage.data.data,
      content: filteredJobs.slice(start, start + size),
      totalElements: filteredJobs.length,
      totalPages: Math.ceil(filteredJobs.length / size),
      size,
      number: page,
      first: page === 0,
      last: page >= Math.max(Math.ceil(filteredJobs.length / size) - 1, 0),
    }
  }

  const response = await api.get<ApiResponse<PageResponse<Job>>>(
    `/companies/${companyId}/jobs`,
    { params }
  )
  return response.data.data
}

export const createJob = async (data: CreateJobRequest): Promise<Job> => {
  const response = await api.post<ApiResponse<Job>>('/jobs', data)
  return response.data.data
}

export const updateJob = async (id: string, data: CreateJobRequest): Promise<Job> => {
  const response = await api.put<ApiResponse<Job>>(`/jobs/${id}`, data)
  return response.data.data
}

export const updateJobStatus = async (
  jobId: string,
  action: JobStatusAction
): Promise<Job> => {
  const response = await api.put<ApiResponse<Job>>(`/jobs/${jobId}/${action}`)
  return response.data.data
}
