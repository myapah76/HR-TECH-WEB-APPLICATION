import { api } from '@/src/lib/axios'
import { ApiResponse } from '../types/api'
import {
  CreateChatSessionRequest,
  SendChatMessageRequest,
  ChatSessionResponse,
  ChatMessageResponse,
} from '../types/chat'

export const createChatSession = async (
  request: CreateChatSessionRequest
): Promise<ChatSessionResponse> => {
  const response = await api.post<ApiResponse<ChatSessionResponse>>('/chat/sessions', request)
  return response.data.data
}

export const getChatSessions = async (): Promise<ChatSessionResponse[]> => {
  const response = await api.get<ApiResponse<ChatSessionResponse[]>>('/chat/sessions')
  return response.data.data
}

export const getChatMessages = async (sessionId: string): Promise<ChatMessageResponse[]> => {
  const response = await api.get<ApiResponse<ChatMessageResponse[]>>(
    `/chat/sessions/${sessionId}/messages`
  )
  return response.data.data
}

export const sendChatMessage = async (
  sessionId: string,
  request: SendChatMessageRequest
): Promise<ChatMessageResponse> => {
  const response = await api.post<ApiResponse<ChatMessageResponse>>(
    `/chat/sessions/${sessionId}/messages`,
    request
  )
  return response.data.data
}

export const sendChatMessageStream = async (
  sessionId: string,
  request: SendChatMessageRequest,
  token: string,
  onChunk: (chunk: { text?: string }) => void,
  signal?: AbortSignal
): Promise<void> => {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL

  const url = `${baseUrl}/chat/sessions/${sessionId}/messages/stream`
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(request),
    signal,
  })

  if (!response.ok) throw new Error('Kết nối AI thất bại')

  const reader = response.body?.getReader()
  if (!reader) throw new Error('Không nhận được luồng dữ liệu')

  let buffer = ''
  const decoder = new TextDecoder('utf-8')

  while (true) {
    const { done, value } = await reader.read()
    if (done) {
      console.log('=== Stream read done ===')
      if (buffer.trim()) {
        const cleanLine = buffer.trim()
        if (cleanLine.startsWith('data:')) {
          try {
            const jsonStr = cleanLine.substring(5).trim()
            const data = JSON.parse(jsonStr)
            onChunk(data)
          } catch (error) {
            console.error('Lỗi parse SSE chunk cuối:', error)
          }
        }
      }
      break
    }

    const decoded = decoder.decode(value, { stream: true })
    buffer += decoded
    const lines = buffer.split('\n')
    buffer = lines.pop() || ''

    for (const line of lines) {
      const cleanLine = line.trim()
      if (cleanLine.startsWith('data:')) {
        try {
          const jsonStr = cleanLine.substring(5).trim()
          const data = JSON.parse(jsonStr)
          onChunk(data)
        } catch (error) {
          console.error('Lỗi parse SSE chunk:', error)
        }
      }
    }
  }
}
