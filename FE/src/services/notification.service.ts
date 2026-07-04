import { api } from '@/src/lib/axios'
import { ApiResponse } from '@/src/types/api'
import { NotificationResponse } from '@/src/types/notification'

export const getNotifications = async (): Promise<NotificationResponse[]> => {
  const response = await api.get<ApiResponse<NotificationResponse[]>>('/notifications')
  return response.data.data
}
export const getUnreadCount = async (): Promise<number> => {
  const response = await api.get<ApiResponse<number>>('/notifications/unread-count')
  return response.data.data
}
export const markNotificationRead = async (id: string): Promise<void> => {
  await api.patch(`/notifications/${id}/read`)
}
