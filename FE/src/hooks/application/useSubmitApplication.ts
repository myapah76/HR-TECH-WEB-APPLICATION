import { useMutation, useQueryClient } from '@tanstack/react-query'
import { submitApplication } from '@/src/services/application.service'

export const useSubmitApplication = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: submitApplication,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appliedJobs'] })
    },
  })
}
