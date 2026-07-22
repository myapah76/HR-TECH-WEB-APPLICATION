import { NotificationType } from '@/src/enums/notification.enum'
export { NotificationType }

export interface NotificationResponse {
  id: string
  title: string
  content: string
  isRead: boolean
  type: NotificationType | string
  referenceId?: string
  createdAt: string
}
