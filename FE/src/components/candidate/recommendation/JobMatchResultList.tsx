import React, { useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/src/components/ui/card'
import { Button } from '@/src/components/ui/button'
import { CheckCircle2, MapPin, DollarSign, Send, Eye, Sparkles } from 'lucide-react'
import Link from 'next/link'
import { JobRecommendationResponse } from '@/src/types/recommendation'
import { formatSalary } from '@/src/utils'
import { ApplyJobModal } from '@/src/components/jobs/ApplyJobModal'
import { useCheckHasApplied } from '@/src/hooks/application'
import { useAuthStore } from '@/src/stores/auth.store'
import { RoleUser } from '@/src/enums/role.enum'

interface JobMatchResultListProps {
  recommendedJobs: JobRecommendationResponse[]
  onReset: () => void
  selectedCvId?: string
}

function RecommendedJobCard({
  rec,
  selectedCvId,
  isCandidate,
  onApply,
}: {
  rec: JobRecommendationResponse
  selectedCvId?: string
  isCandidate: boolean
  onApply: (jobId: string) => void
}) {
  const { data: hasApplied = false } = useCheckHasApplied(rec.jobId, isCandidate)
  const detailHref = selectedCvId
    ? `/jobs/${rec.jobId}?cvId=${selectedCvId}`
    : `/jobs/${rec.jobId}`

  return (
    <Card className="border-slate-200/80 hover:border-blue-300 hover:shadow-xl transition-all duration-300 bg-white overflow-hidden group flex flex-col justify-between rounded-3xl">
      <div>
        <CardHeader className="bg-slate-50/70 border-b border-slate-100 group-hover:bg-blue-50/40 transition-colors p-5">
          <div className="flex justify-between items-start gap-4">
            <div className="space-y-1">
              <Link href={detailHref} className="hover:underline">
                <CardTitle className="text-lg font-black text-slate-900 group-hover:text-blue-600 transition-colors leading-tight line-clamp-2">
                  {rec.jobTitle}
                </CardTitle>
              </Link>
              <CardDescription className="font-bold text-xs text-slate-500 uppercase tracking-wider">
                {rec.companyName}
              </CardDescription>
            </div>
            <div className="flex flex-col items-end shrink-0 gap-1.5">
              <div className="bg-emerald-50 text-emerald-700 border border-emerald-200/60 px-3 py-1 rounded-full text-xs font-black flex items-center gap-1 shadow-2xs">
                {(rec.matchScore * 100).toFixed(0)}%{' '}
                <span className="text-[10px] font-bold">Phù hợp</span>
              </div>
              {hasApplied && (
                <span className="text-[10px] font-extrabold text-emerald-700 bg-emerald-100/80 border border-emerald-200 px-2 py-0.5 rounded-md flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  Đã ứng tuyển
                </span>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-5 space-y-4">
          <div className="flex flex-wrap items-center gap-3 text-xs font-bold text-slate-600">
            <span className="flex items-center gap-1.5 bg-slate-50 text-slate-600 px-2.5 py-1 rounded-lg border border-slate-200/60">
              <MapPin className="w-3.5 h-3.5 text-slate-400" /> {rec.location}
            </span>
            {(rec.salaryMin !== undefined || rec.salaryMax !== undefined) && (
              <span className="flex items-center gap-1.5 bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-lg border border-emerald-100">
                <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
                {formatSalary(rec.salaryMin, rec.salaryMax, rec.salaryType)}
              </span>
            )}
          </div>

          <div>
            <div className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-2">
              Kỹ năng đáp ứng
            </div>
            <div className="flex flex-wrap gap-1.5">
              {rec.matchedSkills?.length > 0 ? (
                rec.matchedSkills.slice(0, 5).map((skill) => (
                  <span
                    key={skill}
                    className="px-2.5 py-0.75 bg-blue-50 text-blue-700 text-xs font-bold rounded-lg border border-blue-100/60"
                  >
                    {skill}
                  </span>
                ))
              ) : (
                <span className="text-xs text-slate-400 font-medium">Không có dữ liệu</span>
              )}
              {rec.matchedSkills?.length > 5 && (
                <span className="px-2 py-0.75 bg-slate-50 text-slate-500 text-xs font-bold rounded-lg border border-slate-200/60">
                  +{rec.matchedSkills.length - 5}
                </span>
              )}
            </div>
          </div>
        </CardContent>
      </div>

      {/* Bottom Card Actions */}
      <div className="px-5 pb-5 pt-3 border-t border-slate-100 flex items-center gap-2.5 mt-auto">
        <Link href={detailHref} className="flex-1">
          <Button
            variant="outline"
            className="w-full text-xs font-bold border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl h-10 cursor-pointer flex items-center justify-center gap-1.5"
          >
            <Eye className="w-3.5 h-3.5 text-slate-400" />
            <span>Xem chi tiết</span>
          </Button>
        </Link>
        {hasApplied ? (
          <Button
            disabled
            className="flex-1 text-xs font-bold bg-slate-100 border border-slate-200/80 text-slate-400 rounded-xl h-10 cursor-not-allowed flex items-center justify-center gap-1.5 opacity-90"
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>Đã ứng tuyển</span>
          </Button>
        ) : (
          <Button
            onClick={() => onApply(rec.jobId)}
            className="flex-1 text-xs font-black bg-blue-600 hover:bg-blue-700 text-white rounded-xl h-10 shadow-sm shadow-blue-600/10 cursor-pointer flex items-center justify-center gap-1.5"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Ứng tuyển ngay</span>
          </Button>
        )}
      </div>
    </Card>
  )
}

export function JobMatchResultList({
  recommendedJobs,
  onReset,
  selectedCvId,
}: JobMatchResultListProps) {
  const [applyModalJobId, setApplyModalJobId] = useState<string | null>(null)
  const { user } = useAuthStore()
  const isCandidate = user?.roleResponse?.name === RoleUser.CANDIDATE

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-700">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-800 flex items-center gap-2">
            <CheckCircle2 className="w-7 h-7 text-emerald-500 shrink-0" />
            Đã tìm thấy {recommendedJobs.length} công việc phù hợp
          </h2>
          {selectedCvId && (
            <p className="text-xs font-bold text-slate-500 mt-1 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              CV của bạn đã được chọn sẵn cho tất cả lượt ứng tuyển dưới đây
            </p>
          )}
        </div>
        <Button
          variant="outline"
          onClick={onReset}
          className="font-bold border-blue-200 text-blue-700 hover:bg-blue-50 cursor-pointer self-start sm:self-auto"
        >
          Tìm kiếm lại
        </Button>
      </div>

      {recommendedJobs.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 shadow-sm">
          <p className="text-slate-500 font-medium text-lg">
            Rất tiếc, chưa tìm thấy công việc nào phù hợp với kỹ năng của bạn lúc này.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {recommendedJobs.map((rec, idx) => (
            <RecommendedJobCard
              key={rec.jobId || idx}
              rec={rec}
              selectedCvId={selectedCvId}
              isCandidate={isCandidate}
              onApply={(id) => setApplyModalJobId(id)}
            />
          ))}
        </div>
      )}

      {/* Apply Modal */}
      {applyModalJobId && (
        <ApplyJobModal
          isOpen={!!applyModalJobId}
          onClose={() => setApplyModalJobId(null)}
          jobId={applyModalJobId}
          initialCvId={selectedCvId}
        />
      )}
    </div>
  )
}
