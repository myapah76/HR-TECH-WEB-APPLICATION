'use client'

import React, { useState } from 'react'
import { CheckCircle2, XCircle, X, Award, AlertCircle } from 'lucide-react'
import { Button } from '@/src/components/ui/button'
import { InterviewRoundDetail } from '@/src/types/recruiter-interview'

interface FinalConfirmationModalProps {
  candidate: InterviewRoundDetail | null
  onClose: () => void
  onConfirmFinalResult: (applicationId: string, approved: boolean, note: string) => void
}

export default function FinalConfirmationModal({
  candidate,
  onClose,
  onConfirmFinalResult,
}: FinalConfirmationModalProps) {
  const [decision, setDecision] = useState<'APPROVE' | 'REJECT' | null>(null)
  const [finalNote, setFinalNote] = useState('')

  if (!candidate) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-2xl max-w-lg w-full space-y-5">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <Award className="w-5 h-5 text-emerald-600" />
            <div>
              <h3 className="font-black text-slate-900 dark:text-slate-100 text-base">
                Xác Nhận Kết Quả Phỏng Vấn Cuối Cùng
              </h3>
              <p className="text-xs font-semibold text-slate-500">
                Ứng viên: <strong>{candidate.candidateName}</strong> ({candidate.jobTitle})
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60 space-y-2">
          <p className="text-xs font-black text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Ứng viên đã hoàn thành xuất sắc tất cả các vòng phỏng vấn!</span>
          </p>
          <p className="text-xs text-slate-600 dark:text-slate-400 font-medium leading-relaxed">
            Vui lòng chọn quyết định xác nhận cuối cùng cho hồ sơ ứng tuyển này. Sau khi xác nhận, hệ thống sẽ tự động chuyển trạng thái và gửi email thông báo tới ứng viên.
          </p>
        </div>

        <div className="space-y-3">
          <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
            Lựa chọn quyết định tuyển dụng:
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setDecision('APPROVE')}
              className={`p-4 rounded-2xl border text-center transition-all cursor-pointer flex flex-col items-center gap-2 ${
                decision === 'APPROVE'
                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-md shadow-emerald-600/20 ring-2 ring-emerald-500'
                  : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
              }`}
            >
              <CheckCircle2 className={`w-6 h-6 ${decision === 'APPROVE' ? 'text-white' : 'text-emerald-600'}`} />
              <div className="text-center">
                <span className="block font-black text-xs">Duyệt Tuyển Dụng</span>
                <span className="block text-[10px] opacity-80 mt-0.5">Chuyển trạng thái Đã Duyệt & Gửi mail chúc mừng</span>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setDecision('REJECT')}
              className={`p-4 rounded-2xl border text-center transition-all cursor-pointer flex flex-col items-center gap-2 ${
                decision === 'REJECT'
                  ? 'bg-rose-600 text-white border-rose-600 shadow-md shadow-rose-600/20 ring-2 ring-rose-500'
                  : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
              }`}
            >
              <XCircle className={`w-6 h-6 ${decision === 'REJECT' ? 'text-white' : 'text-rose-600'}`} />
              <div className="text-center">
                <span className="block font-black text-xs">Từ Chối Hồ Sơ</span>
                <span className="block text-[10px] opacity-80 mt-0.5">Chuyển trạng thái Từ chối & Gửi mail cảm ơn</span>
              </div>
            </button>
          </div>
        </div>

        {decision && (
          <div className="space-y-2 animate-fade-in">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
              Ghi chú xác nhận tuyển dụng (tùy chọn):
            </label>
            <textarea
              rows={3}
              placeholder="Nhập ghi chú dành cho lưu trữ nội bộ công ty..."
              value={finalNote}
              onChange={(e) => setFinalNote(e.target.value)}
              className="w-full px-3 py-2 text-xs font-medium bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:border-emerald-500"
            />
          </div>
        )}

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-slate-500 hover:bg-slate-100 rounded-xl cursor-pointer"
          >
            Hủy bỏ
          </button>
          <Button
            type="button"
            disabled={!decision}
            onClick={() => {
              if (decision) {
                onConfirmFinalResult(candidate.applicationId, decision === 'APPROVE', finalNote)
              }
            }}
            className={`text-xs font-bold text-white rounded-xl shadow-xs disabled:opacity-40 cursor-pointer ${
              decision === 'REJECT' ? 'bg-rose-600 hover:bg-rose-700' : 'bg-emerald-600 hover:bg-emerald-700'
            }`}
          >
            Xác Nhận Lần Cuối
          </Button>
        </div>
      </div>
    </div>
  )
}
