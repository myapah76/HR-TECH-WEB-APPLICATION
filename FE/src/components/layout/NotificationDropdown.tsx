'use client'

import { useState } from 'react'
import { Bell } from 'lucide-react'
import { Button } from '@/src/components/ui/button'
import {
  useGetNotifications,
  useGetUnreadCount,
  useMarkNotificationRead,
} from '@/src/hooks/notification'
import { getNotificationRedirectUrl } from '@/src/utils/notification'
import { useRouter } from 'next/navigation'

export default function NotificationDropdown() {
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const { data: notifications = [] } = useGetNotifications()
  const { data: unreadCount = 0 } = useGetUnreadCount()
  const { mutate: markRead } = useMarkNotificationRead()

  const handleNotificationClick = (id: string, type: string, referenceId?: string) => {
    markRead(id)
    setIsOpen(false)
    const targetUrl = getNotificationRedirectUrl(type, referenceId)
    router.push(targetUrl)
  }

  const formatRelativeTime = (isoString: string) => {
    const diff = new Date().getTime() - new Date(isoString).getTime()
    const mins = Math.floor(diff / 60000)
    if (mins < 1) return 'Vừa xong'
    if (mins < 60) return `${mins} phút trước`
    const hours = Math.floor(mins / 60)
    if (hours < 24) return `${hours} giờ trước`
    return new Date(isoString).toLocaleDateString('vi-VN')
  }

  return (
    <div className="relative">
      <Button
        variant="ghost"
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-full transition-all cursor-pointer hover:scale-105 h-auto w-auto"
        id="btn-notification"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 h-2.5 w-2.5 rounded-full bg-rose-500 ring-2 ring-white dark:ring-slate-900 animate-pulse" />
        )}
      </Button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 mt-2 w-80 max-h-96 overflow-y-auto rounded-2xl border border-slate-200/60 dark:border-slate-800 bg-white dark:bg-slate-800 shadow-xl z-50 py-2">
            <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-700/60 flex justify-between items-center">
              <span className="font-extrabold text-sm text-slate-800 dark:text-slate-100">
                Thông báo
              </span>
              <span className="text-[10px] text-slate-400 font-bold">
                {unreadCount} tin chưa đọc
              </span>
            </div>

            <div className="divide-y divide-slate-50 dark:divide-slate-700/60">
              {notifications.length === 0 ? (
                <div className="px-4 py-8 text-center text-xs font-bold text-slate-400">
                  Không có thông báo mới nào
                </div>
              ) : (
                notifications.map((n) => (
                  <div
                    key={n.id}
                    onClick={() => handleNotificationClick(n.id, n.type, n.referenceId)}
                    className={`px-4 py-3 hover:bg-slate-50/80 dark:hover:bg-slate-700/40 cursor-pointer transition-colors flex flex-col gap-0.5 ${
                      !n.isRead ? 'bg-indigo-50/20 dark:bg-indigo-900/10' : ''
                    }`}
                  >
                    <div className="flex justify-between items-start gap-2">
                      <span
                        className={`text-xs ${!n.isRead ? 'font-black text-slate-900 dark:text-slate-100' : 'font-medium text-slate-700 dark:text-slate-300'}`}
                      >
                        {n.title}
                      </span>
                      {!n.isRead && (
                        <span className="h-1.5 w-1.5 rounded-full bg-indigo-600 shrink-0 mt-1.5" />
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                      {n.content}
                    </p>
                    <span className="text-[9px] text-slate-400 font-bold mt-1">
                      {formatRelativeTime(n.createdAt)}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
