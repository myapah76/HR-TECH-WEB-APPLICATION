'use client'

import React, { createContext, useEffect, useRef } from 'react'
import { useAuthStore } from '@/src/stores/auth.store'
import { toast } from 'sonner'
import { useRealtimeSync } from '@/src/hooks/notification'

import { NotificationResponse } from '@/src/types'

const NotificationContext = createContext<any>(null)

const baseUrl = process.env.NEXT_PUBLIC_API_URL

export const NotificationProvider = ({ children }: { children: React.ReactNode }) => {
  const { user, accessToken } = useAuthStore()
  const { syncRealtimeData } = useRealtimeSync()
  const eventSourceRef = useRef<EventSource | null>(null)

  useEffect(() => {
    if (!user || !accessToken) {
      if (eventSourceRef.current) {
        eventSourceRef.current.close()
        eventSourceRef.current = null
      }
      return
    }

    const eventSource = new EventSource(`${baseUrl}/notifications/stream?token=${accessToken}`)

    eventSource.addEventListener('INIT_CONNECTION', (e) => {
      console.log('[SSE Connected]:', e.data)
    })

    eventSource.addEventListener('NEW_NOTIFICATION', (event) => {
      const payload: NotificationResponse = JSON.parse(event.data)

      toast(payload.title, {
        description: payload.content,
        duration: 6000,
      })

      // Delegate query cache invalidations to the domain sync hook
      syncRealtimeData(payload)
    })

    eventSource.onerror = (err) => {
      console.warn('[SSE Connection dropped, EventSource will auto-reconnect]:', err)
    }

    eventSourceRef.current = eventSource

    return () => {
      eventSource.close()
      eventSourceRef.current = null
    }
  }, [user, accessToken, syncRealtimeData])

  return <NotificationContext.Provider value={{}}>{children}</NotificationContext.Provider>
}
