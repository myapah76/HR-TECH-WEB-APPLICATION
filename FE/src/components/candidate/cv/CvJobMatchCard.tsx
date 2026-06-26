import React from 'react'
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/src/components/ui/card'
import { Button } from '@/src/components/ui/button'
import { Label } from '@/src/components/ui/label'
import { AiMatchHistoryResponse } from '@/src/types/recommendation'
import { CvSummaryResponse } from '@/src/types/cv'
import { CvExtractionStatus } from '@/src/enums/cv.enum'
import { AiMatchResultDisplay } from '@/src/components/candidate/recommendation/AiMatchResultDisplay'

import { CvJobMatchCardProps } from '@/src/types/cv'

export function CvJobMatchCard({
  cvs,
  savedJobs,
  selectedCvId,
  setSelectedCvId,
  selectedJobId,
  setSelectedJobId,
  handleMatch,
  isPending,
  matchScore,
}: CvJobMatchCardProps) {
  return (
    <Card className="border-slate-200 shadow-sm bg-white">
      <CardHeader className="bg-slate-50/50 border-b border-slate-100">
        <CardTitle className="text-slate-800">Chấm điểm Phù hợp (AI Matching)</CardTitle>
        <CardDescription>
          Kiểm tra xem CV của bạn có đáp ứng đủ yêu cầu của công việc không.
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="font-bold text-slate-700">Chọn Hồ Sơ</Label>
            <select
              className="flex h-10 w-full items-center justify-between rounded-md border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
              value={selectedCvId}
              onChange={(e) => setSelectedCvId(e.target.value)}
            >
              {cvs.filter((cv) => cv.extractionStatus === CvExtractionStatus.COMPLETED).length === 0 ? (
                <option value="" disabled>
                  -- Chưa có CV nào được phân tích xong --
                </option>
              ) : (
                <>
                  <option value="">-- Chọn CV --</option>
                  {cvs
                    .filter((cv) => cv.extractionStatus === CvExtractionStatus.COMPLETED)
                    .map((cv) => (
                      <option key={cv.id} value={cv.id}>
                        {cv.title}
                      </option>
                    ))}
                </>
              )}
            </select>
          </div>
          <div className="space-y-2">
            <Label className="font-bold text-slate-700">Chọn Công Việc Đã Lưu</Label>
            <select
              className="flex h-10 w-full items-center justify-between rounded-md border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
              value={selectedJobId}
              onChange={(e) => setSelectedJobId(e.target.value)}
            >
              <option value="">-- Chọn Job --</option>
              {savedJobs.map((job) => (
                <option key={job.id} value={job.id}>
                  {job.title} - {job.companyName}
                </option>
              ))}
            </select>
          </div>
        </div>

        <Button
          onClick={handleMatch}
          disabled={!selectedCvId || !selectedJobId || isPending}
          className="w-full bg-slate-800 hover:bg-slate-900 text-white font-bold py-6 text-base transition-all"
        >
          {isPending ? 'ĐANG TÍNH TOÁN...' : 'CHẤM ĐIỂM NGAY'}
        </Button>

        {/* Match Result */}
        {matchScore && !isPending && (
          <AiMatchResultDisplay matchScore={matchScore} />
        )}
      </CardContent>
    </Card>
  )
}
