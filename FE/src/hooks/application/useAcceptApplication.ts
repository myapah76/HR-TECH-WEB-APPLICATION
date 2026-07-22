import { useMutation, useQueryClient } from '@tanstack/react-query'
import { acceptApplication } from '@/src/services/application.service'
import { toast } from 'sonner'

export const useAcceptApplication = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => acceptApplication(id),
    onSuccess: (_data, id) => {
      toast.success('Đã duyệt hồ sơ ứng tuyển thành công!')
      queryClient.invalidateQueries({ queryKey: ['applications'] })
      queryClient.invalidateQueries({ queryKey: ['application', id] })
      queryClient.invalidateQueries({ queryKey: ['manageJobs'] })
      queryClient.invalidateQueries({ queryKey: ['recruiter-job-stats'] })
    }
  })
}
