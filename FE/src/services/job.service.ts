import axios from 'axios';
import { Job } from '@/src/types/job';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export interface PageResponse<T> {
  content: T[];
  totalPages: number;
  totalElements: number;
  size: number;
  number: number;
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