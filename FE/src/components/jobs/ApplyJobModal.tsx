import React, { useState } from 'react'
import { X, Send, Loader2, Sparkles } from 'lucide-react'
import Link from 'next/link'
import { useGetAllCvs } from '@/src/hooks/cv'
import { useSubmitApplication } from '@/src/hooks/application'
import { toast } from 'sonner'

interface ApplyJobModalProps {
  isOpen: boolean
  onClose: () => void
  jobId: string
  initialCvId?: string
}

export function ApplyJobModal({ isOpen, onClose, jobId, initialCvId }: ApplyJobModalProps) {
  const [selectedCvId, setSelectedCvId] = useState('')
  const [coverLetter, setCoverLetter] = useState('')

  const { data: cvs = [], isLoading: loadingCvs } = useGetAllCvs(isOpen)
  const applyMutation = useSubmitApplication()

  if (!isOpen) return null

  // Pre-select initialCvId if valid, otherwise primary or first CV
  const isInitialCvValid = !!(initialCvId && cvs.some((c) => c.id === initialCvId))
  const primaryCv = cvs.find((c) => c.isPrimary)
  const defaultCvId = isInitialCvValid ? initialCvId! : (primaryCv ? primaryCv.id : cvs[0]?.id || '')
  const activeCvId = selectedCvId || defaultCvId

  const handleApplySubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!activeCvId) {
      toast.error('Vui lòng chọn CV để ứng tuyển')
      return
    }
    applyMutation.mutate(
      {
        jobId,
        cvId: activeCvId,
        coverLetter,
      },
      {
        onSuccess: () => {
          toast.success('Nộp đơn ứng tuyển thành công!')
          onClose()
          setCoverLetter('')
          setSelectedCvId('')
        },
      }
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-2xl max-w-md w-full p-6 relative animate-scale-in">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <h3 className="text-lg font-black text-slate-900 mb-4 flex items-center gap-2">
          <Send className="w-5 h-5 text-blue-600" />
          Nộp đơn ứng tuyển
        </h3>

        {loadingCvs ? (
          <div className="flex justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
          </div>
        ) : cvs.length === 0 ? (
          <div className="space-y-4 py-2">
            <p className="text-sm text-slate-500 font-semibold leading-relaxed">
              Bạn chưa có hồ sơ CV nào trong hệ thống. Vui lòng tải lên CV trước khi nộp đơn.
            </p>
            <div className="flex gap-3 pt-2">
              <button
                onClick={onClose}
                className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs py-3 rounded-xl transition-all cursor-pointer"
              >
                Hủy
              </button>
              <Link
                href="/candidate/cv"
                className="flex-1 text-center bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs py-3 rounded-xl transition-all"
              >
                Quản lý CV
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleApplySubmit} className="space-y-4">
            {isInitialCvValid && (
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200/80 px-3.5 py-2.5 rounded-2xl">
                <Sparkles className="w-4 h-4 text-emerald-600 shrink-0 animate-pulse" />
                <span>Đã tự động chọn CV bạn đã dùng để phân tích gợi ý AI</span>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-black text-slate-500 uppercase tracking-wider">
                Chọn CV ứng tuyển
              </label>
              <select
                className="w-full h-11 border border-slate-200 bg-white rounded-xl px-3 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 cursor-pointer shadow-xs"
                value={activeCvId}
                onChange={(e) => setSelectedCvId(e.target.value)}
              >
                {cvs.map((cv) => (
                  <option key={cv.id} value={cv.id}>
                    {cv.title} {cv.id === initialCvId ? '(CV dùng phân tích AI)' : cv.isPrimary ? '(Mặc định)' : ''}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-black text-slate-500 uppercase tracking-wider">
                Thư giới thiệu (Không bắt buộc)
              </label>
              <textarea
                className="w-full border border-slate-200 rounded-xl p-3 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-xs resize-none"
                placeholder="Viết một đoạn ngắn giới thiệu bản thân hoặc lý do bạn phù hợp với công việc..."
                rows={4}
                value={coverLetter}
                onChange={(e) => setCoverLetter(e.target.value)}
              />
            </div>

            <div className="flex gap-3 pt-2 border-t border-slate-100 mt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs py-3 rounded-xl transition-all cursor-pointer"
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={applyMutation.isPending}
                className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-700 disabled:opacity-50 text-white font-bold text-xs py-3 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-sm shadow-blue-600/10 hover:shadow-md hover:shadow-blue-600/20"
              >
                {applyMutation.isPending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>Xác nhận nộp</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
