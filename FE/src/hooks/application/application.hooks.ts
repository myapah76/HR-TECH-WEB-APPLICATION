import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  submitApplication,
  getMyApplications,
  SubmitApplicationRequest,
} from '@/src/services/application.service'

export const useSubmitApplication = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (request: SubmitApplicationRequest) => submitApplication(request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-applications'] })
    },
  })
}

export const useGetMyApplications = (enabled = true) => {
  return useQuery({
    queryKey: ['my-applications'],
    queryFn: () => getMyApplications(),
    enabled,
  })
}
