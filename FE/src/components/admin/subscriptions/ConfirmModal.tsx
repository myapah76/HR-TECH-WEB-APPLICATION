import React from 'react'
import { Loader2 } from 'lucide-react'

interface ConfirmModalProps {
  isOpen: boolean
  title: string
  message: string
  isPending?: boolean
  onClose: () => void
  onConfirm: () => void
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  title,
  message,
  isPending,
  onClose,
  onConfirm,
}) => {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-fade-in">
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-2xl w-full max-w-md overflow-hidden animate-scale-up p-6 space-y-4">
        <h3 className="text-sm font-black text-slate-950">{title}</h3>
        <p className="text-xs font-semibold text-slate-500 leading-relaxed">{message}</p>
        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 font-bold text-xs py-2.5 px-5 rounded-xl cursor-pointer transition-all active:scale-95"
          >
            Hủy
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isPending}
            className="bg-violet-600 hover:bg-violet-700 text-white font-bold text-xs py-2.5 px-6 rounded-xl flex items-center gap-2 cursor-pointer transition-all active:scale-95 disabled:opacity-50"
          >
            {isPending ? (
              <Loader2 className="w-4.5 h-4.5 animate-spin" />
            ) : (
              <span>Xác nhận</span>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
