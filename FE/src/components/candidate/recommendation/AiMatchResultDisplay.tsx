import React from 'react'
import { AiMatchHistoryResponse } from '@/src/types/recommendation'

import { AiMatchResultDisplayProps } from '@/src/types/recommendation'

export function AiMatchResultDisplay({ matchScore }: AiMatchResultDisplayProps) {

  return (
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

        {/* Tips & Action Plan */}
        {(matchScore.improvementTips || (matchScore.actionPlan && matchScore.actionPlan.length > 0)) && (
          <div className="p-4 bg-indigo-50 border border-indigo-100 rounded-lg mt-4 animate-in fade-in slide-in-from-bottom-2 duration-500 delay-150">
            <h4 className="font-bold text-indigo-800 mb-2 flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              AI Tư Vấn Cải Thiện CV
            </h4>
            {matchScore.improvementTips && (
              <p className="text-sm text-indigo-900 leading-relaxed mb-3 whitespace-pre-wrap">
                {matchScore.improvementTips}
              </p>
            )}
            {matchScore.actionPlan && matchScore.actionPlan.length > 0 && (
              <div className="space-y-1">
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-700">Lộ trình học tập đề xuất:</span>
                <ul className="list-disc pl-5 space-y-1 mt-1">
                  {matchScore.actionPlan.map((plan, idx) => (
                    <li key={idx} className="text-sm text-indigo-900">{plan}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
