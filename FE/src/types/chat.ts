export interface CreateChatSessionRequest {
  jobId?: string
  cvId?: string
}

export interface SendChatMessageRequest {
  content: string
}

export interface ChatSessionResponse {
  id: string
  title: string
  jobId?: string
  jobTitle?: string
  cvId?: string
  createdAt: string
}

export interface ChatMessageResponse {
  id: string
  sender: 'USER' | 'AI' | 'SYSTEM'
  content: string
  citations?: string
  createdAt: string
}
