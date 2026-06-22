import React from 'react'
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/src/components/ui/card'
import { Button } from '@/src/components/ui/button'
import { CheckCircle2, Map } from 'lucide-react'
import Link from 'next/link'
import { JobRecommendationResponse } from '@/src/types/recommendation'

interface JobMatchResultListProps {
  recommendedJobs: JobRecommendationResponse[]
  onReset: () => void
}

export function JobMatchResultList({ recommendedJobs, onReset }: JobMatchResultListProps) {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-700">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-black text-slate-800 flex items-center gap-2">
          <CheckCircle2 className="w-8 h-8 text-emerald-500" />
          Đã tìm thấy {recommendedJobs.length} công việc phù hợp
        </h2>
        <Button
          variant="outline"
          onClick={onReset}
          className="font-bold border-blue-200 text-blue-700 hover:bg-blue-50"
        >
          Tìm kiếm lại
        </Button>
      </div>

      {recommendedJobs.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-xl border border-slate-200 shadow-sm">
          <p className="text-slate-500 font-medium text-lg">
            Rất tiếc, chưa tìm thấy công việc nào phù hợp với kỹ năng của bạn lúc này.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {recommendedJobs.map((rec, idx) => (
            <Card
              key={idx}
              className="border-slate-200 hover:border-blue-300 hover:shadow-lg transition-all bg-white overflow-hidden group"
            >
              <CardHeader className="bg-slate-50 border-b border-slate-100 group-hover:bg-blue-50/50 transition-colors">
                <div className="flex justify-between items-start gap-4">
                  <div>
                    <Link href={`/jobs/${rec.jobId}`} className="hover:underline">
                      <CardTitle className="text-lg text-blue-900 leading-tight">
                        {rec.jobTitle}
                      </CardTitle>
                    </Link>
                    <CardDescription className="mt-1 font-medium text-slate-600">
                      {rec.companyName}
                    </CardDescription>
                  </div>
                  <div className="flex flex-col items-end">
                    <div className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-sm font-black flex items-center gap-1 shadow-sm">
                      {(rec.matchScore * 100).toFixed(0)}%{' '}
                      <span className="text-xs font-semibold">Phù hợp</span>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-5 space-y-4">
                <div className="flex flex-col gap-2 text-sm text-slate-600">
                  <div className="flex items-center gap-2">
                    <Map className="w-4 h-4 text-slate-400" /> {rec.location}
                  </div>
                </div>

                <div>
                  <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                    Kỹ năng đáp ứng
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {rec.matchedSkills?.length > 0 ? (
                      rec.matchedSkills.slice(0, 5).map((skill) => (
                        <span
                          key={skill}
                          className="px-2 py-0.5 bg-blue-50 text-blue-700 text-xs font-semibold rounded border border-blue-100"
                        >
                          {skill}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-slate-400">Không có dữ liệu</span>
                    )}
                    {rec.matchedSkills?.length > 5 && (
                      <span className="px-2 py-0.5 bg-slate-50 text-slate-500 text-xs font-semibold rounded border border-slate-100">
                        +{rec.matchedSkills.length - 5}
                      </span>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
