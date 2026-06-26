'use client'

import React, { useState, useEffect, useRef } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Card } from '@/src/components/ui/card'
import { Button } from '@/src/components/ui/button'
import { QuestionResponse } from '@/src/types/interview'
import {
  Mic,
  Loader2,
  Sparkles,
  HelpCircle,
  ArrowRight,
  ChevronLeft,
  Square,
  RefreshCw,
} from 'lucide-react'
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
      <div className="fixed inset-0 z-50 bg-slate-900 flex flex-col items-center justify-center text-white p-6">
        <div className="max-w-md w-full text-center space-y-8 animate-fade-in">
          <div className="relative inline-block">
            <Loader2 className="w-24 h-24 text-blue-500 animate-spin mx-auto" />
            <Sparkles className="w-8 h-8 text-amber-400 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 animate-ping" />
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-black tracking-tight">AI Đang Chấm Điểm Toàn Diện</h2>
            <p className="text-slate-400 text-sm font-medium">
              Quá trình phân tích tệp âm thanh có thể mất 15-30 giây để hoàn thành
            </p>
          </div>

          <div className="bg-slate-800/50 border border-slate-700/50 p-6 rounded-2xl text-left space-y-4 shadow-xl">
            {evaluationSteps.map((step, idx) => (
              <div
                key={idx}
                className={`flex items-center gap-3 text-xs transition-opacity duration-300 ${
                  evalStep === idx
                    ? 'text-blue-400 font-bold opacity-100'
                    : evalStep > idx
                      ? 'text-emerald-400 font-bold opacity-80'
                      : 'text-slate-500 opacity-40'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 border text-[10px] ${
                    evalStep === idx
                      ? 'border-blue-400 animate-pulse bg-blue-500/10'
                      : evalStep > idx
                        ? 'border-emerald-400 bg-emerald-500/15'
                        : 'border-slate-600'
                  }`}
                >
                  {evalStep > idx ? '✓' : idx + 1}
                </div>
                <span>{step}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
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
              <div className="flex flex-col items-center justify-center py-12 bg-slate-50/30 rounded-2xl border border-slate-100 shadow-inner space-y-4">
                <div className="p-4 bg-blue-50 text-blue-600 rounded-full animate-pulse">
                  <Mic className="w-8 h-8" />
                </div>
                <div className="text-center space-y-1">
                  <h3 className="font-black text-slate-800 text-base">Sẵn sàng trả lời?</h3>
                  <p className="text-xs text-slate-405 font-semibold max-w-sm px-4">
                    Hãy chuẩn bị câu trả lời của bạn, sau đó nhấn nút ghi âm và nói.
                  </p>
                </div>
                <Button
                  type="button"
                  onClick={handleStartRecording}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-black h-12 px-6 rounded-xl shadow-md transition-all hover:scale-[1.02] active:scale-95 flex items-center gap-2 cursor-pointer mt-2"
                >
                  <Mic className="w-4 h-4" />
                  BẮT ĐẦU NÓI
                </Button>
              </div>
            )}

            {/* TRẠNG THÁI 2: ĐANG GHI ÂM */}
            {practiceState === 'RECORDING' && (
              <div className="flex flex-col items-center justify-center py-12 bg-red-50/20 rounded-2xl border border-red-100 shadow-inner space-y-5 animate-pulse">
                <div className="relative">
                  <motion.div
                    className="absolute -inset-3 rounded-full bg-red-500/20"
                    animate={{ scale: [1, 1.4, 1] }}
                    transition={{ repeat: Infinity, duration: 1.2 }}
                  />
                  <div className="p-4 bg-red-500 text-white rounded-full relative z-10">
                    <Mic className="w-8 h-8 animate-bounce" />
                  </div>
                </div>

                <div className="text-center space-y-1">
                  <span className="text-sm font-bold text-red-500 block uppercase tracking-widest">
                    ĐANG GHI ÂM...
                  </span>
                  <p className="text-xs text-slate-400 font-medium">
                    AI đang thu nhận giọng nói của bạn trực tiếp
                  </p>
                </div>

                <Button
                  type="button"
                  onClick={handleStopRecording}
                  className="bg-red-500 hover:bg-red-650 text-white font-black h-12 px-8 rounded-xl shadow-md transition-all hover:scale-[1.02] active:scale-95 flex items-center gap-2 cursor-pointer"
                >
                  <Square className="w-4 h-4 fill-white" />
                  HOÀN THÀNH NÓI
                </Button>
              </div>
            )}

            {/* TRẠNG THÁI 3: ĐÃ GHI ÂM XONG - NGHE LẠI & NỘP */}
            {practiceState === 'REVIEWING' && (
              <form onSubmit={handleSendAnswer} className="space-y-6">
                <div className="bg-slate-50 border border-slate-200/60 p-6 rounded-2xl space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-slate-650 block uppercase tracking-wider">
                      Nghe lại câu trả lời:
                    </span>
                    <span className="text-[10px] font-black text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                      Ghi âm sẵn sàng
                    </span>
                  </div>

                  {audioUrlLocal && (
                    <div className="flex items-center justify-center p-2 bg-white rounded-xl border shadow-xs">
                      <audio src={audioUrlLocal} controls className="w-full" />
                    </div>
                  )}

                  <p className="text-[11px] text-slate-400 font-medium leading-relaxed">
                    * Bạn có thể nghe lại để kiểm tra âm lượng. Nếu thấy chưa ưng ý hoặc bị ồn, hãy
                    bấm **THỬ LẠI** để ghi âm lại.
                  </p>
                </div>

                <div className="flex items-center justify-between border-t border-slate-100 pt-6 gap-4">
                  <button
                    type="button"
                    onClick={handleRetry}
                    disabled={submitAnswerMut.isPending || isUploading}
                    className="bg-white hover:bg-slate-50 text-slate-700 font-bold border border-slate-200 h-12 px-6 rounded-xl shadow-xs transition-all hover:scale-[1.02] active:scale-95 cursor-pointer flex items-center gap-2"
                  >
                    <RefreshCw className="w-4 h-4" />
                    THỬ LẠI
                  </button>

                  <Button
                    type="submit"
                    disabled={!audioBlob || submitAnswerMut.isPending || isUploading}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-black h-12 px-6 rounded-xl shadow-md transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {isUploading
                      ? 'ĐANG TẢI AUDIO...'
                      : currentQuestionIndex === totalQuestions
                        ? 'NỘP BÀI & XEM KẾT QUẢ'
                        : 'CÂU TIẾP THEO'}
                    {submitAnswerMut.isPending || isUploading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <ArrowRight className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </form>
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
