import { useQuery } from '@tanstack/react-query'
import { getChatSessions } from '@/src/services/chat.service'

export const useGetChatSessions = () => {
  return useQuery({
    queryKey: ['chatSessions'],
    queryFn: getChatSessions,
  })
}
