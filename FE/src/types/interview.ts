export interface StartSessionRequest {
  cvId: string
  jobId: string | null
  targetRole: string
  numQuestions: number
}

export interface AnswerSubmitRequest {
  questionId: string
  answer: string
}

export interface QuestionResponse {
  id: string
  questionText: string
  orderIndex: number
}

export interface SessionStartResponse {
  sessionId: string
  targetRole: string
  status: string
  totalQuestions: number
  currentQuestion: QuestionResponse
}

export interface AnswerSubmitResponse {
  finished: boolean
  nextQuestion: QuestionResponse | null
}

export interface DetailedFeedbackItem {
  question: string
  answer: string
  score: number
  feedback: string
  modelAnswer: string
}

export interface InterviewResultResponse {
  sessionId: string
  overallScore: number
  technicalScore: number
  communicationScore: number
  softSkillsScore: number
  strengths: string[]
  weaknesses: string[]
  generalFeedback: string
  detailedFeedback: DetailedFeedbackItem[]
}
