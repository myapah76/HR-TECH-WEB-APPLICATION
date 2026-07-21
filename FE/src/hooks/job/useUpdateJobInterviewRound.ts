import { useMutation, useQueryClient } from '@tanstack/react-query'
import { updateJobInterviewRound } from '@/src/services/job.service'
import { JobInterviewRoundRequest } from '@/src/types/recruiter-interview'
import { toast } from 'sonner'

export const useUpdateJobInterviewRound = (jobId: string) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ roundId, payload }: { roundId: string; payload: JobInterviewRoundRequest }) =>
      updateJobInterviewRound(jobId, roundId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['job-interview-rounds', jobId] })
      toast.success('Đã cập nhật thông tin vòng phỏng vấn!')
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'Không thể cập nhật vòng phỏng vấn.')
    },
  })
}
