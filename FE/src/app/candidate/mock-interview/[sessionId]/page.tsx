'use client'

import React, { useState, useEffect, useRef } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Card } from '@/src/components/ui/card'
import { Button } from '@/src/components/ui/button'
import { QuestionResponse } from '@/src/types/interview'
import {
  Loader2,
  HelpCircle,
  ChevronLeft,
} from 'lucide-react'
import { MockInterviewEvaluating } from '@/src/components/candidate/interview/MockInterviewEvaluating'
import { MockInterviewIdleState } from '@/src/components/candidate/interview/MockInterviewIdleState'
import { MockInterviewRecordingState } from '@/src/components/candidate/interview/MockInterviewRecordingState'
import { MockInterviewReviewingState } from '@/src/components/candidate/interview/MockInterviewReviewingState'
import { toast } from 'sonner'
import { motion } from 'motion/react'
import {
  useGetInterviewSessionHistory,
  useSubmitInterviewAnswer,
  useSubmitAndEvaluateInterview,
} from '@/src/hooks/interview'
import { uploadToCloudinary } from '@/src/utils/cloudinary'

export default function MockInterviewPracticePage() {
  const router = useRouter()
  const params = useParams()
  const sessionId = params.sessionId as string

  // State quản lý luồng ghi âm & câu hỏi
  const [currentQuestion, setCurrentQuestion] = useState<QuestionResponse | null>(null)
  const [practiceState, setPracticeState] = useState<'IDLE' | 'RECORDING' | 'REVIEWING'>('IDLE')
  const [isUploading, setIsUploading] = useState(false)

  // MediaRecorder Refs
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const [audioUrlLocal, setAudioUrlLocal] = useState<string | null>(null)
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null)

  // Trạng thái AI đánh giá
  const [isEvaluating, setIsEvaluating] = useState(false)
  const [evalStep, setEvalStep] = useState(0)

  const { data: history = [], isLoading } = useGetInterviewSessionHistory()
  const evaluateSessionMut = useSubmitAndEvaluateInterview()
  const submitAnswerMut = useSubmitInterviewAnswer()

  const currentSession = history.find((s) => s.sessionId === sessionId)
  const totalQuestions = currentSession?.totalQuestions || 5

  useEffect(() => {
    if (currentSession && currentSession.currentQuestion && !currentQuestion) {
      setCurrentQuestion(currentSession.currentQuestion)
    }
  }, [currentSession, currentQuestion])

  // Reset khi đổi câu hỏi
  useEffect(() => {
    setPracticeState('IDLE')
    setAudioUrlLocal(null)
    setAudioBlob(null)
    audioChunksRef.current = []
  }, [currentQuestion?.id])

  // Bắt đầu ghi âm bằng MediaRecorder
  const handleStartRecording = async () => {
    setAudioUrlLocal(null)
    setAudioBlob(null)
    audioChunksRef.current = []

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' })
      mediaRecorderRef.current = mediaRecorder

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data)
        }
      }

      mediaRecorder.onstop = () => {
        const recordedBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' })
        setAudioBlob(recordedBlob)
        const localUrl = URL.createObjectURL(recordedBlob)
        setAudioUrlLocal(localUrl)
        setPracticeState('REVIEWING')

        // Tắt microphone stream
        stream.getTracks().forEach((track) => track.stop())
      }

      mediaRecorder.start()
      setPracticeState('RECORDING')
      toast.info('Micro đang ghi âm... Hãy nói câu trả lời của bạn.')
    } catch (err) {
      console.error('Không truy cập được Micro:', err)
      toast.error('Không thể truy cập Micro của bạn. Vui lòng cấp quyền và thử lại!')
    }
  }

  // Dừng ghi âm
  const handleStopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop()
    }
  }

  // Làm lại câu trả lời
  const handleRetry = () => {
    setAudioUrlLocal(null)
    setAudioBlob(null)
    audioChunksRef.current = []
    setPracticeState('IDLE')
    toast.info('Đã xóa bản ghi cũ. Hãy bắt đầu lại.')
  }

  // Nộp câu trả lời
  const handleSendAnswer = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!audioBlob || !currentQuestion) return

    setIsUploading(true)
    try {
      // 1. Chuyển đổi Blob thành File để tải lên Cloudinary
      const audioFile = new File([audioBlob], `answer_${currentQuestion.id}.webm`, {
        type: 'audio/webm',
      })

      // 2. Upload file trực tiếp lên Cloudinary từ Frontend
      const uploadedUrl = await uploadToCloudinary(audioFile, 'hrtech/interviews')
      setIsUploading(false)

      // 3. Gửi URL tới Spring Boot Backend để lưu trữ & chấm điểm
      submitAnswerMut.mutate(
        {
          sessionId: sessionId,
          request: {
            questionId: currentQuestion.id || '',
            audioUrl: uploadedUrl,
          },
        },
        {
          onSuccess: (data) => {
            if (data.finished) {
              setIsEvaluating(true)
              setEvalStep(0)
              evaluateSessionMut.mutate(sessionId, {
                onSuccess: () => {
                  toast.success('AI hoàn thành chấm điểm!')
                  router.push(`/candidate/mock-interview/${sessionId}/result`)
                },
                onError: () => {
                  setIsEvaluating(false)
                },
              })
            } else if (data.nextQuestion) {
              setCurrentQuestion(data.nextQuestion)
            }
          },
        }
      )
    } catch (error) {
      setIsUploading(false)
      toast.error('Tải âm thanh lên Cloudinary thất bại, vui lòng thử lại!')
    }
  }

  useEffect(() => {
    if (isEvaluating) {
      const interval = setInterval(() => {
        setEvalStep((prev) => (prev < 2 ? prev + 1 : prev))
      }, 6000)
      return () => clearInterval(interval)
    }
  }, [isEvaluating])

  const evaluationSteps = [
    'Đang phân tích các tệp ghi âm giọng nói của từng câu hỏi lẻ...',
    'Đang đọc và đối soát chuyên môn dựa trên CV & JD công việc...',
    'Đang tổng hợp điểm số kỹ thuật, giao tiếp và kỹ năng mềm...',
  ]

  if (isLoading) {
    return (
      <div className="min-h-[400px] flex flex-col items-center justify-center p-6 text-center">
        <Loader2 className="w-10 h-10 animate-spin text-blue-600 mb-3 mx-auto" />
        <p className="text-slate-500 font-bold text-sm">Đang tải thông tin phòng phỏng vấn...</p>
      </div>
    )
  }

  if (!currentSession) {
    return (
      <div className="min-h-[400px] flex flex-col items-center justify-center p-6 text-center space-y-4">
        <p className="text-red-500 font-bold text-base">
          Không tìm thấy phiên phỏng vấn này hoặc bạn không có quyền truy cập.
        </p>
        <Button
          onClick={() => router.push('/candidate/mock-interview')}
          className="bg-slate-800 hover:bg-slate-900 text-white font-bold px-4 py-2 rounded-xl cursor-pointer"
        >
          Quay lại Lịch sử
        </Button>
      </div>
    )
  }

  if (isEvaluating) {
    return (
      <MockInterviewEvaluating
        evalStep={evalStep}
        evaluationSteps={evaluationSteps}
      />
    )
  }

  const currentQuestionIndex = currentQuestion ? currentQuestion.orderIndex + 1 : totalQuestions
  const progressPercent = (currentQuestionIndex / totalQuestions) * 100

  return (
    <div className="max-w-3xl mx-auto py-8 px-2 space-y-6">
      {/* HEADER & TIẾN TRÌNH */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <button
            onClick={() => router.push('/candidate/mock-interview')}
            className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-blue-600 transition-colors bg-slate-100 hover:bg-slate-200 px-3.5 py-1.5 rounded-full cursor-pointer"
          >
            <ChevronLeft className="w-3.5 h-3.5" /> Quay lại thiết lập
          </button>
          <div className="flex items-center gap-2">
            <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
              AI Recruiter Mode Active
            </span>
          </div>
        </div>

        <div className="flex justify-between items-end mt-2">
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-blue-600 px-2 py-0.5 bg-blue-50 rounded">
              Phỏng vấn giả lập
            </span>
            <h1 className="text-xl font-black text-slate-800 mt-1.5 leading-none">
              {currentSession?.targetRole || 'Luyện tập Phỏng vấn'}
            </h1>
          </div>
          <div className="text-right shrink-0">
            <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">
              Tiến trình
            </span>
            <span className="text-lg font-black text-slate-800 leading-none">
              Câu {currentQuestionIndex} / {totalQuestions}
            </span>
          </div>
        </div>
      </div>

      <div className="w-full bg-slate-200/50 h-2 rounded-full overflow-hidden shadow-inner">
        <motion.div
          className="bg-gradient-to-r from-blue-600 to-indigo-600 h-2 rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${progressPercent}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        />
      </div>

      <Card className="p-6 bg-white border border-slate-200/60 shadow-md rounded-3xl space-y-6 relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-blue-600 to-indigo-600"></div>

        {currentQuestion ? (
          <div className="space-y-6">
            <div className="bg-slate-50/50 border border-slate-100 p-6 rounded-2xl space-y-3 relative overflow-hidden shadow-inner">
              <div className="absolute -right-3 -top-3 w-16 h-16 bg-blue-500/5 rounded-full flex items-center justify-center">
                <HelpCircle className="w-8 h-8 text-blue-500/10" />
              </div>
              <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest block">
                Câu hỏi từ nhà tuyển dụng AI:
              </span>
              <p className="text-lg font-black text-slate-800 leading-relaxed">
                {currentQuestion.questionText}
              </p>
            </div>

            {/* TRẠNG THÁI 1: CHƯA GHI ÂM */}
            {practiceState === 'IDLE' && (
              <MockInterviewIdleState onStartRecording={handleStartRecording} />
            )}

            {/* TRẠNG THÁI 2: ĐANG GHI ÂM */}
            {practiceState === 'RECORDING' && (
              <MockInterviewRecordingState onStopRecording={handleStopRecording} />
            )}

            {/* TRẠNG THÁI 3: ĐÃ GHI ÂM XONG - NGHE LẠI & NỘP */}
            {practiceState === 'REVIEWING' && (
              <MockInterviewReviewingState
                onSubmit={handleSendAnswer}
                audioUrlLocal={audioUrlLocal}
                onRetry={handleRetry}
                isSubmittingOrUploading={submitAnswerMut.isPending || isUploading}
                isUploading={isUploading}
                audioBlob={audioBlob}
                currentQuestionIndex={currentQuestionIndex}
                totalQuestions={totalQuestions}
              />
            )}
          </div>
        ) : (
          <div className="text-center py-12 space-y-4">
            <Loader2 className="w-10 h-10 animate-spin text-blue-500 mx-auto" />
            <p className="text-slate-500 font-bold text-sm">
              Đang hoàn tất cuộc phỏng vấn thử, AI đang tổng hợp kết quả...
            </p>
          </div>
        )}
      </Card>
    </div>
  )
}
