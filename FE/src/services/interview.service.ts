import { api } from '@/src/lib/axios'
import {
  StartSessionRequest,
  AnswerSubmitRequest,
  SessionStartResponse,
  AnswerSubmitResponse,
  InterviewResultResponse,
} from '../types/interview'
import { ApiResponse } from '../types/api'

export const startInterviewSession = async (
  request: StartSessionRequest
): Promise<SessionStartResponse> => {
  const response = await api.post<ApiResponse<SessionStartResponse>>(
    '/interviews/sessions',
    request
  )
  return response.data.data
}

export const submitInterviewAnswer = async (
  sessionId: string,
  request: AnswerSubmitRequest
): Promise<AnswerSubmitResponse> => {
  const response = await api.post<ApiResponse<AnswerSubmitResponse>>(
    `/interviews/sessions/${sessionId}/answers`,
    request
  )
  return response.data.data
}

export const submitAndEvaluateInterview = async (
  sessionId: string
): Promise<InterviewResultResponse> => {
  const response = await api.post<ApiResponse<InterviewResultResponse>>(
    `/interviews/sessions/${sessionId}/submit`
  )
  return response.data.data
}

export const getInterviewResult = async (sessionId: string): Promise<InterviewResultResponse> => {
  const response = await api.get<ApiResponse<InterviewResultResponse>>(
    `/interviews/sessions/${sessionId}/result`
  )
  return response.data.data
}

export const getMyInterviewHistory = async (): Promise<SessionStartResponse[]> => {
  const response = await api.get<ApiResponse<SessionStartResponse[]>>('/interviews/my')
  return response.data.data
}
