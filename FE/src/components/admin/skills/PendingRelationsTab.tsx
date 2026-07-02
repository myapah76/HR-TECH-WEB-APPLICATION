import React from 'react'
import { CheckCircle, XCircle } from 'lucide-react'
import { PendingRelationship } from '@/src/types/skill'

interface PendingRelationsTabProps {
  pendingRels: PendingRelationship[]
  onApprove: (sourceId: string, targetId: string, type: string) => Promise<void>
  onReject: (sourceId: string, targetId: string, type: string) => Promise<void>
}

const PendingRelationsTab = ({ pendingRels, onApprove, onReject }: PendingRelationsTabProps) => {
  return (
    <div className="flex-1 bg-white rounded-3xl border border-slate-200/60 p-6 shadow-sm overflow-y-auto">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-black text-slate-800">
          Danh sách Liên kết Chờ Duyệt (từ AI)
        </h2>
      </div>

      <div className="border border-slate-100 rounded-2xl overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 text-xs font-black text-slate-500 uppercase tracking-wider border-b border-slate-100">
              <th className="px-6 py-4">Kỹ năng nguồn</th>
              <th className="px-6 py-4 text-center">Mối quan hệ</th>
              <th className="px-6 py-4">Kỹ năng đích</th>
              <th className="px-6 py-4 text-center">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm">
            {pendingRels.map((rel, idx) => (
              <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                <td className="px-6 py-4 font-bold text-slate-800 capitalize">
                  {rel.sourceSkillName}
                </td>
                <td className="px-6 py-4 text-center">
                  <span
                    className={`inline-block px-3 py-1 text-xs font-black rounded-lg uppercase tracking-wider ${
                      rel.relationshipType === 'PARENT_OF'
                        ? 'bg-violet-100 text-violet-700 border border-violet-200'
                        : 'bg-slate-100 text-slate-600 border border-slate-200'
                    }`}
                  >
                    {rel.relationshipType}
                  </span>
                </td>
                <td className="px-6 py-4 font-bold text-slate-800 capitalize">
                  {rel.targetSkillName}
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center justify-center gap-2">
                    <button
                      onClick={() =>
                        onApprove(rel.sourceSkillId, rel.targetSkillId, rel.relationshipType)
                      }
                      className="flex items-center gap-1.5 px-4 py-2 text-xs font-black text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-xl transition-all"
                    >
                      <CheckCircle className="h-4 w-4" />
                      DUYỆT
                    </button>
                    <button
                      onClick={() =>
                        onReject(rel.sourceSkillId, rel.targetSkillId, rel.relationshipType)
                      }
                      className="flex items-center gap-1.5 px-4 py-2 text-xs font-black text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 rounded-xl transition-all"
                    >
                      <XCircle className="h-4 w-4" />
                      BỎ
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {pendingRels.length === 0 && (
              <tr>
                <td colSpan={4} className="text-center py-10 text-slate-400 font-medium">
                  Không có mối quan hệ nào chờ kiểm duyệt.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default React.memo(PendingRelationsTab)
