import React from 'react'
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/src/components/ui/card'
import { Button } from '@/src/components/ui/button'
import { Label } from '@/src/components/ui/label'
import { SkillMatchScoreResponse } from '@/src/types/recommendation'
import { CvSummaryResponse } from '@/src/types/cv'
import { CvExtractionStatus } from '@/src/enums/cv.enum'

interface CvJobMatchCardProps {
  cvs: CvSummaryResponse[]
  savedJobs: any[]
  selectedCvId: string
  setSelectedCvId: (id: string) => void
  selectedJobId: string
  setSelectedJobId: (id: string) => void
  handleMatch: () => void
  isPending: boolean
  matchScore: SkillMatchScoreResponse | null
}

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
          <div className="mt-6 p-5 rounded-xl border border-blue-100 bg-blue-50/30 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col items-center mb-6">
              <span className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-2">
                Độ phù hợp
              </span>
              <div className="relative flex items-center justify-center">
                <svg className="w-32 h-32 transform -rotate-90">
                  <circle
                    cx="64"
                    cy="64"
                    r="56"
                    className="stroke-slate-200"
                    strokeWidth="12"
                    fill="none"
                  />
                  <circle
                    cx="64"
                    cy="64"
                    r="56"
                    className="stroke-blue-600 transition-all duration-1000 ease-out"
                    strokeWidth="12"
                    fill="none"
                    strokeDasharray="351.86"
                    strokeDashoffset={351.86 - (351.86 * (matchScore.overallScore * 100)) / 100}
                  />
                </svg>
                <span className="absolute text-3xl font-black text-blue-700">
                  {(matchScore.overallScore * 100).toFixed(0)}%
                </span>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <h4 className="font-bold text-emerald-700 mb-1 flex items-center gap-2">
                  Kỹ năng trùng khớp
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {matchScore.matchedSkills?.length > 0 ? (
                    matchScore.matchedSkills.map((skill) => (
                      <span
                        key={skill}
                        className="px-2.5 py-1 bg-emerald-100 text-emerald-800 text-xs font-semibold rounded-md"
                      >
                        {skill}
                      </span>
                    ))
                  ) : (
                    <span className="text-sm text-slate-500">Không có kỹ năng nào khớp.</span>
                  )}
                </div>
              </div>
              <div>
                <h4 className="font-bold text-rose-700 mb-1 flex items-center gap-2">
                  Kỹ năng thiếu sót
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {matchScore.missingSkills?.length > 0 ? (
                    matchScore.missingSkills.map((skill) => (
                      <span
                        key={skill}
                        className="px-2.5 py-1 bg-rose-100 text-rose-800 text-xs font-semibold rounded-md"
                      >
                        {skill}
                      </span>
                    ))
                  ) : (
                    <span className="text-sm text-slate-500">
                      Tuyệt vời, bạn đáp ứng mọi kỹ năng!
                    </span>
                  )}
                </div>
              </div>
              {matchScore.skillDetails?.length > 0 && (
                <div className="p-3 bg-amber-50 border border-amber-100 rounded-lg">
                  <h4 className="font-bold text-amber-800 mb-1">Chi tiết kỹ năng</h4>
                  <ul className="list-disc pl-5 space-y-1">
                    {matchScore.skillDetails.map((detail, idx) => (
                      <li key={idx} className="text-sm text-amber-900 leading-snug">
                        <span className="font-semibold">{detail.skillName}</span>
                        <span className="text-amber-700 mx-1">-</span>
                        <span className="font-medium">{detail.matchStatus}</span>
                        {detail.matchType && detail.matchType !== 'NONE' && (
                          <span className="text-amber-700/80 ml-1">({detail.matchType})</span>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
