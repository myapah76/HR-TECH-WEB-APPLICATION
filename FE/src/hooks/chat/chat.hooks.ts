import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  createChatSession,
  getChatSessions,
  getChatMessages,
  sendChatMessage,
} from '@/src/services/chat.service'
import { CreateChatSessionRequest, SendChatMessageRequest } from '@/src/types/chat'

export const useGetChatSessions = () => {
  return useQuery({
    queryKey: ['chatSessions'],
    queryFn: getChatSessions,
  })
}

export const useGetChatMessages = (sessionId: string | null) => {
  return useQuery({
    queryKey: ['chatMessages', sessionId],
    queryFn: () => getChatMessages(sessionId!),
    enabled: !!sessionId,
    refetchInterval: false, // Turn off automatic refetching unless needed
  })
}

export const useCreateChatSession = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (request: CreateChatSessionRequest) => createChatSession(request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chatSessions'] })
    },
  })
}

export const useSendChatMessage = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ sessionId, request }: { sessionId: string; request: SendChatMessageRequest }) =>
      sendChatMessage(sessionId, request),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['chatMessages', variables.sessionId] })
      queryClient.invalidateQueries({ queryKey: ['chatSessions'] }) // Update last modified time/order
    },
  })
}
