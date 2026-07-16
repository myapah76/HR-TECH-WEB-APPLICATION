'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card } from '@/src/components/ui/card'
import { Button } from '@/src/components/ui/button'
import { Input } from '@/src/components/ui/input'
import { Label } from '@/src/components/ui/label'
import { useGetAllCvs } from '@/src/hooks/cv'
import { useGetSavedJobs } from '@/src/hooks/job'
import { useGetInterviewSessionHistory, useStartInterviewSession } from '@/src/hooks/interview'
import {
  MessageSquare,
  Play,
  History,
  Calendar,
  Award,
  Loader2,
  ChevronRight,
  Sparkles,
} from 'lucide-react'
import { toast } from 'sonner'

const commonRoles = [
  'React Frontend Developer',
  'Spring Boot Backend Developer',
  'Fullstack Node.js Developer',
  'Mobile iOS/Android Developer',
  'DevOps Engineer',
  'Data Scientist / ML Engineer',
  'QA/QC Automation Tester',
  'UI/UX Designer',
]

export default function MockInterviewSetupPage() {
  const router = useRouter()
  const [targetRole, setTargetRole] = useState('')
  const [selectedCv, setSelectedCv] = useState('')
  const [selectedJob, setSelectedJob] = useState('')
  const [numQuestions, setNumQuestions] = useState(5)

  // Fetch CVs & Saved Jobs
  const { data: cvs = [], isLoading: loadingCvs } = useGetAllCvs()
  const { data: savedJobs = [] } = useGetSavedJobs()

  // Fetch Interview History
  const { data: history = [], isLoading: loadingHistory } = useGetInterviewSessionHistory()
  const startSessionMutation = useStartInterviewSession()

  const handleStart = (e: React.FormEvent) => {
    e.preventDefault()
    if (!targetRole.trim()) {
      toast.error('Vui lòng nhập hoặc chọn Vị trí phỏng vấn')
      return
    }
    if (!selectedCv) {
      toast.error('Vui lòng chọn một Hồ sơ (CV)')
      return
    }
    startSessionMutation.mutate(
      {
        cvId: selectedCv,
        jobId: selectedJob || null,
        targetRole: targetRole,
        numQuestions: numQuestions,
      },
      {
        onSuccess: (response) => {
          toast.success('Khởi tạo cuộc phỏng vấn thành công!')
          router.push(`/candidate/mock-interview/${response.sessionId}`)
        },
      }
    )
  }
  return (
    <div className="space-y-8 animate-fade-in p-2">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* SETUP FORM */}
        <Card className="lg:col-span-1 p-6 bg-white border-slate-200 shadow-sm rounded-2xl h-fit">
          <h2 className="text-lg font-black text-slate-800 mb-6 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-500" /> Thiết lập Phỏng vấn
          </h2>
          <form onSubmit={handleStart} className="space-y-6">
            {/* Vị trí phỏng vấn */}
            <div className="space-y-2">
              <Label className="font-bold text-slate-700">Vị trí phỏng vấn mục tiêu</Label>
              <Input
                placeholder="Ví dụ: Java Developer, React Developer..."
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
                className="rounded-xl border-slate-200 h-11 focus:ring-2 focus:ring-blue-500 font-medium"
              />
              {/* Quick Select Buttons */}
              <div className="flex flex-wrap gap-1.5 mt-2">
                {commonRoles.slice(0, 4).map((role) => (
                  <button
                    key={role}
                    type="button"
                    onClick={() => setTargetRole(role)}
                    className={`text-xs font-bold px-2.5 py-1.5 rounded-lg border transition-all ${
                      targetRole === role
                        ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100 hover:border-slate-300'
                    }`}
                  >
                    {role.split(' ')[0]} {role.split(' ')[1]}
                  </button>
                ))}
              </div>
            </div>

            {/* Chọn CV */}
            <div className="space-y-2">
              <Label className="font-bold text-slate-700">Chọn CV của bạn</Label>
              {loadingCvs ? (
                <div className="flex items-center gap-2 text-slate-400 text-sm">
                  <Loader2 className="w-4 h-4 animate-spin" /> Đang tải CV...
                </div>
              ) : cvs.length === 0 ? (
                <div className="text-sm text-red-500 font-bold">
                  Bạn chưa tải lên CV nào. Vui lòng vào quản lý CV để tải lên trước.
                </div>
              ) : (
                <select
                  className="flex h-11 w-full items-center justify-between rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer shadow-sm hover:border-slate-300 transition-colors"
                  value={selectedCv}
                  onChange={(e) => setSelectedCv(e.target.value)}
                  required
                >
                  <option value="">-- Chọn CV để AI phân tích --</option>
                  {cvs.map((cv) => (
                    <option key={cv.id} value={cv.id}>
                      {cv.title} {cv.isPrimary ? '(Chính)' : ''}
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Chọn Job (Tùy chọn) */}
            <div className="space-y-2">
              <Label className="font-bold text-slate-700">Công việc mục tiêu (Tùy chọn)</Label>
              <select
                className="flex h-11 w-full items-center justify-between rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer shadow-sm hover:border-slate-300 transition-colors"
                value={selectedJob}
                onChange={(e) => setSelectedJob(e.target.value)}
              >
                <option value="">-- Phỏng vấn tự do theo Vị trí --</option>
                {savedJobs.map((job) => (
                  <option key={job.id} value={job.id}>
                    {job.title} - {job.companyName}
                  </option>
                ))}
              </select>
              <span className="text-xs text-slate-400 font-medium block">
                * Nếu chọn Job, AI sẽ phân tích JD của Job này để đưa ra câu hỏi thực tế sát với yêu
                cầu tuyển dụng.
              </span>
            </div>

            {/* Số câu hỏi */}
            <div className="space-y-2">
              <Label className="font-bold text-slate-700">Số lượng câu hỏi</Label>
              <select
                className="flex h-11 w-full items-center justify-between rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer shadow-sm"
                value={numQuestions}
                onChange={(e) => setNumQuestions(Number(e.target.value))}
              >
                <option value={3}>3 Câu hỏi (Phỏng vấn nhanh)</option>
                <option value={5}>5 Câu hỏi (Mặc định)</option>
                <option value={7}>7 Câu hỏi (Chuyên sâu)</option>
                <option value={10}>10 Câu hỏi (Full test)</option>
              </select>
            </div>

            <Button
              type="submit"
              disabled={startSessionMutation.isPending || !selectedCv}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black h-12 text-base rounded-xl shadow-md transition-transform hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:scale-100"
            >
              {startSessionMutation.isPending ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" /> ĐANG KHỞI TẠO...
                </>
              ) : (
                <>
                  <Play className="w-5 h-5 mr-2" /> BẮT ĐẦU PHỎNG VẤN
                </>
              )}
            </Button>
          </form>
        </Card>

        {/* INTERVIEW HISTORY */}
        <Card className="lg:col-span-2 p-6 bg-white border-slate-200 shadow-sm rounded-2xl">
          <h2 className="text-lg font-black text-slate-800 mb-6 flex items-center gap-2 border-b border-slate-100 pb-3">
            <History className="w-5 h-5 text-blue-600" /> Lịch sử phỏng vấn thử
          </h2>

          {loadingHistory ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
            </div>
          ) : history.length === 0 ? (
            <div className="text-center py-16 text-slate-500 space-y-4">
              <MessageSquare className="w-16 h-16 text-slate-200 mx-auto" />
              <p className="font-bold">Bạn chưa tham gia cuộc phỏng vấn thử nào.</p>
              <p className="text-xs text-slate-400">
                Hãy cấu hình các thông số bên trái và bấm nút {'Bắt đầu phỏng vấn'} để thực hành
                ngay.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {history.map((session) => (
                <div
                  key={session.sessionId}
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border border-slate-100 rounded-xl hover:bg-slate-50/50 hover:border-slate-200 transition-all gap-4"
                >
                  <div className="space-y-1">
                    <div className="font-black text-slate-800 text-base">{session.targetRole}</div>
                    <div className="flex flex-wrap items-center gap-y-1 gap-x-3 text-xs text-slate-500 font-medium">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" /> {session.totalQuestions}{' '}
                        câu hỏi
                      </span>
                      <span
                        className={`font-black px-2 py-0.5 rounded-md text-[10px] uppercase ${
                          session.status === 'COMPLETED'
                            ? 'bg-emerald-50 text-emerald-600'
                            : session.status === 'IN_PROGRESS'
                              ? 'bg-amber-50 text-amber-600'
                              : 'bg-red-50 text-red-600'
                        }`}
                      >
                        {session.status === 'COMPLETED' ? 'Đã hoàn thành' : 'Đang diễn ra'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 justify-between sm:justify-end border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-100">
                    {session.status === 'COMPLETED' && (
                      <div className="flex items-center gap-1.5 shrink-0 bg-blue-50/60 border border-blue-100/50 px-3 py-1.5 rounded-lg">
                        <Award className="w-4 h-4 text-blue-600" />
                        <span className="text-xs text-slate-500 font-bold">AI đánh giá: </span>
                        {/* Overall score is loaded asynchronously. In page listing, if overall score isn't pre-loaded, we let user click to load detail */}
                        <span className="text-sm font-black text-blue-600">Đã chấm</span>
                      </div>
                    )}

                    <Button
                      onClick={() => {
                        if (session.status === 'COMPLETED') {
                          router.push(`/candidate/mock-interview/${session.sessionId}/result`)
                        } else {
                          router.push(`/candidate/mock-interview/${session.sessionId}`)
                        }
                      }}
                      variant={session.status === 'COMPLETED' ? 'outline' : 'default'}
                      size="sm"
                      className={`font-bold rounded-xl flex items-center gap-1 ${
                        session.status === 'COMPLETED'
                          ? 'text-slate-700 border-slate-200 hover:bg-slate-100'
                          : 'bg-amber-500 hover:bg-amber-600 text-white'
                      }`}
                    >
                      {session.status === 'COMPLETED' ? 'Xem kết quả' : 'Tiếp tục'}
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}
