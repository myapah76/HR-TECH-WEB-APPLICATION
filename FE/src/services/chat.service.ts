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
