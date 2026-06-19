import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getMyApplications, submitApplication, withdrawApplication } from '@/src/services/application.service'

export const useGetMyApplications = (enabled = true) => {
  return useQuery({
    queryKey: ['appliedJobs'],
    queryFn: getMyApplications,
    enabled,
  })
}

export const useSubmitApplication = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: submitApplication,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appliedJobs'] })
    },
  })
}

export const useWithdrawApplication = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: withdrawApplication,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appliedJobs'] })
    },
  })
}
