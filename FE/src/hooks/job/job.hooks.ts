import {
  getJobs,
  getJobById,
  getManageJobs,
  getSavedJobs,
  saveJob,
  unsaveJob,
  createJob,
  updateJob,
} from '@/src/services/job.service'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

export const useGetJobs = (page: number, size: number) => {
  return useQuery({
    queryKey: ['jobs', page, size],
    queryFn: () => getJobs(page, size),
  })
}

export const useGetJobById = (id: string) => {
  return useQuery({
    queryKey: ['job', id],
    queryFn: () => getJobById(id),
    enabled: !!id,
  })
}

export const useGetManageJobs = (companyId?: string) => {
  return useQuery({
    queryKey: ['manageJobs', companyId],
    queryFn: () => getManageJobs(companyId!),
    enabled: !!companyId,
  })
}

export const useGetSavedJobs = (enable = true) => {
  return useQuery({
    queryKey: ['savedJobs'],
    queryFn: () => getSavedJobs(),
    enabled: enable,
  })
}

export const useSaveJob = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: saveJob,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['savedJobs'] })
    },
  })
}

export const useUnsaveJob = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: unsaveJob,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['savedJobs'] })
    },
  })
}

export const useCreateJobMutation = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: createJob,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobs'] })
      queryClient.invalidateQueries({ queryKey: ['manageJobs'] })
    },
  })
}

export const useUpdateJobMutation = (jobId: string) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: Parameters<typeof updateJob>[1]) => updateJob(jobId, data),
    onSuccess: (updatedJob) => {
      queryClient.setQueryData(['job', jobId], updatedJob)
      queryClient.invalidateQueries({ queryKey: ['jobs'] })
      queryClient.invalidateQueries({ queryKey: ['manageJobs'] })
    },
  })
}
