'use client'

import React from 'react'
import { AlertTriangle, Info, CheckCircle2, X, Loader2 } from 'lucide-react'

export interface ConfirmModalProps {
  isOpen: boolean
  title: string
  description: string
  confirmText?: string
  cancelText?: string
  variant?: 'danger' | 'warning' | 'info' | 'success'
  onConfirm: () => void | Promise<void>
  onClose: () => void
  isLoading?: boolean
}

export default function ConfirmModal({
  isOpen,
  title,
  description,
  confirmText = 'Xác nhận',
  cancelText = 'Hủy bỏ',
  variant = 'warning',
  onConfirm,
  onClose,
  isLoading = false,
}: ConfirmModalProps) {
  if (!isOpen) return null

  const variantStyles = {
    danger: {
      iconBg: 'bg-rose-50 text-rose-600',
      btnColor: 'bg-rose-600 hover:bg-rose-700 text-white',
      icon: AlertTriangle,
    },
    warning: {
      iconBg: 'bg-amber-50 text-amber-600',
      btnColor: 'bg-amber-500 hover:bg-amber-600 text-white',
      icon: AlertTriangle,
    },
    info: {
      iconBg: 'bg-violet-50 text-violet-600',
      btnColor: 'bg-violet-600 hover:bg-violet-700 text-white',
      icon: Info,
    },
    success: {
      iconBg: 'bg-emerald-50 text-emerald-600',
      btnColor: 'bg-emerald-600 hover:bg-emerald-700 text-white',
      icon: CheckCircle2,
    },
  }

  const currentVariant = variantStyles[variant]
  const IconComponent = currentVariant.icon

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-fadeIn">
      <div className="bg-white rounded-3xl border border-slate-100 max-w-md w-full p-6 shadow-2xl animate-scaleIn flex flex-col gap-4 relative">
        <button
          type="button"
          onClick={onClose}
          disabled={isLoading}
          className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 p-1.5 rounded-full hover:bg-slate-100 transition-colors disabled:opacity-50"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-start gap-4">
          <div className={`p-3.5 rounded-2xl shrink-0 ${currentVariant.iconBg}`}>
            <IconComponent className="h-6 w-6" />
          </div>
          <div className="pr-6">
            <h3 className="text-lg font-black text-slate-800 leading-snug">{title}</h3>
            <p className="text-sm text-slate-500 mt-1 font-medium leading-relaxed">{description}</p>
          </div>
        </div>

        <div className="flex gap-3 mt-3 justify-end">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="px-5 py-2.5 rounded-xl border border-slate-200 text-sm font-bold text-slate-600 hover:bg-slate-50 active:scale-95 transition-all disabled:opacity-50"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className={`px-6 py-2.5 rounded-xl text-sm font-bold active:scale-95 transition-all shadow-xs flex items-center gap-2 ${currentVariant.btnColor} disabled:opacity-50`}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Đang xử lý...
              </>
            ) : (
              confirmText
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
