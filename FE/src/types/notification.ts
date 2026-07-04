export interface NotificationResponse {
  id: string
  title: string
  content: string
  isRead: boolean
  type: string
  referenceId?: string
  createdAt: string
}
