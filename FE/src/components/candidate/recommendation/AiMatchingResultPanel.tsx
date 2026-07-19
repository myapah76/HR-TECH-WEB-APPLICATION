'use client'

import React from 'react'
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/src/components/ui/card'
import {
  TrendingUp,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  BookOpen,
  ArrowRight,
} from 'lucide-react'

interface AiMatchingResultPanelProps {
  matchScore: {
    overallScore: number
    matchGrade: string
    matchedSkills: string[]
    missingSkills: string[]
    skillDetails: Array<{
      skillName: string
      matchStatus: string
      matchType?: string
    }>
    improvementTips?: string
    actionPlan?: string[]
  }
}

export function AiMatchingResultPanel({ matchScore }: AiMatchingResultPanelProps) {
  // Color-coded grade
  const getGradeStyles = (grade: string) => {
    switch (grade?.toUpperCase()) {
      case 'XUẤT SẮC':
      case 'EXCELLENT':
        return { text: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-200', scoreBg: 'stroke-emerald-500' }
      case 'TỐT':
      case 'GOOD':
        return { text: 'text-blue-600', bg: 'bg-blue-50 border-blue-200', scoreBg: 'stroke-blue-500' }
      case 'TRUNG BÌNH':
      case 'AVERAGE':
        return { text: 'text-amber-600', bg: 'bg-amber-50 border-amber-200', scoreBg: 'stroke-amber-500' }
      default:
        return { text: 'text-rose-600', bg: 'bg-rose-50 border-rose-200', scoreBg: 'stroke-rose-500' }
    }
  }

  const gradeStyles = getGradeStyles(matchScore.matchGrade)

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Overview Score Card */}
      <Card className="border-slate-200/80 shadow-md bg-white overflow-hidden">
        <CardHeader className="bg-slate-50/50 border-b border-slate-100 flex flex-row items-center justify-between py-4">
          <div>
            <CardTitle className="text-slate-800 text-base font-bold">Báo Cáo Điểm Phù Hợp</CardTitle>
            <CardDescription className="text-xs">Kết quả đánh giá từ AI Platform</CardDescription>
          </div>
          <span className={`px-3 py-1 rounded-full text-xs font-extrabold border ${gradeStyles.bg} ${gradeStyles.text} flex items-center gap-1 shadow-sm`}>
            <TrendingUp className="w-3.5 h-3.5" /> Hạng: {matchScore.matchGrade}
          </span>
        </CardHeader>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row items-center justify-around gap-6">
            {/* Gauge Animation */}
            <div className="relative flex items-center justify-center shrink-0">
              <svg className="w-36 h-36 transform -rotate-90">
                <circle
                  cx="72"
                  cy="72"
                  r="62"
                  className="stroke-slate-100"
                  strokeWidth="12"
                  fill="none"
                />
                <circle
                  cx="72"
                  cy="72"
                  r="62"
                  className={`transition-all duration-1000 ease-out ${gradeStyles.scoreBg}`}
                  strokeWidth="12"
                  fill="none"
                  strokeDasharray="389.56"
                  strokeDashoffset={389.56 - (389.56 * (matchScore.overallScore * 100)) / 100}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute flex flex-col items-center justify-center">
                <span className="text-3.5xl font-black text-slate-800">
                  {(matchScore.overallScore * 100).toFixed(0)}%
                </span>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">Tương thích</span>
              </div>
            </div>

            {/* Quick description info */}
            <div className="flex-1 text-center sm:text-left space-y-3">
              <h3 className="font-extrabold text-slate-800 text-lg">Mức độ đáp ứng kỹ năng</h3>
              <p className="text-slate-500 text-sm leading-relaxed">
                Hồ sơ của bạn đã đáp ứng được phần lớn các yêu cầu kỹ năng cần thiết cho công việc này. 
                Dưới đây là thống kê chi tiết các kỹ năng trùng khớp và hướng dẫn cải thiện từ AI.
              </p>
              
              <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-100">
                <div>
                  <p className="text-xs text-slate-400 font-semibold">Kỹ năng trùng khớp</p>
                  <p className="text-xl font-bold text-emerald-600 mt-1">{matchScore.matchedSkills?.length || 0}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400 font-semibold">Kỹ năng còn thiếu</p>
                  <p className="text-xl font-bold text-rose-600 mt-1">{matchScore.missingSkills?.length || 0}</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Skills breakdown section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Matched Skills */}
        <Card className="border-emerald-100 shadow-sm bg-emerald-50/10">
          <CardHeader className="py-4">
            <CardTitle className="text-sm font-bold text-emerald-800 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" /> Kỹ Năng Trùng Khớp
            </CardTitle>
          </CardHeader>
          <CardContent className="pb-4">
            <div className="flex flex-wrap gap-1.5">
              {matchScore.matchedSkills?.length > 0 ? (
                matchScore.matchedSkills.map((skill: string) => (
                  <span
                    key={skill}
                    className="px-2.5 py-1.5 bg-emerald-100/60 border border-emerald-200 text-emerald-800 text-xs font-semibold rounded-lg shadow-sm"
                  >
                    {skill}
                  </span>
                ))
              ) : (
                <span className="text-xs text-slate-500">Không tìm thấy kỹ năng trùng khớp trực tiếp.</span>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Missing Skills */}
        <Card className="border-rose-100 shadow-sm bg-rose-50/10">
          <CardHeader className="py-4">
            <CardTitle className="text-sm font-bold text-rose-800 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-rose-600" /> Kỹ Năng Thiếu Sót
            </CardTitle>
          </CardHeader>
          <CardContent className="pb-4">
            <div className="flex flex-wrap gap-1.5">
              {matchScore.missingSkills?.length > 0 ? (
                matchScore.missingSkills.map((skill: string) => (
                  <span
                    key={skill}
                    className="px-2.5 py-1.5 bg-rose-100/60 border border-rose-200 text-rose-800 text-xs font-semibold rounded-lg shadow-sm"
                  >
                    {skill}
                  </span>
                ))
              ) : (
                <span className="text-xs text-slate-500 font-medium text-emerald-700">
                  🎉 Tuyệt vời! Bạn đáp ứng đầy đủ kỹ năng.
                </span>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Skills detail comparing table */}
      {matchScore.skillDetails?.length > 0 && (
        <Card className="border-slate-200 shadow-sm bg-white overflow-hidden">
          <CardHeader className="bg-slate-50/30 py-4">
            <CardTitle className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <HelpCircle className="w-4.5 h-4.5 text-slate-500" /> Chi Tiết Mức Độ Kỹ Năng
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-y border-slate-100 text-slate-500 font-bold uppercase tracking-wider">
                    <th className="px-5 py-3.5">Kỹ năng</th>
                    <th className="px-5 py-3.5 text-center">Trạng thái</th>
                    <th className="px-5 py-3.5">Phương thức so khớp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {matchScore.skillDetails.map((detail: any, idx: number) => (
                    <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-5 py-4 font-bold text-slate-700">{detail.skillName}</td>
                      <td className="px-5 py-4 text-center">
                        <span className={`inline-flex px-2 py-1 rounded-md text-[10px] font-extrabold ${
                          detail.matchStatus?.includes('Trùng khớp') 
                            ? 'bg-emerald-100 text-emerald-800' 
                            : 'bg-rose-100 text-rose-800'
                        }`}>
                          {detail.matchStatus}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-slate-500">
                        {detail.matchType && detail.matchType !== 'NONE' ? (
                          <span className="font-semibold text-blue-600 bg-blue-50 px-2 py-1 rounded-md text-[10px] uppercase border border-blue-100">
                            {detail.matchType}
                          </span>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* AI Coaching & Action plan roadmap (Blue-themed premium background) */}
      {(matchScore.improvementTips || (matchScore.actionPlan && matchScore.actionPlan.length > 0)) && (
        <div className="p-6 rounded-2xl bg-gradient-to-tr from-slate-900 to-blue-950 border border-slate-800 text-white shadow-xl relative overflow-hidden">
          {/* Decorative glowing background mesh */}
          <div className="absolute right-0 bottom-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl -z-0"></div>
          
          <div className="relative z-10 space-y-6">
            <div className="flex items-center gap-2.5 pb-4 border-b border-white/10">
              <div className="p-2 bg-white/10 text-blue-300 rounded-xl">
                <BookOpen className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-extrabold text-lg text-white">AI Tư Vấn Cải Thiện CV</h4>
                <p className="text-[11px] text-blue-200">Lời khuyên học tập từ chuyên gia AI Platform</p>
              </div>
            </div>

            {/* Improvement Advice */}
            {matchScore.improvementTips && (
              <div className="space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-blue-300 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Lời khuyên tối ưu CV:
                </span>
                <p className="text-sm text-blue-100/90 leading-relaxed whitespace-pre-wrap pl-5">
                  {matchScore.improvementTips}
                </p>
              </div>
            )}

            {/* Action learning Roadmap */}
            {matchScore.actionPlan && matchScore.actionPlan.length > 0 && (
              <div className="space-y-4 pt-2">
                <span className="text-xs font-bold uppercase tracking-wider text-blue-300 flex items-center gap-1.5">
                  <ArrowRight className="w-3.5 h-3.5" /> Lộ trình học tập đề xuất:
                </span>
                
                <div className="relative pl-6 border-l-2 border-blue-500/30 space-y-5 ml-2.5">
                  {matchScore.actionPlan.map((plan: string, idx: number) => (
                    <div key={idx} className="relative animate-in fade-in slide-in-from-left-4 duration-300" style={{ animationDelay: `${idx * 150}ms` }}>
                      {/* Step dot */}
                      <div className="absolute -left-[31px] top-1 w-4 h-4 rounded-full border-2 border-blue-400 bg-slate-900 flex items-center justify-center text-[9px] font-bold text-blue-300">
                        {idx + 1}
                      </div>
                      <h5 className="font-bold text-white text-sm">Bước {idx + 1}</h5>
                      <p className="text-xs text-blue-200/90 leading-relaxed mt-0.5">{plan}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
