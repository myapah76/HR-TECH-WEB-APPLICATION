import { api } from '@/src/lib/axios'
import {
  SessionStartResponse,
  AnswerSubmitResponse,
  InterviewResultResponse,
} from '../types/interview'
import { ApiResponse } from '../types/api'

export const startInterviewSession = async (
  cvId: string,
  jobId: string | null,
  targetRole: string,
  numQuestions: number = 5
): Promise<SessionStartResponse> => {
  const response = await api.post<ApiResponse<SessionStartResponse>>('/interviews/sessions', {
    cvId,
    jobId,
    targetRole,
    numQuestions,
  })
  return response.data.data
}

export const submitInterviewAnswer = async (
  sessionId: string,
  questionId: string,
  answerText: string
): Promise<AnswerSubmitResponse> => {
  const response = await api.post<ApiResponse<AnswerSubmitResponse>>(
    `/interviews/sessions/${sessionId}/answers`,
    {
      questionId,
      answerText,
    }
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
