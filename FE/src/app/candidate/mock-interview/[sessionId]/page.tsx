'use client'

import React, { useState, useEffect, useRef } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Card } from '@/src/components/ui/card'
import { Button } from '@/src/components/ui/button'
import { QuestionResponse } from '@/src/types/interview'
import { Mic, Loader2, Sparkles, HelpCircle, ArrowRight, ChevronLeft } from 'lucide-react'
import { toast } from 'sonner'
import { motion } from 'motion/react'
import {
  useGetInterviewSessionHistory,
  useSubmitInterviewAnswer,
  useSubmitAndEvaluateInterview,
} from '@/src/hooks/interview'

export default function MockInterviewPracticePage() {
  const router = useRouter()
  const params = useParams()
  const sessionId = params.sessionId as string

  // State
  const [currentQuestion, setCurrentQuestion] = useState<QuestionResponse | null>(null)
  const [answerText, setAnswerText] = useState('')
  const [practiceState, setPracticeState] = useState<'IDLE' | 'RECORDING' | 'REVIEWING'>('IDLE')

  // Voice Recording State
  const [isListening, setIsListening] = useState(false)
  const recognitionRef = useRef<any>(null)

  // Loading Screen State
  const [isEvaluating, setIsEvaluating] = useState(false)
  const [evalStep, setEvalStep] = useState(0)

  // Fetch all sessions to find the current active target role & details
  const { data: history = [], isLoading } = useGetInterviewSessionHistory()
  const evaluateSessionMut = useSubmitAndEvaluateInterview()
  const submitAnswerMut = useSubmitInterviewAnswer()

  const currentSession = history.find((s) => s.sessionId === sessionId)
  const totalQuestions = currentSession?.totalQuestions || 5

  // Load first question if not loaded
  useEffect(() => {
    if (currentSession && currentSession.currentQuestion && !currentQuestion) {
      setCurrentQuestion(currentSession.currentQuestion)
    }
  }, [currentSession, currentQuestion])

  // Reset state on question change
  useEffect(() => {
    setPracticeState('IDLE')
    setAnswerText('')
  }, [currentQuestion?.id])

  // Submit Answer Mutation

  // Speech Recognition Setup
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition()
        recognition.continuous = true
        recognition.interimResults = true
        recognition.lang = 'vi-VN'

        recognition.onresult = (event: any) => {
          let fullTranscript = ''
          for (let i = 0; i < event.results.length; ++i) {
            fullTranscript += event.results[i][0].transcript
          }
          setAnswerText(fullTranscript)
        }

        recognition.onerror = (event: any) => {
          setIsListening(false)
          if (event.error === 'not-allowed') {
            toast.error('Vui lòng cấp quyền truy cập Microphone cho trình duyệt')
          }
        }

        recognition.onend = () => {
          setIsListening(false)
          setPracticeState((prev) => (prev === 'RECORDING' ? 'REVIEWING' : prev))
        }

        recognitionRef.current = recognition
      }
    }
  }, [])

  const handleStartRecording = () => {
    if (!recognitionRef.current) {
      toast.error('Trình duyệt của bạn không hỗ trợ nhận dạng giọng nói')
      return
    }
    setAnswerText('')
    setPracticeState('RECORDING')
    setIsListening(true)
    try {
      recognitionRef.current.start()
      toast.info('Micro đang lắng nghe... Hãy nói câu trả lời của bạn.')
    } catch (e) {
      console.error(e)
    }
  }

  const handleStopRecording = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop()
    }
    setIsListening(false)
    setPracticeState('REVIEWING')
  }

  const handleRetry = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop()
    }
    setIsListening(false)
    setAnswerText('')
    setPracticeState('IDLE')
    toast.info('Đã xóa câu trả lời cũ. Hãy bắt đầu lại.')
  }

  const handleSendAnswer = (e: React.FormEvent) => {
    e.preventDefault()
    if (!answerText.trim() || !currentQuestion) return

    // Stop listening if active
    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop()
      setIsListening(false)
    }

    submitAnswerMut.mutate(
      {
        sessionId: sessionId,
        request: {
          questionId: currentQuestion?.id || '',
          answerText: answerText,
        },
      },
      {
        onSuccess: (data) => {
          setAnswerText('')

          if (data.finished) {
            // Tự động gọi chấm điểm
            setIsEvaluating(true)
            setEvalStep(0)
            // Submit Interview and Start AI Evaluation Mutation
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
  }

  // Loading Steps Animation Effect
  useEffect(() => {
    if (isEvaluating) {
      const interval = setInterval(() => {
        setEvalStep((prev) => (prev < 3 ? prev + 1 : prev))
      }, 5000)
      return () => clearInterval(interval)
    }
  }, [isEvaluating])

  const evaluationSteps = [
    'Đang tải lên lịch sử cuộc phỏng vấn thử...',
    'AI đang đọc và đối soát câu trả lời của bạn với CV & JD...',
    'Đang phân tích chuyên môn kỹ thuật & kỹ năng giao tiếp...',
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
      <div className="fixed inset-0 z-50 bg-slate-900 flex flex-col items-center justify-center text-white p-6 animate-fade-in">
        <div className="max-w-md w-full text-center space-y-8">
          {/* Animated Spinner with Sparkles */}
          <div className="relative inline-block">
            <Loader2 className="w-24 h-24 text-blue-500 animate-spin mx-auto" />
            <Sparkles className="w-8 h-8 text-amber-400 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 animate-ping" />
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-black tracking-tight text-white">AI Đang Chấm Điểm</h2>
            <p className="text-slate-400 text-sm font-medium">
              Quá trình này có thể mất từ 15 đến 30 giây để phân tích chuyên sâu nhất
            </p>
          </div>

          {/* Progress Steps Indicators */}
          <div className="bg-slate-800/50 border border-slate-700/50 p-6 rounded-2xl text-left space-y-4">
            {evaluationSteps.map((step, idx) => (
              <div
                key={idx}
                className={`flex items-center gap-3 text-xs transition-opacity duration-300 ${evalStep === idx
                    ? 'text-blue-400 font-bold opacity-100'
                    : evalStep > idx
                      ? 'text-emerald-400 font-bold opacity-80'
                      : 'text-slate-500 opacity-40'
                  }`}
              >
                <div
                  className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 border text-[10px] ${evalStep === idx
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
      {/* BACK BUTTON & ACCENT */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <button
            onClick={() => router.push('/candidate/mock-interview')}
            className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-blue-600 transition-colors bg-slate-105 hover:bg-slate-200 px-3.5 py-1.5 rounded-full cursor-pointer"
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

        {/* HEADER SECTION */}
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
            <span className="text-[10px] text-slate-405 font-bold block uppercase tracking-wider">
              Tiến trình
            </span>
            <span className="text-lg font-black text-slate-800 leading-none">
              Câu {currentQuestionIndex} / {totalQuestions}
            </span>
          </div>
        </div>
      </div>

      {/* PROGRESS BAR */}
      <div className="w-full bg-slate-200/50 h-2 rounded-full overflow-hidden shadow-inner">
        <motion.div
          className="bg-linear-to-r from-blue-600 to-indigo-600 h-2 rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${progressPercent}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        />
      </div>

      {/* QUESTION & RESPONSE WORKSPACE */}
      <Card className="p-6 bg-white border border-slate-200/60 shadow-md rounded-3xl space-y-6 relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-linear-to-r from-blue-600 to-indigo-600"></div>

        {currentQuestion ? (
          <div className="space-y-6">
            {/* QUESTION DISPLAY */}
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

            {/* CONDITIONAL RENDER BASED ON PRACTICE STATE */}
            {practiceState === 'IDLE' && (
              <div className="flex flex-col items-center justify-center py-12 bg-slate-50/30 rounded-2xl border border-slate-100 shadow-inner space-y-4">
                <div className="p-4 bg-blue-50 text-blue-600 rounded-full animate-pulse">
                  <Mic className="w-8 h-8" />
                </div>
                <div className="text-center space-y-1">
                  <h3 className="font-black text-slate-800 text-base">Sẵn sàng trả lời?</h3>
                  <p className="text-xs text-slate-400 font-semibold max-w-sm px-4">
                    Hãy bấm nút bên dưới và nói câu trả lời của bạn vào Microphone.
                  </p>
                </div>
                <Button
                  type="button"
                  onClick={handleStartRecording}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-black h-12 px-6 rounded-xl shadow-md transition-all hover:scale-[1.02] active:scale-95 flex items-center gap-2 cursor-pointer mt-2"
                >
                  <Mic className="w-4 h-4" />
                  BẮT ĐẦU TRẢ LỜI
                </Button>
              </div>
            )}

            {practiceState === 'RECORDING' && (
              <div className="space-y-5">
                <div className="space-y-2">
                  <div className="flex justify-between items-center px-1">
                    <label className="text-xs font-bold text-slate-650">
                      Văn bản đang ghi âm từ giọng nói (không thể sửa):
                    </label>
                    <span className="text-[10px] font-black text-red-500 flex items-center gap-1.5 animate-pulse bg-red-50 px-2.5 py-1 rounded border border-red-100/50">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-500 inline-block"></span>
                      ĐANG NGHE TRỰC TIẾP
                    </span>
                  </div>
                  <textarea
                    className="w-full min-h-45 max-h-75 rounded-2xl border border-blue-200 bg-blue-50/5 p-5 text-sm font-semibold text-slate-650 shadow-xs resize-none"
                    placeholder="Hãy nói lớn câu trả lời của bạn vào mic. Chữ sẽ tự động xuất hiện tại đây..."
                    value={answerText}
                    readOnly
                    disabled
                  />
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between border-t border-slate-100 pt-6 gap-4">
                  <div className="flex items-center gap-3">
                    <div className="relative shrink-0">
                      <motion.span
                        className="absolute -inset-1.5 rounded-full bg-red-500/30"
                        animate={{ scale: [1, 1.4, 1] }}
                        transition={{ repeat: Infinity, duration: 1.5 }}
                      />
                      <motion.span
                        className="absolute -inset-3 rounded-full bg-red-500/15"
                        animate={{ scale: [1, 1.6, 1] }}
                        transition={{ repeat: Infinity, duration: 1.5, delay: 0.3 }}
                      />
                      <button
                        type="button"
                        onClick={handleStopRecording}
                        className="relative z-10 p-4 rounded-full bg-red-500 text-white border border-red-500 hover:bg-red-650 transition-all shadow-md cursor-pointer animate-pulse"
                        title="Dừng ghi âm"
                      >
                        <Mic className="w-5 h-5 animate-pulse" />
                      </button>
                    </div>
                    <div className="flex flex-col justify-center">
                      <span className="text-xs font-black text-red-500">
                        Đang ghi âm... Hãy nói câu trả lời của bạn.
                      </span>
                      <span className="text-[10px] text-slate-400 font-medium mt-0.5">
                        Bấm nút đỏ hoặc click {'HOÀN THÀNH NÓI'} để sửa câu trả lời.
                      </span>
                    </div>
                  </div>

                  <Button
                    type="button"
                    onClick={handleStopRecording}
                    className="bg-red-500 hover:bg-red-600 text-white font-black h-12 px-6 rounded-xl shadow-md transition-all hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2 cursor-pointer animate-fade-in"
                  >
                    HOÀN THÀNH NÓI
                  </Button>
                </div>
              </div>
            )}

            {practiceState === 'REVIEWING' && (
              <form onSubmit={handleSendAnswer} className="space-y-5">
                <div className="space-y-2">
                  <div className="flex justify-between items-center px-1">
                    <label className="text-xs font-bold text-slate-600">
                      Chỉnh sửa câu trả lời của bạn:
                    </label>
                    <span className="text-[10px] font-black text-blue-600 bg-blue-50 px-2.5 py-1 rounded border border-blue-100/50">
                      ĐÃ DỪNG NÓI - CÓ THỂ SỬA
                    </span>
                  </div>
                  <textarea
                    className="w-full min-h-45 max-h-75 rounded-2xl border border-slate-200 bg-slate-50/20 p-5 text-sm font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all shadow-xs resize-none"
                    placeholder="Hãy chỉnh sửa lại các thuật ngữ bị nhận diện sai hoặc bổ sung nội dung..."
                    value={answerText}
                    onChange={(e) => setAnswerText(e.target.value)}
                    disabled={submitAnswerMut.isPending}
                    required
                  />
                </div>

                <div className="flex items-center justify-between border-t border-slate-100 pt-6 gap-4">
                  <button
                    type="button"
                    onClick={handleRetry}
                    disabled={submitAnswerMut.isPending}
                    className="bg-white hover:bg-slate-50 text-slate-700 font-bold border border-slate-200 h-12 px-6 rounded-xl shadow-xs transition-all hover:scale-[1.02] active:scale-95 cursor-pointer flex items-center justify-center"
                  >
                    THỬ LẠI (LÀM LẠI)
                  </button>

                  <Button
                    type="submit"
                    disabled={!answerText.trim() || submitAnswerMut.isPending}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-black h-12 px-6 rounded-xl shadow-md transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {currentQuestionIndex === totalQuestions
                      ? 'NỘP BÀI & XEM KẾT QUẢ'
                      : 'CÂU TIẾP THEO'}
                    {submitAnswerMut.isPending ? (
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
              Đang hoàn tất cuộc phỏng vấn thử, AI đang chấm điểm...
            </p>
          </div>
        )}
      </Card>
    </div>
  )
}
