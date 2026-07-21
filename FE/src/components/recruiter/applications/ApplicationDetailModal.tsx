import { useEffect, useRef, useState } from 'react'
import {
  X,
  FileText,
  Briefcase,
  Clock,
  Brain,
  Loader2,
  CheckCircle2,
  XCircle,
  ExternalLink,
  Lightbulb,
} from 'lucide-react'
import { useGetApplicationDetail } from '@/src/hooks/application'
import { useGetCvDetail } from '@/src/hooks/cv'
import {
  ApplicationStatus,
  ScheduleInterviewRequest,
  UpdateApplicationStatusRequest,
} from '@/src/types'
import { useRelativeTime } from '@/src/hooks/useRelativeTime'
import { toast } from 'sonner'
import ConfirmModal from '@/src/components/common/ConfirmModal'

// ─── Helpers ──────────────────────────────────────────────────────────────────
function gradeColor(grade?: string) {
  if (!grade) return 'text-slate-500'
  if (grade === 'A+' || grade === 'A') return 'text-emerald-600 dark:text-emerald-400'
  if (grade === 'B+' || grade === 'B') return 'text-blue-600 dark:text-blue-400'
  if (grade === 'C+' || grade === 'C') return 'text-amber-600 dark:text-amber-400'
  return 'text-rose-600 dark:text-rose-400'
}

function ScoreRing({ score }: { score: number }) {
  const pct = Math.min(100, Math.max(0, score))
  const r = 38
  const circ = 2 * Math.PI * r
  const offset = circ * (1 - pct / 100)
  const color = pct >= 80 ? '#10b981' : pct >= 60 ? '#6366f1' : pct >= 40 ? '#f59e0b' : '#f43f5e'

  return (
    <svg width="96" height="96" viewBox="0 0 96 96">
      <circle
        cx="48"
        cy="48"
        r={r}
        fill="none"
        stroke="#f1f5f9"
        strokeWidth="8"
        className="dark:stroke-slate-700"
      />
      <circle
        cx="48"
        cy="48"
        r={r}
        fill="none"
        stroke={color}
        strokeWidth="8"
        strokeLinecap="round"
        strokeDasharray={circ}
        strokeDashoffset={offset}
        transform="rotate(-90 48 48)"
        style={{ transition: 'stroke-dashoffset 1s ease' }}
      />
      <text
        x="48"
        y="44"
        textAnchor="middle"
        fontSize="16"
        fontWeight="800"
        className="fill-slate-900 dark:fill-slate-100"
      >
        {pct}
      </text>
      <text
        x="48"
        y="58"
        textAnchor="middle"
        fontSize="10"
        fontWeight="600"
        className="fill-slate-400 dark:fill-slate-500"
      >
        / 100
      </text>
    </svg>
  )
}

// ─── Props Interface ─────────────────────────────────────────────────────────
interface Props {
  applicationId: string
  onClose: () => void
  onAccept?: (id: string) => void
  onReject?: (id: string) => void
}

export default function ApplicationDetailModal({
  applicationId,
  onClose,
  onAccept,
  onReject,
}: Props) {
  const overlayRef = useRef<HTMLDivElement>(null)

  const { data: activeApp, isLoading } = useGetApplicationDetail(applicationId)
  const { data: cvDetail, isLoading: isCvLoading } = useGetCvDetail(
    activeApp?.cvId || '',
    !!activeApp?.cvId
  )
  const relativeTime = useRelativeTime(activeApp?.appliedAt || '')

  // ── Close on Esc ──────────────────────────────────────────────────────────
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [onClose])

  const handleViewCvCloud = () => {
    if (cvDetail?.fileUrl) {
      window.open(cvDetail.fileUrl, '_blank', 'noopener,noreferrer')
    }
  }

  const [confirmState, setConfirmState] = useState<{
    isOpen: boolean
    title: string
    description: string
    confirmText: string
    variant: 'danger' | 'success'
    action: 'accept' | 'reject'
  } | null>(null)

  const handleOpenAcceptConfirm = () => {
    if (!activeApp) return
    setConfirmState({
      isOpen: true,
      title: 'Xác Nhận Duyệt Hồ Sơ Ứng Tuyển',
      description: `Bạn có chắc chắn muốn DUYỆT hồ sơ của ứng viên "${activeApp.candidateName || 'này'}"? Hệ thống sẽ gửi email thông báo duyệt CV tới ứng viên và chuyển trạng thái sang Chấp nhận.`,
      confirmText: 'Xác nhận Duyệt',
      variant: 'success',
      action: 'accept',
    })
  }

  const handleOpenRejectConfirm = () => {
    if (!activeApp) return
    setConfirmState({
      isOpen: true,
      title: 'Xác Nhận Loại Hồ Sơ Ứng Tuyển',
      description: `Bạn có chắc chắn muốn LOẠI hồ sơ của ứng viên "${activeApp.candidateName || 'này'}"? Hệ thống sẽ gửi email thông báo kết quả từ chối tới ứng viên.`,
      confirmText: 'Xác nhận Loại',
      variant: 'danger',
      action: 'reject',
    })
  }

  const handleConfirmAction = () => {
    if (!confirmState || !activeApp) return
    const actionToRun = confirmState.action
    setConfirmState(null)
    onClose()

    if (actionToRun === 'accept') {
      onAccept?.(activeApp.id)
    } else {
      onReject?.(activeApp.id)
    }
  }

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/60 backdrop-blur-sm animate-fade-in"
      onClick={(e) => {
        if (e.target === overlayRef.current) onClose()
      }}
    >
      <div
        id="application-detail-modal"
        className="relative bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-7xl h-[92vh] flex flex-col overflow-hidden"
        style={{ animation: 'slideUp 0.25s ease' }}
      >
        {/* ─── Header Top Bar ──────────────────────────────────────────────── */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 shrink-0 bg-white dark:bg-slate-900 z-10">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-black text-sm shrink-0">
              {activeApp?.candidateName?.slice(0, 2).toUpperCase() || 'UV'}
            </div>
            <div className="min-w-0">
              <h2 className="text-base font-black text-slate-900 dark:text-slate-100 truncate">
                {activeApp?.candidateName || 'Chi tiết hồ sơ ứng tuyển'}
              </h2>
              <p className="text-xs font-semibold text-slate-500 truncate flex items-center gap-2">
                <span>{activeApp?.jobTitle}</span>
                {activeApp?.appliedAt && <span>• Nộp {relativeTime}</span>}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {cvDetail?.fileUrl && (
              <button
                id="view-cv-cloud"
                type="button"
                onClick={handleViewCvCloud}
                className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/50 dark:hover:bg-indigo-900/60 text-indigo-600 dark:text-indigo-400 text-xs font-bold transition-all cursor-pointer"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Mở tab mới</span>
              </button>
            )}
            <button
              id="close-detail-modal"
              onClick={onClose}
              className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-4 h-4 text-slate-600 dark:text-slate-300" />
            </button>
          </div>
        </div>

        {/* ─── Split-Pane Body Layout ──────────────────────────────────────── */}
        {isLoading && !activeApp ? (
          <div className="flex flex-col items-center justify-center flex-1 py-20 gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
            <p className="text-sm font-semibold text-slate-500">Đang tải thông tin hồ sơ...</p>
          </div>
        ) : !activeApp ? (
          <div className="flex items-center justify-center flex-1 text-sm text-slate-500">
            Không tìm thấy thông tin hồ sơ
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 flex-1 min-h-0 overflow-hidden">
            {/* ── Left Pane (35% width / col-span-5): Info & AI Score & Action Buttons ── */}
            <div className="lg:col-span-5 flex flex-col justify-between overflow-y-auto border-r border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 p-6 space-y-6">
              <div className="space-y-6">
                {/* AI Score Panel */}
                {activeApp.overallScore !== undefined && activeApp.overallScore !== null ? (
                  <div className="rounded-2xl border border-violet-100 dark:border-violet-900/40 bg-linear-to-br from-violet-50/80 to-indigo-50/80 dark:from-slate-800 dark:to-slate-800/80 p-5 shadow-xs">
                    <h3 className="flex items-center gap-2 text-xs font-black text-violet-600 dark:text-violet-400 uppercase tracking-wider mb-4">
                      <Brain className="w-4 h-4 text-violet-600 dark:text-violet-400" />
                      Đánh giá AI Match Score
                    </h3>
                    <div className="flex items-center gap-5">
                      <ScoreRing score={activeApp.overallScore} />
                      <div className="flex-1 space-y-1">
                        <div className="flex items-baseline gap-2">
                          <span className={`text-3xl font-black ${gradeColor(activeApp.grade)}`}>
                            {activeApp.grade || '—'}
                          </span>
                          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                            Xếp loại
                          </span>
                        </div>
                        {activeApp.aiSummary && (
                          <p className="text-xs text-slate-700 dark:text-slate-300 font-medium leading-relaxed">
                            {activeApp.aiSummary}
                          </p>
                        )}
                      </div>
                    </div>

                    {activeApp.aiSuggestion && (
                      <div className="mt-4 pt-4 border-t border-violet-100 dark:border-slate-700">
                        <h4 className="flex items-center gap-1.5 text-xs font-black text-violet-600 dark:text-violet-400 mb-1.5">
                          <Lightbulb className="w-3.5 h-3.5" />
                          Gợi ý tuyển dụng từ AI
                        </h4>
                        <p className="text-xs text-slate-600 dark:text-slate-400 font-medium leading-relaxed">
                          {activeApp.aiSuggestion}
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/40 p-5">
                    <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">
                      Trạng thái hồ sơ
                    </p>
                    <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                      Đơn ứng tuyển chưa chấm điểm AI
                    </p>
                  </div>
                )}

                {/* Candidate Applied Info Details */}
                <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/40 p-5 space-y-3">
                  <h3 className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                    Thông tin đơn ứng tuyển
                  </h3>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                      <span className="text-slate-400">Ứng viên</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200">
                        {activeApp.candidateName}
                      </span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                      <span className="text-slate-400">Vị trí</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200">
                        {activeApp.jobTitle}
                      </span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-slate-400">Tên tệp CV</span>
                      <span className="font-bold text-indigo-600 dark:text-indigo-400 truncate max-w-[180px]">
                        {activeApp.cvTitle || 'CV.pdf'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons Footer (Loại / Duyệt CV) */}
              <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleOpenRejectConfirm}
                  className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 text-xs font-bold text-rose-700 dark:text-rose-400 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-900/50 border border-rose-200 dark:border-rose-900/60 rounded-xl transition-all cursor-pointer shadow-xs active:scale-98"
                >
                  <XCircle className="w-4 h-4" />
                  <span>Loại CV</span>
                </button>
                <button
                  type="button"
                  onClick={handleOpenAcceptConfirm}
                  className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-all cursor-pointer shadow-sm active:scale-98"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Duyệt CV</span>
                </button>
              </div>
            </div>

            {/* ── Right Pane (65% width / col-span-7): Full Height CV Reader ──────── */}
            <div className="lg:col-span-7 p-4 bg-slate-100 dark:bg-slate-950 flex flex-col h-full min-h-0 overflow-hidden">
              <div className="flex items-center justify-between px-2 pb-3 shrink-0">
                <span className="flex items-center gap-2 text-xs font-black text-slate-500 uppercase tracking-wider">
                  <FileText className="w-4 h-4 text-indigo-600" />
                  Xem nội dung CV trực tiếp
                </span>
              </div>

              <div className="flex-1 w-full rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-md">
                {isCvLoading ? (
                  <div className="flex flex-col items-center justify-center h-full gap-2 text-slate-400">
                    <Loader2 className="w-8 h-8 animate-spin text-indigo-600 mb-1" />
                    <span className="text-xs font-bold">Đang tải xem trước CV...</span>
                  </div>
                ) : cvDetail?.fileUrl ? (
                  <iframe
                    src={
                      cvDetail.fileUrl.endsWith('.pdf')
                        ? cvDetail.fileUrl
                        : `https://docs.google.com/viewer?url=${encodeURIComponent(cvDetail.fileUrl)}&embedded=true`
                    }
                    className="w-full h-full border-0"
                    title="Nội dung CV Ứng viên"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-xs font-semibold text-slate-400 p-8 text-center">
                    Chưa đính kèm file CV xem trước.
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {confirmState && (
        <ConfirmModal
          isOpen={confirmState.isOpen}
          title={confirmState.title}
          description={confirmState.description}
          confirmText={confirmState.confirmText}
          cancelText="Hủy bỏ"
          variant={confirmState.variant}
          onConfirm={handleConfirmAction}
          onClose={() => setConfirmState(null)}
        />
      )}
    </div>
  )
}
