'use client'

import React, { useMemo } from 'react'
import { Briefcase, Loader2, Zap } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/src/components/ui/card'
import { Button } from '@/src/components/ui/button'

interface Job {
  id: string
  title: string
  status: string
}

interface CandidateMatchConfigCardProps {
  jobs: Job[]
  loadingJobs: boolean
  selectedJobId: string
  setSelectedJobId: (id: string) => void
  onFind: () => void
  isFinding: boolean
}

export function CandidateMatchConfigCard({
  jobs,
  loadingJobs,
  selectedJobId,
  setSelectedJobId,
  onFind,
  isFinding,
}: CandidateMatchConfigCardProps) {
  const activeJobs = useMemo(
    () => jobs.filter((j) => j.status === 'OPEN' || j.status === 'APPROVED'),
    [jobs]
  )

  return (
    <Card className="border-slate-200/60 shadow-xs bg-white rounded-2xl">
      <CardHeader className="border-b border-slate-100 bg-slate-50/50 p-6">
        <CardTitle className="flex items-center gap-2 text-slate-900 text-lg font-black">
          <Briefcase className="w-5 h-5 text-emerald-600" />
          Tìm Ứng Viên Phù Hợp
        </CardTitle>
        <p className="text-xs text-slate-500 mt-1">
          Chọn vị trí tuyển dụng để hệ thống gợi ý ứng viên phù hợp nhất dựa trên kỹ năng.
        </p>
      </CardHeader>

      <CardContent className="p-6 space-y-6">
        {/* Job selector */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            Vị trí tuyển dụng
          </label>
          {loadingJobs ? (
            <div className="flex items-center gap-2 text-slate-400 py-2">
              <Loader2 className="w-4 h-4 animate-spin text-emerald-600" />
              <span className="text-sm">Đang tải danh sách vị trí...</span>
            </div>
          ) : activeJobs.length === 0 ? (
            <p className="text-sm text-slate-400 italic py-2">
              Không có vị trí tuyển dụng nào đang mở.
            </p>
          ) : (
            <select
              id="find-candidates-job-select"
              value={selectedJobId}
              onChange={(e) => setSelectedJobId(e.target.value)}
              className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
            >
              <option value="">-- Chọn vị trí --</option>
              {activeJobs.map((job) => (
                <option key={job.id} value={job.id}>
                  {job.title}
                </option>
              ))}
            </select>
          )}
        </div>

        {/* AI credit notice */}
        <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-100 rounded-xl px-4 py-3">
          <Zap className="w-4 h-4 text-emerald-500 flex-shrink-0" />
          <p className="text-xs text-emerald-700 font-semibold">
            Tính năng này tiêu thụ <span className="font-black">50 AI Credits</span> mỗi lần tìm kiếm.
          </p>
        </div>

        {/* Action button */}
        <Button
          id="find-candidates-btn"
          onClick={onFind}
          disabled={!selectedJobId || isFinding}
          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm py-3 px-6 rounded-xl transition-all duration-200 shadow-md hover:shadow-lg active:scale-98 disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
        >
          {isFinding ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Đang phân tích...
            </>
          ) : (
            'Tìm Ứng Viên'
          )}
        </Button>
      </CardContent>
    </Card>
  )
}
