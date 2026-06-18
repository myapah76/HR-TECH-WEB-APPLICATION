import { getJobs, getJobById, getSavedJobs, saveJob, unsaveJob } from '@/src/services/job.service'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

export const useGetJobs = (page: number, size: number) => {
  return useQuery({
    queryKey: ['jobs', page, size],
    queryFn: () => getJobs(page, size),
  })
}

export const useGetJobById = (id: string, enabled = true) => {
  return useQuery({
    queryKey: ['job', id],
    queryFn: () => getJobById(id),
    enabled: enabled && !!id,
  })
}

export const useGetSavedJobs = (enabled = true) => {
  return useQuery({
    queryKey: ['savedJobs'],
    queryFn: () => getSavedJobs(),
    enabled,
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


