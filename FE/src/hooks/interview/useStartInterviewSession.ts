import { useMutation, useQueryClient } from '@tanstack/react-query'
import { startInterviewSession } from '@/src/services/interview.service'
import { SessionStartResponse } from '@/types/mock-interview'

export const useStartInterviewSession = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: startInterviewSession,
    onSuccess: (newSession) => {
      queryClient.setQueryData<SessionStartResponse[]>(['interviewHistory'], (oldData) => {
        if (!oldData) return [newSession]
        return [newSession, ...oldData]
      })
    },
  })
}
