import { useMutation, useQueryClient } from '@tanstack/react-query'
import { scoreApplication } from '@/src/services/application.service'

export const useScoreApplication = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: scoreApplication,
    onSuccess: (data, id) => {
      // Invalidate both candidate and recruiter list/details queries
      queryClient.invalidateQueries({ queryKey: ['appliedJobs'] })
      queryClient.invalidateQueries({ queryKey: ['applications'] })
      queryClient.invalidateQueries({ queryKey: ['application', id] })
    },
  })
}
