import React from 'react'
import { AlertTriangle } from 'lucide-react'

interface CanonicalRoleConfirmModalProps {
  type: 'edit' | 'delete'
  canonicalRole: string
  newName?: string
  affectedNodes: string[]
  onConfirm: () => Promise<void>
  onCancel: () => void
}

const CanonicalRoleConfirmModal = ({
  type,
  canonicalRole,
  newName,
  affectedNodes,
  onConfirm,
  onCancel,
}: CanonicalRoleConfirmModalProps) => {
  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl border border-slate-100 max-w-lg w-full p-6 shadow-2xl animate-scaleIn flex flex-col gap-4">

        {/* Modal Icon & Title */}
        <div className="flex items-start gap-4">
          <div className={`p-3.5 rounded-2xl ${type === 'delete' ? 'bg-rose-50 text-rose-600' : 'bg-amber-50 text-amber-600'}`}>
            <AlertTriangle className="h-7 w-7" />
          </div>
          <div>
            <h3 className="text-lg font-black text-slate-800">
              Cảnh báo ảnh hưởng dữ liệu!
            </h3>
            <p className="text-sm text-slate-500 mt-1 font-medium">
              {type === 'delete'
                ? `Bạn đang thực hiện xóa vai trò chuẩn '${canonicalRole}'.`
                : `Bạn đang thực hiện đổi tên vai trò chuẩn từ '${canonicalRole}' sang '${newName}'.`
              }
            </p>
          </div>
        </div>

        {/* Warning Details */}
        <div className="bg-slate-50 border border-slate-100 rounded-2xl p-5 flex flex-col gap-2.5">
          <span className="text-xs font-black text-slate-400 uppercase tracking-wider">
            Mức độ ảnh hưởng:
          </span>
          <p className="text-sm font-semibold text-slate-700">
            {affectedNodes.length > 0
              ? `Có ${affectedNodes.length} kỹ năng trong đồ thị đang gán vai trò này sẽ bị cập nhật trực tiếp:`
              : 'Không có kỹ năng nào trong đồ thị bị ảnh hưởng bởi hành động này.'
            }
          </p>

          {affectedNodes.length > 0 && (
            <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto mt-1.5 p-2 bg-white border border-slate-100 rounded-xl">
              {affectedNodes.map((name) => (
                <span
                  key={name}
                  className="px-2.5 py-1.5 bg-violet-50 text-violet-700 border border-violet-100/50 rounded-lg text-xs font-bold"
                >
                  {name}
                </span>
              ))}
            </div>
          )}
        </div>

        <p className="text-sm text-slate-500 font-medium">
          Hành động này sẽ cập nhật đồng loạt cơ sở dữ liệu Postgres và đồ thị Neo4j. Bạn có chắc chắn muốn tiếp tục?
        </p>

        <div className="flex gap-3 mt-2 justify-end">
          <button
            onClick={onCancel}
            className="px-5 py-2.5 rounded-xl border border-slate-200 text-sm font-bold text-slate-600 hover:bg-slate-50 active:scale-95 transition-all"
          >
            Hủy bỏ
          </button>
          <button
            onClick={onConfirm}
            className={`px-6 py-2.5 rounded-xl text-sm font-bold text-white active:scale-95 transition-all shadow-xs ${
              type === 'delete' ? 'bg-rose-600 hover:bg-rose-700' : 'bg-amber-500 hover:bg-amber-600'
            }`}
          >
            Xác nhận thực hiện
          </button>
        </div>
      </div>
    </div>
  )
}

export default CanonicalRoleConfirmModal
