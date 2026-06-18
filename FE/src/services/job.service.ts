import axios from 'axios';
import { api } from '@/src/lib/axios';
import { Job } from '@/src/types/job';
import { ApiResponse } from '../types/api';

const API_URL = process.env.NEXT_PUBLIC_API_URL

export interface PageResponse<T> {
  content: T[]
  totalPages: number
  totalElements: number
  size: number
  number: number
}

export const getJobs = async (
  page = 0,
  size = 10
): Promise<PageResponse<Job>> => {
  const response = await axios.get(
    `${API_URL}/jobs/list?page=${page}&size=${size}`
  );

  return response.data.data;
};

export const getSavedJobs = async (
  page = 0,
  size = 100
): Promise<Job[]> => {
  const response = await api.get<ApiResponse<PageResponse<Job>>>('/saved-jobs', {
    params: { page, size }
  });
  return response.data.data.content || [];
};

export const saveJob = async (jobId: string): Promise<void> => {
  await api.post<ApiResponse<void>>(`/saved-jobs/${jobId}`);
};

export const unsaveJob = async (jobId: string): Promise<void> => {
  await api.delete<ApiResponse<void>>(`/saved-jobs/${jobId}`);
};

export const getJobById = async (id: string): Promise<Job> => {
  const response = await axios.get(`${API_URL}/jobs/${id}`);
  return response.data.data;
};

