import { useMutation, useQueryClient } from '@tanstack/react-query'
import { rejectApplication } from '@/src/services/application.service'
import { toast } from 'sonner'

export const useRejectApplication = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => rejectApplication(id),
    onSuccess: (_data, id) => {
      toast.success('Đã từ chối hồ sơ ứng tuyển!')
      queryClient.invalidateQueries({ queryKey: ['applications'] })
      queryClient.invalidateQueries({ queryKey: ['application', id] })
      queryClient.invalidateQueries({ queryKey: ['manageJobs'] })
      queryClient.invalidateQueries({ queryKey: ['recruiter-job-stats'] })
    },
  })
}
