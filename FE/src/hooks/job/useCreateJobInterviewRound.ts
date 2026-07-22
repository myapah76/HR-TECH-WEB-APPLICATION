import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createJobInterviewRound } from '@/src/services/job.service'
import { JobInterviewRoundRequest } from '@/src/types/recruiter-interview'
import { toast } from 'sonner'

export const useCreateJobInterviewRound = (jobId: string) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: JobInterviewRoundRequest) => createJobInterviewRound(jobId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['job-interview-rounds', jobId] })
      toast.success('Đã thêm vòng phỏng vấn mới!')
    },
  })
}
