'use client'

import React, { RefObject } from 'react'
import { Bot, User as UserIcon, Loader2 } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { ChatMessageResponse } from '@/src/types/chat'

interface ChatAreaProps {
  messages: ChatMessageResponse[]
  loadingMessages: boolean
  chatContainerRef: RefObject<HTMLDivElement | null>
  optimisticMessage: string
  isStreaming: boolean
  streamingContent: string
  isPendingMessage: boolean
}

export function ChatArea({
  messages,
  loadingMessages,
  chatContainerRef,
  optimisticMessage,
  isStreaming,
  streamingContent,
  isPendingMessage,
}: ChatAreaProps) {
  return (
    <div
      className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/30"
      ref={chatContainerRef}
    >
      {loadingMessages ? (
        <div className="flex justify-center p-8">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        </div>
      ) : messages.length === 0 && !isStreaming && !optimisticMessage ? (
        <div className="text-center h-full flex flex-col items-center justify-center text-slate-500 space-y-4">
          <Bot className="w-16 h-16 text-slate-300" />
          <p className="font-medium">Hãy bắt đầu trò chuyện với trợ lý AI!</p>
        </div>
      ) : (
        messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex gap-4 max-w-[85%] ${
              msg.sender === 'USER' ? 'ml-auto flex-row-reverse' : ''
            }`}
          >
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-1 ${
                msg.sender === 'USER'
                  ? 'bg-slate-200 text-slate-600'
                  : 'bg-blue-600 text-white'
              }`}
            >
              {msg.sender === 'USER' ? (
                <UserIcon className="w-4 h-4" />
              ) : (
                <Bot className="w-4 h-4" />
              )}
            </div>
            <div
              className={`p-4 rounded-2xl shadow-sm ${
                msg.sender === 'USER'
                  ? 'bg-slate-800 text-white rounded-tr-none'
                  : 'bg-white border border-slate-100 rounded-tl-none text-slate-800 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-100 w-full overflow-hidden'
              }`}
            >
              {msg.sender === 'USER' ? (
                <p className="whitespace-pre-wrap text-sm font-medium">{msg.content}</p>
              ) : (
                <div
                  className="prose prose-sm max-w-none prose-blue dark:prose-invert
                  prose-headings:font-black prose-headings:text-slate-800 dark:prose-headings:text-slate-100
                  prose-p:leading-relaxed prose-p:text-slate-600 dark:prose-p:text-slate-300
                  prose-a:text-blue-600 dark:prose-a:text-blue-400 prose-a:font-bold prose-a:no-underline hover:prose-a:underline
                  prose-strong:text-slate-800 dark:prose-strong:text-slate-100 prose-strong:font-black
                  prose-code:text-rose-600 dark:prose-code:text-rose-400 prose-code:bg-rose-50 dark:prose-code:bg-rose-950/30 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded-md prose-code:before:content-none prose-code:after:content-none
                  prose-pre:bg-slate-800 prose-pre:text-slate-50 prose-pre:rounded-xl
                  prose-table:border-collapse prose-table:w-full
                  prose-th:bg-slate-50 dark:prose-th:bg-slate-850 prose-th:p-2 prose-th:border prose-th:border-slate-200 dark:prose-th:border-slate-800 prose-th:text-slate-800 dark:prose-th:text-slate-100 prose-th:font-bold
                  prose-td:p-2 prose-td:border prose-td:border-slate-200 dark:prose-td:border-slate-800 prose-td:text-slate-600 dark:prose-td:text-slate-300
                  prose-li:marker:text-blue-500
                  prose-blockquote:border-l-4 prose-blockquote:border-blue-500 dark:prose-blockquote:border-blue-400 prose-blockquote:bg-blue-50/50 dark:prose-blockquote:bg-blue-950/20 prose-blockquote:py-1 prose-blockquote:px-4 prose-blockquote:rounded-r-lg prose-blockquote:not-italic
                "
                >
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.content}</ReactMarkdown>
                </div>
              )}
            </div>
          </div>
        ))
      )}

      {/* Optimistic Message */}
      {optimisticMessage && (
        <div className="flex gap-4 max-w-[85%] ml-auto flex-row-reverse">
          <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-1 bg-slate-200 text-slate-600">
            <UserIcon className="w-4 h-4" />
          </div>
          <div className="p-4 rounded-2xl shadow-sm bg-slate-800 text-white rounded-tr-none">
            <p className="whitespace-pre-wrap text-sm font-medium opacity-70">
              {optimisticMessage}
            </p>
          </div>
        </div>
      )}

      {/* Hiển thị tin nhắn AI đang chạy chữ */}
      {isStreaming && streamingContent && (
        <div className="flex gap-4 max-w-[85%] mt-4">
          <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center shrink-0 mt-1">
            <Bot className="w-4 h-4" />
          </div>
          <div className="p-4 rounded-2xl bg-white border border-slate-100 rounded-tl-none text-slate-800 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-100 w-full overflow-hidden shadow-sm">
            <div
              className="prose prose-sm max-w-none prose-blue dark:prose-invert
              prose-headings:font-black prose-headings:text-slate-800 dark:prose-headings:text-slate-100
              prose-p:leading-relaxed prose-p:text-slate-600 dark:prose-p:text-slate-300
              prose-a:text-blue-600 dark:prose-a:text-blue-400 prose-a:font-bold prose-a:no-underline hover:prose-a:underline
              prose-strong:text-slate-800 dark:prose-strong:text-slate-100 prose-strong:font-black
              prose-code:text-rose-600 dark:prose-code:text-rose-400 prose-code:bg-rose-50 dark:prose-code:bg-rose-950/30 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded-md prose-code:before:content-none prose-code:after:content-none
              prose-pre:bg-slate-800 prose-pre:text-slate-50 prose-pre:rounded-xl
              prose-table:border-collapse prose-table:w-full
              prose-th:bg-slate-50 dark:prose-th:bg-slate-850 prose-th:p-2 prose-th:border prose-th:border-slate-200 dark:prose-th:border-slate-800 prose-th:text-slate-800 dark:prose-th:text-slate-100 prose-th:font-bold
              prose-td:p-2 prose-td:border prose-td:border-slate-200 dark:prose-td:border-slate-800 prose-td:text-slate-600 dark:prose-td:text-slate-300
              prose-li:marker:text-blue-500
              prose-blockquote:border-l-4 prose-blockquote:border-blue-500 dark:prose-blockquote:border-blue-400 prose-blockquote:bg-blue-50/50 dark:prose-blockquote:bg-blue-950/20 prose-blockquote:py-1 prose-blockquote:px-4 prose-blockquote:rounded-r-lg prose-blockquote:not-italic
            "
            >
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{streamingContent}</ReactMarkdown>
            </div>
          </div>
        </div>
      )}

      {/* Typing indicator */}
      {(isPendingMessage || (isStreaming && !streamingContent)) && (
        <div className="flex gap-4 max-w-[85%] mt-4">
          <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center shrink-0">
            <Bot className="w-4 h-4" />
          </div>
          <div className="p-4 rounded-2xl bg-white border border-slate-100 rounded-tl-none dark:bg-slate-900 dark:border-slate-800 shadow-sm flex items-center gap-1">
            <div className="w-2 h-2 bg-slate-300 rounded-full animate-bounce"></div>
            <div
              className="w-2 h-2 bg-slate-300 rounded-full animate-bounce"
              style={{ animationDelay: '0.2s' }}
            ></div>
            <div
              className="w-2 h-2 bg-slate-300 rounded-full animate-bounce"
              style={{ animationDelay: '0.4s' }}
            ></div>
          </div>
        </div>
      )}
    </div>
  )
}
