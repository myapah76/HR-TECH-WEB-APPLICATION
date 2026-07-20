'use client'

import React, { useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Card } from '@/src/components/ui/card'
import { Button } from '@/src/components/ui/button'
import { useGetInterviewResult } from '@/src/hooks/interview'
import {
  BookOpen,
  CheckCircle2,
  XCircle,
  ChevronDown,
  ChevronUp,
  MessageSquare,
  ArrowLeft,
  Loader2,
  Bot,
  User,
  Zap,
} from 'lucide-react'

export default function MockInterviewResultPage() {
  const router = useRouter()
  const params = useParams()
  const sessionId = params.sessionId as string

  // State to track which Q&A is expanded
  const [expandedIndex, setExpandedIndex] = useState<number | null>(0)

  // Fetch Evaluation Result
  const { data: result, isLoading, error } = useGetInterviewResult(sessionId)

  const toggleExpand = (idx: number) => {
    setExpandedIndex(expandedIndex === idx ? null : idx)
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
        <p className="text-slate-500 font-bold text-sm">Đang tải báo cáo đánh giá phỏng vấn...</p>
      </div>
    )
  }

  if (error || !result) {
    return (
      <Card className="max-w-md mx-auto p-8 text-center space-y-4 border-red-100 mt-12 bg-white">
        <XCircle className="w-16 h-16 text-red-500 mx-auto" />
        <h2 className="text-xl font-black text-slate-800">Lỗi tải dữ liệu</h2>
        <p className="text-slate-500 text-sm font-medium">
          Không thể tìm thấy kết quả đánh giá cho phiên phỏng vấn này.
        </p>
        <Button onClick={() => router.push('/candidate/mock-interview')} className="bg-slate-800 hover:bg-slate-900 font-bold">
          Quay lại lịch sử
        </Button>
      </Card>
    )
  }

  return (
    <div className="space-y-8 animate-fade-in p-2">
      {/* HEADER SECTION */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-6">
        <div className="space-y-1">
          <button
            onClick={() => router.push('/candidate/mock-interview')}
            className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-blue-600 transition-colors mb-2 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-full"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Quay lại lịch sử
          </button>
          <h1 className="text-2xl font-black text-slate-800 flex items-center gap-2">
            Kết quả đánh giá phỏng vấn
          </h1>
          <p className="text-slate-400 text-xs font-medium">
            Mã phiên phỏng vấn: {sessionId}
          </p>
        </div>
      </div>

      {/* OVERALL SCORE & RADAR/SUMMARY */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Overall Score Circle */}
        <Card className="p-6 bg-white border-slate-200 shadow-sm rounded-2xl flex flex-col items-center justify-center text-center">
          <h3 className="text-slate-400 font-black text-xs uppercase tracking-wider mb-4">
            Điểm số tổng quan
          </h3>
          <div className="relative flex items-center justify-center w-36 h-36 rounded-full bg-blue-50 border-4 border-blue-100 shadow-inner">
            <span className="text-4xl font-black text-blue-600">
              {result.overallScore?.toFixed(1) || '0.0'}
            </span>
            <span className="text-xs text-blue-400 font-bold absolute bottom-6">/ 10</span>
          </div>
          <p className="text-slate-500 text-xs font-medium mt-4">
            Chấm điểm tự động bởi AI Recruiter Engine
          </p>
        </Card>

        {/* Breakdown Scores */}
        <Card className="md:col-span-2 p-6 bg-white border-slate-200 shadow-sm rounded-2xl space-y-6">
          <h3 className="text-slate-400 font-black text-xs uppercase tracking-wider">
            Điểm thành phần chi tiết
          </h3>
          
          <div className="space-y-4">
            {/* Technical Score */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm font-bold text-slate-700">
                <span>Chuyên môn kỹ thuật (Technical)</span>
                <span className="text-blue-600">{result.technicalScore?.toFixed(1) || '0.0'}/10</span>
              </div>
              <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                <div
                  className="bg-blue-600 h-2.5 rounded-full"
                  style={{ width: `${(result.technicalScore || 0) * 10}%` }}
                ></div>
              </div>
            </div>

            {/* Communication Score */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm font-bold text-slate-700">
                <span>Khả năng truyền đạt & Giao tiếp (Communication)</span>
                <span className="text-indigo-600">{result.communicationScore?.toFixed(1) || '0.0'}/10</span>
              </div>
              <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                <div
                  className="bg-indigo-600 h-2.5 rounded-full"
                  style={{ width: `${(result.communicationScore || 0) * 10}%` }}
                ></div>
              </div>
            </div>

            {/* Soft Skills */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm font-bold text-slate-700">
                <span>Kỹ năng mềm & Thái độ (Soft Skills)</span>
                <span className="text-violet-600">{result.softSkillsScore?.toFixed(1) || '0.0'}/10</span>
              </div>
              <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                <div
                  className="bg-violet-600 h-2.5 rounded-full"
                  style={{ width: `${(result.softSkillsScore || 0) * 10}%` }}
                ></div>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* FEEDBACK OVERVIEW (STRENGTHS / WEAKNESSES) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Strengths */}
        <Card className="p-6 bg-white border-slate-200 shadow-sm rounded-2xl border-l-4 border-l-emerald-500">
          <h3 className="font-black text-emerald-700 text-sm flex items-center gap-2 mb-4">
            <CheckCircle2 className="w-5 h-5 text-emerald-500" /> Điểm mạnh nổi bật
          </h3>
          <ul className="space-y-3 text-sm text-slate-600 font-medium">
            {Array.isArray(result.strengths) ? (
              result.strengths.map((str, idx) => (
                <li key={idx} className="flex gap-2">
                  <span className="text-emerald-500 shrink-0">•</span> {str}
                </li>
              ))
            ) : (
              <li>Chưa ghi nhận điểm mạnh nổi bật nào.</li>
            )}
          </ul>
        </Card>

        {/* Weaknesses */}
        <Card className="p-6 bg-white border-slate-200 shadow-sm rounded-2xl border-l-4 border-l-rose-500">
          <h3 className="font-black text-rose-700 text-sm flex items-center gap-2 mb-4">
            <XCircle className="w-5 h-5 text-rose-500" /> Điểm cần cải thiện
          </h3>
          <ul className="space-y-3 text-sm text-slate-600 font-medium">
            {Array.isArray(result.weaknesses) ? (
              result.weaknesses.map((weak, idx) => (
                <li key={idx} className="flex gap-2">
                  <span className="text-rose-500 shrink-0">•</span> {weak}
                </li>
              ))
            ) : (
              <li>Không có điểm yếu nghiêm trọng nào được phát hiện.</li>
            )}
          </ul>
        </Card>
      </div>

      {/* GENERAL COMMENT */}
      <Card className="p-6 bg-white border-slate-200 shadow-sm rounded-2xl">
        <h3 className="font-black text-slate-800 text-sm mb-3 flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-blue-600" /> Nhận xét tổng quan của AI
        </h3>
        <p className="text-slate-600 text-sm font-medium leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-100 shadow-inner">
          {result.generalFeedback}
        </p>
      </Card>

      {/* DETAILED QUESTION BREAKDOWN */}
      <div className="space-y-4">
        <h3 className="font-black text-slate-800 text-base flex items-center gap-2">
          <BookOpen className="w-5.5 h-5.5 text-blue-600" /> Nhận xét chi tiết từng câu hỏi
        </h3>

        <div className="space-y-3">
          {result.detailedFeedback?.map((item, idx) => {
            const isExpanded = expandedIndex === idx

            return (
              <Card
                key={idx}
                className="bg-white border-slate-200 shadow-sm rounded-2xl overflow-hidden"
              >
                {/* Header Collapsible Trigger */}
                <div
                  onClick={() => toggleExpand(idx)}
                  className="p-4 flex items-center justify-between cursor-pointer hover:bg-slate-50 transition-colors select-none font-bold"
                >
                  <div className="flex items-center gap-3 pr-4">
                    <span className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-xs font-black text-slate-700">
                      {idx + 1}
                    </span>
                    <span className="text-slate-800 text-sm font-black line-clamp-1">
                      {item.question}
                    </span>
                  </div>

                  <div className="flex items-center gap-4 shrink-0">
                    <span className="text-xs bg-blue-50 text-blue-600 px-2.5 py-1 rounded-lg font-black">
                      {item.score?.toFixed(1)} / 10
                    </span>
                    {isExpanded ? (
                      <ChevronUp className="w-5 h-5 text-slate-400" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-slate-400" />
                    )}
                  </div>
                </div>

                {/* Collapsible Content */}
                {isExpanded && (
                  <div className="p-6 border-t border-slate-100 bg-slate-50/20 space-y-5 animate-fade-in text-sm font-medium">
                    {/* Full Question */}
                    <div className="space-y-1">
                      <h4 className="text-xs uppercase tracking-wider text-slate-400 font-bold">
                        Câu hỏi
                      </h4>
                      <p className="text-slate-800 font-bold">{item.question}</p>
                    </div>

                    {/* Candidate Answer - Audio Player */}
                    {item.audioUrl && (
                      <div className="space-y-2">
                        <h4 className="text-xs uppercase tracking-wider text-slate-400 font-bold flex items-center gap-1.5">
                          <User className="w-3.5 h-3.5 text-slate-400" /> Bản ghi câu trả lời của bạn
                        </h4>
                        <div className="bg-slate-50 border border-slate-200 p-3 rounded-2xl max-w-md">
                          <audio src={item.audioUrl} controls className="w-full h-8" />
                        </div>
                      </div>
                    )}

                    {/* AI Feedback */}
                    <div className="space-y-2">
                      <h4 className="text-xs uppercase tracking-wider text-slate-400 font-bold flex items-center gap-1.5">
                        <Bot className="w-3.5 h-3.5 text-blue-600 animate-pulse" /> Đánh giá của AI
                      </h4>
                      <div className="bg-blue-50/40 border border-blue-100/50 text-blue-900 rounded-xl p-4 leading-relaxed">
                        {item.feedback}
                      </div>
                    </div>

                    {/* Model Answer */}
                    <div className="space-y-2">
                      <h4 className="text-xs uppercase tracking-wider text-slate-400 font-bold flex items-center gap-1.5">
                        <Zap className="w-3.5 h-3.5 text-amber-500" /> Câu trả lời tối ưu (Gợi ý từ chuyên gia)
                      </h4>
                      <div className="bg-amber-50/30 border border-amber-100/50 text-amber-900 rounded-xl p-4 leading-relaxed font-bold">
                        {item.modelAnswer}
                      </div>
                    </div>
                  </div>
                )}
              </Card>
            )
          })}
        </div>
      </div>
    </div>
  )
}
