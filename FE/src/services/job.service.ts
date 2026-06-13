import { api } from '@/src/lib/axios';
import { SavedJobResponse } from '../types/job.type';
import { ApiResponse } from '../types/api';

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

export const getSavedJobs = async (page = 0, size = 100): Promise<SavedJobResponse[]> => {
  const response = await api.get<ApiResponse<PageResponse<SavedJobResponse>>>(`/saved-jobs?page=${page}&size=${size}`);
  return response.data?.data?.content || [];
};
