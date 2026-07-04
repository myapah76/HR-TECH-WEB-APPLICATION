import { useQuery } from '@tanstack/react-query'
import { getNotifications } from '@/src/services/notification.service'

export const useGetNotifications = () => {
  return useQuery({
    queryKey: ['notifications'],
    queryFn: getNotifications,
  })
}
