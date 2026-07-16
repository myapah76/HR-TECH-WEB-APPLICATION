import { useMutation, useQueryClient } from '@tanstack/react-query'
import { adminCloseJob } from '@/src/services/admin-job.service'

export const useCloseJobAdmin = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => adminCloseJob(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-jobs'] })
    },
  })
}
