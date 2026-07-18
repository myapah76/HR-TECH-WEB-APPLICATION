import React from 'react'
import { AlertTriangle, Lightbulb } from 'lucide-react'

interface RejectionReasonDisplayProps {
  reason: string | null | undefined
}

export default function RejectionReasonDisplay({ reason }: RejectionReasonDisplayProps) {
  if (!reason) return null

  let parsed = {
    isJson: false,
    message: reason,
    reasons: [] as string[],
    suggestions: [] as string[],
  }

  try {
    if (reason.trim().startsWith('{')) {
      const data = JSON.parse(reason)
      parsed = {
        isJson: true,
        message: data.message || 'Tin tuyển dụng không đạt yêu cầu kiểm duyệt tự động.',
        reasons: data.reasons || [],
        suggestions: data.suggestions || [],
      }
    }
  } catch (e) {
    // Keep default parsed values
  }

  if (!parsed.isJson) {
    return (
      <div className="rounded-2xl border border-rose-200 dark:border-rose-900/50 bg-rose-50 dark:bg-rose-950/20 px-5 py-4 text-sm text-rose-800 dark:text-rose-200">
        <p className="font-bold uppercase tracking-wide text-rose-700 dark:text-rose-400">
          Lý do bị từ chối
        </p>
        <p className="mt-2 whitespace-pre-wrap leading-6">{parsed.message}</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Rejection reasons */}
      <div className="rounded-2xl border border-rose-200 dark:border-rose-900/50 bg-rose-50 dark:bg-rose-950/20 px-5 py-4 text-sm text-rose-800 dark:text-rose-200">
        <div className="flex items-center gap-2 font-bold uppercase tracking-wide text-rose-700 dark:text-rose-400">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>Lý do không đạt kiểm duyệt AI</span>
        </div>
        <p className="mt-2 text-slate-700 dark:text-slate-300 font-semibold">{parsed.message}</p>
        {parsed.reasons.length > 0 && (
          <ul className="mt-2 ml-4 list-disc space-y-1">
            {parsed.reasons.map((r, i) => (
              <li key={i} className="leading-6">{r}</li>
            ))}
          </ul>
        )}
      </div>

      {/* Suggestions */}
      {parsed.suggestions.length > 0 && (
        <div className="rounded-2xl border border-amber-200 dark:border-amber-900/50 bg-amber-50/50 dark:bg-amber-950/10 px-5 py-4 text-sm text-amber-800 dark:text-amber-200">
          <div className="flex items-center gap-2 font-bold uppercase tracking-wide text-amber-700 dark:text-amber-400">
            <Lightbulb className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
            <span>Gợi ý khắc phục từ AI</span>
          </div>
          <ul className="mt-2 ml-4 list-disc space-y-1 text-slate-700 dark:text-slate-300">
            {parsed.suggestions.map((s, i) => (
              <li key={i} className="leading-6">{s}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
