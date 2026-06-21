import { getJobs, getJobById, getSavedJobs, saveJob, unsaveJob, createJob } from '@/src/services/job.service'
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
    mutationFn: (data: any) => createJob(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobs'] })
    },
  })
}
