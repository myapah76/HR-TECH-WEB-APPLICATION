import { useMutation, useQueryClient } from '@tanstack/react-query'
import { sendChatMessage } from '@/src/services/chat.service'
import { SendChatMessageRequest } from '@/src/types/chat'

export const useSendChatMessage = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ sessionId, request }: { sessionId: string; request: SendChatMessageRequest }) =>
      sendChatMessage(sessionId, request),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['chatMessages', variables.sessionId] })
      queryClient.invalidateQueries({ queryKey: ['chatSessions'] })
    },
  })
}
