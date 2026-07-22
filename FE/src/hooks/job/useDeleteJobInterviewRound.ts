import { useMutation, useQueryClient } from '@tanstack/react-query'
import { deleteJobInterviewRound } from '@/src/services/job.service'
import { toast } from 'sonner'

export const useDeleteJobInterviewRound = (jobId: string) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (roundId: string) => deleteJobInterviewRound(jobId, roundId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['job-interview-rounds', jobId] })
      toast.success('Đã xóa vòng phỏng vấn!')
    },
  })
}
