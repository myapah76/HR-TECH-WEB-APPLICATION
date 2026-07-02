import React, { useState } from 'react'
import { Sparkles, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'

interface AddSkillModalProps {
  isOpen: boolean
  onClose: () => void
  onAdd: (name: string, description: string, roles: string[]) => Promise<void>
  availableRoles: string[]
}

const AddSkillModal = ({ isOpen, onClose, onAdd, availableRoles }: AddSkillModalProps) => {
  const [addName, setAddName] = useState('')
  const [addDesc, setAddDesc] = useState('')
  const [selectedRoles, setSelectedRoles] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [roleError, setRoleError] = useState(false)

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const trimmedName = addName.trim()
    if (!trimmedName) return

    if (selectedRoles.length === 0) {
      setRoleError(true)
      toast.error('Bắt buộc phải chọn ít nhất 1 vai trò tuyển dụng chuẩn!')
      return
    }

    setRoleError(false)
    setLoading(true)
    try {
      await onAdd(trimmedName, addDesc.trim(), selectedRoles)
      // Reset state
      setAddName('')
      setAddDesc('')
      setSelectedRoles([])
      setRoleError(false)
      onClose()
    } finally {
      setLoading(false)
    }
  }

  const toggleRoleSelection = (role: string) => {
    setRoleError(false)
    if (selectedRoles.includes(role)) {
      setSelectedRoles(selectedRoles.filter((r) => r !== role))
    } else {
      setSelectedRoles([...selectedRoles, role])
    }
  }

  return (
    <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 animate-fade-in">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 border border-slate-200 shadow-2xl flex flex-col gap-4 animate-scale-up">
        <div>
          <h3 className="text-lg font-black text-slate-900 flex items-center gap-1.5">
            <Sparkles className="h-5 w-5 text-violet-600 animate-spin-slow" />
            Thêm Kỹ năng mới
          </h3>
          <p className="text-sm text-slate-400 mt-0.5">
            Tạo kỹ năng mới trực tiếp trong hệ thống
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-black text-slate-700">
              Tên kỹ năng <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              disabled={loading}
              placeholder="Ví dụ: docker, nextjs, fastapi"
              value={addName}
              onChange={(e) => setAddName(e.target.value)}
              className="w-full text-sm px-4 py-2.5 rounded-xl border border-slate-200 focus:border-violet-500 focus:outline-hidden disabled:bg-slate-50"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-black text-slate-700">Mô tả</label>
            <textarea
              placeholder="Mô tả tóm tắt kỹ năng..."
              disabled={loading}
              value={addDesc}
              onChange={(e) => setAddDesc(e.target.value)}
              className="w-full text-sm p-3.5 rounded-xl border border-slate-200 focus:border-violet-500 focus:outline-hidden min-h-[80px] disabled:bg-slate-50"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-black text-slate-700 flex items-center justify-between">
              <span>
                Chọn vai trò tuyển dụng <span className="text-rose-500">*</span>
              </span>
              <span className="text-xs font-semibold text-slate-400">
                ({selectedRoles.length} đã chọn)
              </span>
            </label>
            
            <div className={`flex flex-wrap gap-2 p-3 bg-slate-50 border rounded-2xl max-h-36 overflow-y-auto transition-colors ${
              roleError ? 'border-rose-300 bg-rose-50/30' : 'border-slate-100'
            }`}>
              {availableRoles.map((role) => {
                const isSelected = selectedRoles.includes(role)
                return (
                  <button
                    type="button"
                    key={role}
                    disabled={loading}
                    onClick={() => toggleRoleSelection(role)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                      isSelected
                        ? 'bg-violet-600 border-violet-600 text-white shadow-xs'
                        : 'bg-white border-slate-200/60 text-slate-600 hover:border-slate-300'
                    }`}
                  >
                    {role}
                  </button>
                )
              })}
              {availableRoles.length === 0 && (
                <div className="flex items-center gap-1.5 text-xs text-slate-400 italic py-1">
                  <AlertCircle className="h-4 w-4 text-slate-300" />
                  Chưa có vai trò chuẩn nào được định nghĩa trong hệ thống.
                </div>
              )}
            </div>

            {roleError && (
              <p className="text-xs text-rose-500 font-bold flex items-center gap-1 mt-0.5">
                <AlertCircle className="h-3.5 w-3.5" />
                Vui lòng chọn ít nhất 1 vai trò cho kỹ năng mới.
              </p>
            )}
          </div>

          <div className="flex justify-end gap-2 mt-2">
            <button
              type="button"
              disabled={loading}
              onClick={onClose}
              className="px-5 py-2.5 text-sm font-bold text-slate-500 hover:bg-slate-100 rounded-xl transition-all disabled:opacity-50"
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 text-sm font-black text-white bg-violet-600 hover:bg-violet-700 rounded-xl shadow-md transition-all disabled:bg-violet-400"
            >
              {loading ? 'Đang thêm...' : 'Thêm mới'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default React.memo(AddSkillModal)
