import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  getJobsForAdmin,
  deleteJobForAdmin,
  adminApproveJob,
  adminRejectJob,
  adminCloseJob,
  AdminJobsParams,
} from '@/src/services/admin-job.service'

export const useGetAdminJobs = (params?: AdminJobsParams) => {
  return useQuery({
    queryKey: ['admin-jobs', params],
    queryFn: () => getJobsForAdmin(params),
  })
}

export const useApproveJobAdmin = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => adminApproveJob(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-jobs'] })
    },
  })
}

export const useRejectJobAdmin = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => adminRejectJob(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-jobs'] })
    },
  })
}

export const useCloseJobAdmin = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => adminCloseJob(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-jobs'] })
    },
  })
}

export const useDeleteJobForAdmin = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deleteJobForAdmin(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-jobs'] })
    },
  })
}
