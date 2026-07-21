'use client'

import React, { useState, useEffect } from 'react'
import { Plus, X } from 'lucide-react'
import { toast } from 'sonner'
import { InterviewRoundConfig } from '@/src/types/recruiter-interview'
import {
  useCreateJobInterviewRound,
  useUpdateJobInterviewRound,
  useDeleteJobInterviewRound,
} from '@/src/hooks/job'

interface InterviewRoundConfigModalProps {
  isOpen: boolean
  onClose: () => void
  jobId: string
  roundsConfig: InterviewRoundConfig[]
}

export default function InterviewRoundConfigModal({
  isOpen,
  onClose,
  jobId,
  roundsConfig,
}: InterviewRoundConfigModalProps) {
  const createRoundMutation = useCreateJobInterviewRound(jobId)
  const updateRoundMutation = useUpdateJobInterviewRound(jobId)
  const deleteRoundMutation = useDeleteJobInterviewRound(jobId)

  const [tempRounds, setTempRounds] = useState<InterviewRoundConfig[]>(roundsConfig)
  const [newRoundName, setNewRoundName] = useState('')
  const [newRoundDescription, setNewRoundDescription] = useState('')
  const [showAddForm, setShowAddForm] = useState(false)

  useEffect(() => {
    setTempRounds(roundsConfig)
  }, [roundsConfig])

  if (!isOpen) return null

  const handleAddRound = () => {
    if (!newRoundName.trim()) {
      toast.error('Vui lòng nhập tên vòng phỏng vấn!')
      return
    }

    const name = newRoundName.trim()
    const desc = newRoundDescription.trim() || undefined

    // Cập nhật trạng thái cục bộ ngay lập tức (Optimistic Update) giúp Modal không bị giật lag
    const tempId = `temp-${Date.now()}`
    setTempRounds((prev) => [
      ...prev,
      {
        id: tempId,
        roundNumber: prev.length + 1,
        roundName: name,
        description: desc,
      },
    ])
    setNewRoundName('')
    setNewRoundDescription('')
    setShowAddForm(false)

    createRoundMutation.mutate({
      roundName: name,
      description: desc,
    })
  }

  const handleRemoveRound = (roundId?: string, idx?: number) => {
    if (tempRounds.length <= 1) {
      toast.error('Quy trình phỏng vấn phải có ít nhất 1 vòng!')
      return
    }

    if (idx !== undefined) {
      setTempRounds((prev) => prev.filter((_, i) => i !== idx))
    }

    if (roundId && !roundId.startsWith('temp-')) {
      deleteRoundMutation.mutate(roundId)
    }
  }

  const handleSaveRoundsConfig = async () => {
    try {
      for (const round of tempRounds) {
        if (round.id && !round.id.startsWith('temp-')) {
          const original = roundsConfig.find((r) => r.id === round.id)
          if (
            original &&
            (original.roundName !== round.roundName || original.description !== round.description)
          ) {
            await updateRoundMutation.mutateAsync({
              roundId: round.id,
              payload: {
                roundName: round.roundName,
                description: round.description,
              },
            })
          }
        }
      }
      onClose()
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Có lỗi xảy ra khi lưu cấu hình.')
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 w-full max-w-xl rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
          <div>
            <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
              Cấu Hình Quy Trình Phỏng Vấn
            </h3>
            <p className="text-xs font-semibold text-slate-500">
              Thêm, sửa hoặc xóa các vòng phỏng vấn cho tin tuyển dụng này
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 rounded-xl cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
          {tempRounds.map((round, idx) => (
            <div
              key={round.id || idx}
              className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-2.5 py-1 rounded-lg border border-emerald-100 dark:border-emerald-900/60">
                  Vòng {idx + 1}
                </span>
                <button
                  type="button"
                  onClick={() => handleRemoveRound(round.id, idx)}
                  disabled={deleteRoundMutation.isPending}
                  className="text-xs font-bold text-rose-600 hover:text-rose-700 p-1 disabled:opacity-50 cursor-pointer"
                >
                  Xóa vòng này
                </button>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Tên vòng phỏng vấn
                </label>
                <input
                  type="text"
                  value={round.roundName}
                  onChange={(e) => {
                    const val = e.target.value
                    setTempRounds((prev) =>
                      prev.map((r, i) => (i === idx ? { ...r, roundName: val } : r))
                    )
                  }}
                  className="w-full px-3 py-2 text-xs font-semibold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:border-emerald-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-500">Mô tả tiêu chí phỏng vấn</label>
                <input
                  type="text"
                  value={round.description || ''}
                  onChange={(e) => {
                    const val = e.target.value
                    setTempRounds((prev) =>
                      prev.map((r, i) => (i === idx ? { ...r, description: val } : r))
                    )
                  }}
                  placeholder="Ví dụ: Kiểm tra kỹ năng chuyên môn & Live Coding..."
                  className="w-full px-3 py-2 text-xs font-medium bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:border-emerald-500"
                />
              </div>
            </div>
          ))}

          {/* Form thêm vòng phỏng vấn mới */}
          {showAddForm ? (
            <div className="p-4 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-emerald-700 dark:text-emerald-400">
                  Tạo Vòng Phỏng Vấn Mới (Vòng {tempRounds.length + 1})
                </span>
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="text-xs font-bold text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  Hủy
                </button>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Tên vòng phỏng vấn
                </label>
                <input
                  type="text"
                  value={newRoundName}
                  onChange={(e) => setNewRoundName(e.target.value)}
                  placeholder="Ví dụ: Vòng phỏng vấn Kỹ thuật"
                  className="w-full px-3 py-2 text-xs font-semibold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:border-emerald-500"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-500">Mô tả tiêu chí</label>
                <input
                  type="text"
                  value={newRoundDescription}
                  onChange={(e) => setNewRoundDescription(e.target.value)}
                  placeholder="Ví dụ: Đánh giá kỹ năng System Design..."
                  className="w-full px-3 py-2 text-xs font-medium bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:border-emerald-500"
                />
              </div>
              <button
                type="button"
                onClick={handleAddRound}
                disabled={createRoundMutation.isPending}
                className="w-full py-2.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs disabled:opacity-50 cursor-pointer"
              >
                {createRoundMutation.isPending ? 'Đang tạo...' : 'Xác nhận Thêm Vòng Mới'}
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setShowAddForm(true)}
              className="w-full py-3 border border-dashed border-emerald-300 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 font-bold text-xs rounded-2xl hover:bg-emerald-50/50 transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Thêm vòng phỏng vấn mới (Vòng {tempRounds.length + 1})
            </button>
          )}
        </div>

        <div className="flex items-center justify-end gap-3 border-t border-slate-100 dark:border-slate-800 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl cursor-pointer"
          >
            Hủy bỏ
          </button>
          <button
            type="button"
            onClick={handleSaveRoundsConfig}
            disabled={updateRoundMutation.isPending}
            className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs disabled:opacity-50 cursor-pointer"
          >
            {updateRoundMutation.isPending ? 'Đang lưu...' : 'Lưu thay đổi'}
          </button>
        </div>
      </div>
    </div>
  )
}
