import { useQuery } from '@tanstack/react-query'
import { getChatMessages } from '@/src/services/chat.service'

export const useGetChatMessages = (sessionId: string | null) => {
  return useQuery({
    queryKey: ['chatMessages', sessionId],
    queryFn: () => getChatMessages(sessionId!),
    enabled: !!sessionId,
    refetchInterval: false,
  })
}
