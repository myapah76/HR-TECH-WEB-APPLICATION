'use client'

import React from 'react'
import { Card } from '@/src/components/ui/card'
import { Button } from '@/src/components/ui/button'
import { MessageSquare, Plus, Loader2 } from 'lucide-react'
import { ChatSessionResponse } from '@/src/types/chat'
import { formatDate } from '@/src/utils'

interface ChatHistorySidebarProps {
  sessions: ChatSessionResponse[]
  activeSessionId: string | null
  setActiveSessionId: (id: string) => void
  loadingSessions: boolean
  onOpenCreateModal: () => void
}

export function ChatHistorySidebar({
  sessions,
  activeSessionId,
  setActiveSessionId,
  loadingSessions,
  onOpenCreateModal,
}: ChatHistorySidebarProps) {
  return (
    <Card className="w-80 shrink-0 flex flex-col bg-white border-slate-200 shadow-sm overflow-hidden h-full">
      <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center shrink-0">
        <h2 className="font-black text-slate-800 flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-blue-600" /> Lịch sử Chat
        </h2>
        <Button
          size="icon"
          variant="outline"
          onClick={onOpenCreateModal}
          className="h-8 w-8 text-blue-600 border-blue-200 hover:bg-blue-50"
          title="Tạo phiên mới"
        >
          <Plus className="w-4 h-4" />
        </Button>
      </div>
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {loadingSessions ? (
          <div className="flex justify-center p-4">
            <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
          </div>
        ) : sessions.length === 0 ? (
          <div className="text-center p-4 text-sm text-slate-500 font-medium">
            Chưa có phiên tư vấn nào. Bấm + để tạo mới.
          </div>
        ) : (
          sessions.map((session) => (
            <div
              key={session.id}
              onClick={() => setActiveSessionId(session.id)}
              className={`p-3 rounded-xl cursor-pointer transition-all border ${
                activeSessionId === session.id
                  ? 'bg-blue-50 border-blue-200 shadow-sm'
                  : 'bg-white border-transparent hover:bg-slate-50 hover:border-slate-200'
              }`}
            >
              <div className="font-bold text-sm text-slate-800 line-clamp-2">{session.title}</div>
              <div className="text-xs text-slate-500 mt-1 font-medium">
                {formatDate(session.createdAt)}
              </div>
            </div>
          ))
        )}
      </div>
    </Card>
  )
}
