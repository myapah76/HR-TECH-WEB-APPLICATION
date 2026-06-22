import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createChatSession } from '@/src/services/chat.service'
import { CreateChatSessionRequest } from '@/src/types/chat'

export const useCreateChatSession = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (request: CreateChatSessionRequest) => createChatSession(request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chatSessions'] })
    },
  })
}
