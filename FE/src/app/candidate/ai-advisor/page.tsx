'use client'

import React, { useState, useRef, useEffect } from 'react'
import { flushSync } from 'react-dom'
import { Card } from '@/src/components/ui/card'
import { Button } from '@/src/components/ui/button'
import { useGetAllCvs } from '@/src/hooks/cv'
import { useGetSavedJobs } from '@/src/hooks/job'
import {
  useGetChatSessions,
  useGetChatMessages,
  useCreateChatSession,
  useSendChatMessage,
} from '@/src/hooks/chat'
import { Plus, MessageSquare, Bot } from 'lucide-react'
import { toast } from 'sonner'
import { useAuthStore } from '@/src/stores/auth.store'
import { sendChatMessageStream } from '@/src/services/chat.service'
import { useQueryClient } from '@tanstack/react-query'

// Subcomponents
import { ChatHistorySidebar } from '@/src/components/candidate/ai-advisor/ChatHistorySidebar'
import { ChatArea } from '@/src/components/candidate/ai-advisor/ChatArea'
import { ChatInput } from '@/src/components/candidate/ai-advisor/ChatInput'
import { CreateSessionModal } from '@/src/components/candidate/ai-advisor/CreateSessionModal'

export default function AiAdvisorPage() {
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [messageText, setMessageText] = useState('')
  const [optimisticMessage, setOptimisticMessage] = useState('')
  const [streamingContent, setStreamingContent] = useState('')
  const [isStreaming, setIsStreaming] = useState(false)
  const chatContainerRef = useRef<HTMLDivElement>(null)
  const abortControllerRef = useRef<AbortController | null>(null)
  const queryClient = useQueryClient()

  // Data fetching
  const { data: sessions = [], isLoading: loadingSessions } = useGetChatSessions()
  const { data: messages = [], isLoading: loadingMessages } = useGetChatMessages(activeSessionId)
  const { data: cvs = [] } = useGetAllCvs()
  const { data: savedJobs = [] } = useGetSavedJobs()

  // Mutations
  const createSessionMut = useCreateChatSession()
  const sendMessageMut = useSendChatMessage()

  // Modal State
  const [selectedCv, setSelectedCv] = useState<string>('')
  const [selectedJob, setSelectedJob] = useState<string>('')

  // Auto scroll to bottom of chat
  const scrollToBottom = () => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTo({
        top: chatContainerRef.current.scrollHeight,
        behavior: 'smooth',
      })
    }
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, sendMessageMut.isPending, optimisticMessage, streamingContent])

  // Select the latest session automatically if none selected
  useEffect(() => {
    if (!activeSessionId && sessions.length > 0) {
      setActiveSessionId(sessions[0].id)
    }
  }, [sessions, activeSessionId])

  // Cleanup abort controller on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }
  }, [])

  const handleStopStreaming = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
      abortControllerRef.current = null
    }
    setIsStreaming(false)
    setStreamingContent('')
  }

  const handleCreateSession = () => {
    if (!selectedCv && !selectedJob) {
      toast.error('Vui lòng chọn ít nhất 1 Hồ sơ (CV) hoặc 1 Công việc (JD)')
      return
    }

    createSessionMut.mutate(
      {
        cvId: selectedCv || undefined,
        jobId: selectedJob || undefined,
      },
      {
        onSuccess: (newSession) => {
          setActiveSessionId(newSession.id)
          setIsModalOpen(false)
          setSelectedCv('')
          setSelectedJob('')
        },
      }
    )
  }

  const handleSendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault()
    if (!messageText.trim() || !activeSessionId || isStreaming) return
    const currentText = messageText

    setOptimisticMessage(currentText)
    setMessageText('')

    setIsStreaming(true)
    setStreamingContent('')

    const controller = new AbortController()
    abortControllerRef.current = controller

    try {
      const token = useAuthStore.getState().accessToken

      await sendChatMessageStream(
        activeSessionId,
        { content: currentText },
        token!,
        (chunk) => {
          if (chunk.text) {
            flushSync(() => {
              setStreamingContent((prev) => prev + chunk.text)
            })
          }
        },
        controller.signal
      )

      await queryClient.invalidateQueries({ queryKey: ['chatMessages', activeSessionId] })
    } catch (err: any) {
      if (err.name === 'AbortError') {
        console.log('Stream aborted by user')
      } else {
        toast.error('Có lỗi xảy ra: ' + err)
      }
    } finally {
      setOptimisticMessage('')
      setIsStreaming(false)
      setStreamingContent('')
      abortControllerRef.current = null
    }
  }

  return (
    <div className="flex h-[calc(100vh-140px)] gap-6 animate-fade-in">
      {/* LEFT SIDEBAR: Sessions List */}
      <ChatHistorySidebar
        sessions={sessions}
        activeSessionId={activeSessionId}
        setActiveSessionId={setActiveSessionId}
        loadingSessions={loadingSessions}
        onOpenCreateModal={() => setIsModalOpen(true)}
      />

      {/* MAIN CONTENT: Chat Area */}
      <Card className="flex-1 flex flex-col bg-white border-slate-200 shadow-sm overflow-hidden h-full relative">
        {activeSessionId ? (
          <>
            <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex items-center gap-3 shrink-0">
              <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                <Bot className="w-6 h-6" />
              </div>
              <div>
                <h2 className="font-black text-slate-800">GraphRAG AI Assistant</h2>
                <p className="text-xs text-emerald-600 font-bold flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block"></span>
                  Trợ lý luôn sẵn sàng
                </p>
              </div>
            </div>

            {/* Chat Messages, Optimistic & Streaming Content */}
            <ChatArea
              messages={messages}
              loadingMessages={loadingMessages}
              chatContainerRef={chatContainerRef}
              optimisticMessage={optimisticMessage}
              isStreaming={isStreaming}
              streamingContent={streamingContent}
              isPendingMessage={sendMessageMut.isPending}
            />

            {/* Bottom Input Area */}
            <ChatInput
              messageText={messageText}
              setMessageText={setMessageText}
              handleSendMessage={handleSendMessage}
              isStreaming={isStreaming}
              handleStopStreaming={handleStopStreaming}
              isPendingMessage={sendMessageMut.isPending}
            />
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-500 space-y-4 bg-slate-50/50">
            <MessageSquare className="w-16 h-16 text-slate-300" />
            <p className="font-bold text-lg text-slate-600">
              Chọn hoặc tạo một Phiên Chat để bắt đầu
            </p>
            <Button
              onClick={() => setIsModalOpen(true)}
              className="bg-blue-600 hover:bg-blue-700 font-bold"
            >
              <Plus className="w-4 h-4 mr-2" /> TẠO PHIÊN MỚI
            </Button>
          </div>
        )}
      </Card>

      {/* CREATE SESSION MODAL */}
      <CreateSessionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        savedJobs={savedJobs}
        cvs={cvs}
        selectedJob={selectedJob}
        setSelectedJob={setSelectedJob}
        selectedCv={selectedCv}
        setSelectedCv={setSelectedCv}
        handleCreateSession={handleCreateSession}
        isCreating={createSessionMut.isPending}
      />
    </div>
  )
}
