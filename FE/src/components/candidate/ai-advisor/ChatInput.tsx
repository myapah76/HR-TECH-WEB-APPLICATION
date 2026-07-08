'use client'

import React from 'react'
import { Input } from '@/src/components/ui/input'
import { Button } from '@/src/components/ui/button'
import { Send, X } from 'lucide-react'

interface ChatInputProps {
  messageText: string
  setMessageText: (text: string) => void
  handleSendMessage: (e: React.FormEvent) => void
  isStreaming: boolean
  handleStopStreaming: () => void
  isPendingMessage: boolean
}

export function ChatInput({
  messageText,
  setMessageText,
  handleSendMessage,
  isStreaming,
  handleStopStreaming,
  isPendingMessage,
}: ChatInputProps) {
  return (
    <div className="p-4 bg-white border-t border-slate-100 shrink-0">
      <form
        onSubmit={handleSendMessage}
        className="flex items-center gap-3 bg-slate-50 border border-slate-200 p-2 rounded-full focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500 transition-all shadow-inner"
      >
        <Input
          className="flex-1 border-0 bg-transparent shadow-none focus-visible:ring-0 px-4 font-medium"
          placeholder="Nhập câu hỏi của bạn..."
          value={messageText}
          onChange={(e) => setMessageText(e.target.value)}
          disabled={isPendingMessage}
        />
        {isStreaming ? (
          <Button
            type="button"
            onClick={handleStopStreaming}
            size="icon"
            className="rounded-full bg-rose-600 hover:bg-rose-700 w-10 h-10 shrink-0 shadow-md transition-transform hover:scale-105 active:scale-95"
            title="Dừng sinh phản hồi"
          >
            <X className="w-4 h-4" />
          </Button>
        ) : (
          <Button
            type="submit"
            size="icon"
            className="rounded-full bg-blue-600 hover:bg-blue-700 w-10 h-10 shrink-0 shadow-md transition-transform hover:scale-105 active:scale-95 disabled:opacity-50"
            disabled={!messageText.trim() || isPendingMessage}
          >
            <Send className="w-4 h-4" />
          </Button>
        )}
      </form>
    </div>
  )
}
