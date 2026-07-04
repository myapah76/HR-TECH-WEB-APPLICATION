import { useQuery } from '@tanstack/react-query'
import { getUnreadCount } from '@/src/services/notification.service'

export const useGetUnreadCount = () => {
  return useQuery({
    queryKey: ['unreadNotificationCount'],
    queryFn: getUnreadCount,
  })
}
