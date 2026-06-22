'use client'

import React, { useState, useRef, useEffect } from 'react'
import { Card } from '@/src/components/ui/card'
import { Button } from '@/src/components/ui/button'
import { Input } from '@/src/components/ui/input'
import { Label } from '@/src/components/ui/label'
import { useGetAllCvs } from '@/src/hooks/cv'
import { useGetSavedJobs } from '@/src/hooks/job'
import {
  useGetChatSessions,
  useGetChatMessages,
  useCreateChatSession,
  useSendChatMessage,
} from '@/src/hooks/chat'
import { Send, Plus, MessageSquare, X, Bot, User as UserIcon, Loader2 } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { toast } from 'sonner'

export default function AiAdvisorPage() {
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [messageText, setMessageText] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

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
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, sendMessageMut.isPending])

  // Select the latest session automatically if none selected
  useEffect(() => {
    if (!activeSessionId && sessions.length > 0) {
      setActiveSessionId(sessions[0].id)
    }
  }, [sessions, activeSessionId])

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
        onError: () => {
          toast.error('Có lỗi xảy ra khi tạo phiên chat mới')
        },
      }
    )
  }

  const handleSendMessage = (e?: React.FormEvent) => {
    e?.preventDefault()
    if (!messageText.trim() || !activeSessionId) return

    sendMessageMut.mutate(
      {
        sessionId: activeSessionId,
        request: { content: messageText },
      },
      {
        onSuccess: () => {
          setMessageText('')
        },
        onError: () => {
          toast.error('Có lỗi xảy ra khi gửi tin nhắn')
        },
      }
    )
  }

  return (
    <div className="flex h-[calc(100vh-140px)] gap-6 animate-fade-in">
      {/* LEFT SIDEBAR: Sessions List */}
      <Card className="w-80 flex-shrink-0 flex flex-col bg-white border-slate-200 shadow-sm overflow-hidden h-full">
        <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center shrink-0">
          <h2 className="font-black text-slate-800 flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-blue-600" /> Lịch sử Chat
          </h2>
          <Button
            size="icon"
            variant="outline"
            onClick={() => setIsModalOpen(true)}
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
                <div className="font-bold text-sm text-slate-800 line-clamp-2">
                  {session.title}
                </div>
                <div className="text-xs text-slate-500 mt-1 font-medium">
                  {new Date(session.createdAt).toLocaleDateString('vi-VN')}
                </div>
              </div>
            ))
          )}
        </div>
      </Card>

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

            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/30">
              {loadingMessages ? (
                <div className="flex justify-center p-8">
                  <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                </div>
              ) : messages.length === 0 ? (
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
                      {msg.sender === 'USER' ? <UserIcon className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                    </div>
                    <div
                      className={`p-4 rounded-2xl shadow-sm ${
                        msg.sender === 'USER'
                          ? 'bg-slate-800 text-white rounded-tr-none'
                          : 'bg-white border border-slate-100 rounded-tl-none text-slate-800 w-full overflow-hidden'
                      }`}
                    >
                      {msg.sender === 'USER' ? (
                        <p className="whitespace-pre-wrap text-sm font-medium">{msg.content}</p>
                      ) : (
                        <div className="prose prose-sm max-w-none prose-blue 
                          prose-headings:font-black prose-headings:text-slate-800 
                          prose-p:leading-relaxed prose-p:text-slate-600
                          prose-a:text-blue-600 prose-a:font-bold prose-a:no-underline hover:prose-a:underline
                          prose-strong:text-slate-800 prose-strong:font-black
                          prose-code:text-rose-600 prose-code:bg-rose-50 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded-md prose-code:before:content-none prose-code:after:content-none
                          prose-pre:bg-slate-800 prose-pre:text-slate-50 prose-pre:rounded-xl
                          prose-table:border-collapse prose-table:w-full
                          prose-th:bg-slate-50 prose-th:p-2 prose-th:border prose-th:border-slate-200 prose-th:text-slate-800 prose-th:font-bold
                          prose-td:p-2 prose-td:border prose-td:border-slate-200 prose-td:text-slate-600
                          prose-li:marker:text-blue-500
                          prose-blockquote:border-l-4 prose-blockquote:border-blue-500 prose-blockquote:bg-blue-50/50 prose-blockquote:py-1 prose-blockquote:px-4 prose-blockquote:rounded-r-lg prose-blockquote:not-italic
                        ">
                          <ReactMarkdown remarkPlugins={[remarkGfm]}>
                            {msg.content}
                          </ReactMarkdown>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}

              {/* Typing indicator */}
              {sendMessageMut.isPending && (
                <div className="flex gap-4 max-w-[85%] mt-4">
                  <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center shrink-0">
                    <Bot className="w-4 h-4" />
                  </div>
                  <div className="p-4 rounded-2xl bg-white border border-slate-100 rounded-tl-none shadow-sm flex items-center gap-1">
                    <div className="w-2 h-2 bg-slate-300 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-slate-300 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    <div className="w-2 h-2 bg-slate-300 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
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
                  disabled={sendMessageMut.isPending}
                />
                <Button
                  type="submit"
                  size="icon"
                  className="rounded-full bg-blue-600 hover:bg-blue-700 w-10 h-10 shrink-0 shadow-md transition-transform hover:scale-105 active:scale-95 disabled:opacity-50"
                  disabled={!messageText.trim() || sendMessageMut.isPending}
                >
                  <Send className="w-4 h-4" />
                </Button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-500 space-y-4 bg-slate-50/50">
            <MessageSquare className="w-16 h-16 text-slate-300" />
            <p className="font-bold text-lg text-slate-600">Chọn hoặc tạo một Phiên Chat để bắt đầu</p>
            <Button onClick={() => setIsModalOpen(true)} className="bg-blue-600 hover:bg-blue-700 font-bold">
              <Plus className="w-4 h-4 mr-2" /> TẠO PHIÊN MỚI
            </Button>
          </div>
        )}
      </Card>

      {/* CREATE SESSION MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="font-black text-xl text-slate-800">Tạo Phiên Tư Vấn Mới</h3>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsModalOpen(false)}
                className="hover:bg-slate-200 rounded-full h-8 w-8 text-slate-500"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            <div className="p-6 space-y-6">
              <div className="bg-blue-50 p-3 rounded-lg border border-blue-100 text-sm text-blue-800 font-medium">
                Vui lòng chọn ít nhất 1 Công việc hoặc 1 Hồ sơ để AI có dữ liệu ngữ cảnh (Context) phân tích cho bạn.
              </div>
              
              <div className="space-y-3">
                <Label className="font-bold text-slate-700">Công việc đã lưu (Tùy chọn)</Label>
                <select
                  className="flex h-11 w-full items-center justify-between rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer shadow-sm hover:border-slate-300 transition-colors"
                  value={selectedJob}
                  onChange={(e) => setSelectedJob(e.target.value)}
                >
                  <option value="">-- Chọn Công việc --</option>
                  {savedJobs.map((job) => (
                    <option key={job.id} value={job.id}>
                      {job.title} - {job.companyName}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-3">
                <Label className="font-bold text-slate-700">Hồ sơ cá nhân (Tùy chọn)</Label>
                <select
                  className="flex h-11 w-full items-center justify-between rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer shadow-sm hover:border-slate-300 transition-colors"
                  value={selectedCv}
                  onChange={(e) => setSelectedCv(e.target.value)}
                >
                  <option value="">-- Chọn Hồ sơ (CV) --</option>
                  {cvs.map((cv) => (
                    <option key={cv.id} value={cv.id}>
                      {cv.title}
                    </option>
                  ))}
                </select>
              </div>

              <Button
                onClick={handleCreateSession}
                disabled={(!selectedCv && !selectedJob) || createSessionMut.isPending}
                className="w-full bg-slate-800 hover:bg-slate-900 text-white font-bold h-12 text-base transition-all rounded-xl"
              >
                {createSessionMut.isPending ? 'ĐANG TẠO...' : 'BẮT ĐẦU CHAT'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
