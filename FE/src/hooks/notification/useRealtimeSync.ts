'use client'

import { useQueryClient } from '@tanstack/react-query'
import { useCallback } from 'react'
import { NotificationResponse, NotificationType } from '@/src/types'

/**
 * Domain Event Sync Hook
 * Decouples real-time SSE event processing from notification UI presentation.
 */
export const useRealtimeSync = () => {
  const queryClient = useQueryClient()

  const syncRealtimeData = useCallback(
    (payload: NotificationResponse) => {
      if (!payload?.type) return

      // Global notification state invalidation
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
      queryClient.invalidateQueries({ queryKey: ['unreadNotificationCount'] })

      // Domain-specific query invalidations
      switch (payload.type) {
        case NotificationType.SUBSCRIPTION_UPGRADED:
          queryClient.invalidateQueries({ queryKey: ['myPaymentHistory'] })
          queryClient.invalidateQueries({ queryKey: ['myCurrentSubscription'] })
          break

        case NotificationType.JOB_STATUS_UPDATED:
        case NotificationType.APPLICATION_STATUS_UPDATED:
          queryClient.invalidateQueries({ queryKey: ['manageJobs'] })
          queryClient.invalidateQueries({ queryKey: ['admin-jobs'] })
          queryClient.invalidateQueries({ queryKey: ['recruiter-job-stats'] })
          queryClient.invalidateQueries({ queryKey: ['applications'] })
          queryClient.invalidateQueries({ queryKey: ['jobs'] })
          if (payload.referenceId) {
            queryClient.invalidateQueries({ queryKey: ['job', payload.referenceId] })
            queryClient.invalidateQueries({ queryKey: ['application', payload.referenceId] })
          }
          break

        default:
          break
      }
    },
    [queryClient]
  )

  return { syncRealtimeData }
}
