'use client'

import React from 'react'
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/src/components/ui/card'
import { Button } from '@/src/components/ui/button'
import { Label } from '@/src/components/ui/label'
import { CvExtractionStatus } from '@/src/enums/cv.enum'
import { CvSummaryResponse } from '@/src/types/cv'
import { ScanSearch, PlayCircle, FileText, Briefcase, MapPin, DollarSign } from 'lucide-react'
import Link from 'next/link'

interface AiMatchingConfigCardProps {
  cvs: CvSummaryResponse[]
  savedJobs: any[]
  selectedCvId: string
  setSelectedCvId: (id: string) => void
  selectedJobId: string
  setSelectedJobId: (id: string) => void
  handleMatch: () => void
  isPending: boolean
  selectedCv: any
  selectedJob: any
  formatSalary: (min?: number, max?: number) => string
}

export function AiMatchingConfigCard({
  cvs,
  savedJobs,
  selectedCvId,
  setSelectedCvId,
  selectedJobId,
  setSelectedJobId,
  handleMatch,
  isPending,
  selectedCv,
  selectedJob,
  formatSalary,
}: AiMatchingConfigCardProps) {
  return (
    <div className="space-y-6">
      <Card className="border-slate-200/80 shadow-md bg-white overflow-hidden relative">
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-blue-500 to-blue-600"></div>
        <CardHeader className="pt-6">
          <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <ScanSearch className="w-5 h-5 text-blue-600" /> Cấu Hình So Khớp
          </CardTitle>
          <CardDescription>Chọn hồ sơ và vị trí tuyển dụng ứng tuyển</CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          {/* Select CV */}
          <div className="space-y-2">
            <Label className="font-bold text-slate-700 text-sm">1. Chọn CV Đã Phân Tích</Label>
            <select
              className="flex h-11 w-full items-center justify-between rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer transition-all shadow-sm"
              value={selectedCvId}
              onChange={(e) => setSelectedCvId(e.target.value)}
            >
              {cvs.filter((cv) => cv.extractionStatus === CvExtractionStatus.COMPLETED).length === 0 ? (
                <option value="" disabled>
                  -- Chưa có CV nào được phân tích xong --
                </option>
              ) : (
                <>
                  <option value="">-- Chọn CV muốn chấm điểm --</option>
                  {cvs
                    .filter((cv) => cv.extractionStatus === CvExtractionStatus.COMPLETED)
                    .map((cv) => (
                      <option key={cv.id} value={cv.id}>
                        {cv.title} {cv.isPrimary ? '(CV Chính)' : ''}
                      </option>
                    ))}
                </>
              )}
            </select>
            {cvs.length === 0 && (
              <p className="text-xs text-amber-600 mt-1 flex items-center gap-1">
                Bạn chưa tải lên CV nào.{' '}
                <Link href="/candidate/cv" className="underline font-bold text-blue-600">
                  Tải lên ngay
                </Link>
              </p>
            )}
          </div>

          {/* Select Job */}
          <div className="space-y-2">
            <Label className="font-bold text-slate-700 text-sm">2. Chọn Công Việc Đã Lưu</Label>
            <select
              className="flex h-11 w-full items-center justify-between rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer transition-all shadow-sm"
              value={selectedJobId}
              onChange={(e) => setSelectedJobId(e.target.value)}
            >
              <option value="">-- Chọn Tin Tuyển Dụng --</option>
              {savedJobs.map((job) => (
                <option key={job.id} value={job.id}>
                  {job.title} - {job.companyName}
                </option>
              ))}
            </select>
            {savedJobs.length === 0 && (
              <p className="text-xs text-amber-600 mt-1 flex items-center gap-1">
                Bạn chưa lưu tin tuyển dụng nào.{' '}
                <Link href="/jobs" className="underline font-bold text-blue-600">
                  Tìm việc làm
                </Link>
              </p>
            )}
          </div>

          {/* Match Action Button */}
          <Button
            onClick={handleMatch}
            disabled={!selectedCvId || !selectedJobId || isPending}
            className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold py-6 text-base rounded-xl transition-all shadow-md shadow-blue-100 hover:shadow-lg disabled:opacity-50 mt-2 flex items-center justify-center gap-2"
          >
            {isPending ? (
              <>
                <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                Đang thực hiện AI Matching...
              </>
            ) : (
              <>
                <PlayCircle className="w-5 h-5" /> CHẤM ĐIỂM BẰNG AI
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* PREVIEW OF SELECTED DETAILS */}
      {(selectedCv || selectedJob) && (
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Xem trước thông tin so khớp
          </h3>

          {/* CV Preview */}
          {selectedCv && (
            <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-sm flex items-start gap-3">
              <div className="p-2.5 bg-slate-100 text-slate-600 rounded-lg">
                <FileText className="w-6 h-6" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-blue-600 uppercase tracking-wider">
                  Hồ sơ đã chọn
                </p>
                <h4 className="font-bold text-slate-800 text-sm truncate mt-0.5">
                  {selectedCv.title}
                </h4>
                <p className="text-xs text-slate-500 mt-1">
                  Cập nhật: {new Date(selectedCv.createdAt).toLocaleDateString('vi-VN')}
                </p>
              </div>
            </div>
          )}

          {/* Job Preview */}
          {selectedJob && (
            <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-sm flex items-start gap-3">
              <div className="p-2.5 bg-blue-50 text-blue-600 rounded-lg">
                <Briefcase className="w-6 h-6" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-blue-600 uppercase tracking-wider">
                  Tin tuyển dụng đã chọn
                </p>
                <h4 className="font-bold text-slate-800 text-sm truncate mt-0.5">
                  {selectedJob.title}
                </h4>
                <p className="text-xs font-medium text-slate-600 truncate">{selectedJob.companyName}</p>

                <div className="grid grid-cols-2 gap-2 mt-2.5 border-t border-slate-100 pt-2.5">
                  <div className="flex items-center gap-1 text-[11px] text-slate-500">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{selectedJob.location || 'Không xác định'}</span>
                  </div>
                  <div className="flex items-center gap-1 text-[11px] text-slate-500">
                    <DollarSign className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{formatSalary(selectedJob.salaryMin, selectedJob.salaryMax)}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
