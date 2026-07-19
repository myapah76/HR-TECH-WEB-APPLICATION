import React, { useState } from 'react'
import { XCircle, FileText, Tag, Plus, Check, Network, Trash2, Loader2 } from 'lucide-react'
import { Skill, SkillEdge } from '@/src/types/skill'

interface SkillDetailPanelProps {
  selectedNode: Skill
  closePanel: () => void
  skills: Skill[]
  currentNodeRels: SkillEdge[]
  onUpdate: (description: string, roles: string[]) => Promise<void>
  onDeleteSkill: (id: string) => Promise<void>
  onAddRel: (targetId: string, type: 'PARENT_OF' | 'RELATED_TO') => Promise<void>
  onDeleteRel: (targetId: string, type: 'PARENT_OF' | 'RELATED_TO') => Promise<void>
  availableRoles: string[]
}

const SkillDetailPanel = ({
  selectedNode,
  closePanel,
  skills,
  currentNodeRels,
  onUpdate,
  onDeleteSkill,
  onAddRel,
  onDeleteRel,
  availableRoles,
}: SkillDetailPanelProps) => {
  const [editDesc, setEditDesc] = useState(selectedNode.description ?? '')
  const [editRoles, setEditRoles] = useState<string[]>(selectedNode.roles ?? [])
  const [newRole, setNewRole] = useState('')
  const [relTargetId, setRelTargetId] = useState('')
  const [relType, setRelType] = useState<'PARENT_OF' | 'RELATED_TO'>('RELATED_TO')

  // Sync state with selectedNode changes during render
  const [prevSelectedNodeId, setPrevSelectedNodeId] = useState(selectedNode.id)
  if (selectedNode.id !== prevSelectedNodeId) {
    setPrevSelectedNodeId(selectedNode.id)
    setEditDesc(selectedNode.description ?? '')
    setEditRoles(selectedNode.roles ?? [])
    setNewRole('')
    setRelTargetId('')
  }

  const addRoleTag = () => {
    const trimmed = newRole.trim()
    if (trimmed && !editRoles.includes(trimmed)) {
      setEditRoles([...editRoles, trimmed])
      setNewRole('')
    }
  }

  const removeRoleTag = (role: string) => {
    setEditRoles(editRoles.filter((r) => r !== role))
  }

  const [isSaving, setIsSaving] = useState(false)
  const [isAddingRel, setIsAddingRel] = useState(false)
  const [deletingRelId, setDeletingRelId] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleSave = async () => {
    setIsSaving(true)
    try {
      await onUpdate(editDesc, editRoles)
    } finally {
      setIsSaving(false)
    }
  }

  const handleAddRelationship = async () => {
    if (relTargetId) {
      setIsAddingRel(true)
      try {
        await onAddRel(relTargetId, relType)
        setRelTargetId('')
      } finally {
        setIsAddingRel(false)
      }
    }
  }

  const handleDeleteRel = async (targetId: string, type: 'PARENT_OF' | 'RELATED_TO') => {
    setDeletingRelId(targetId)
    try {
      await onDeleteRel(targetId, type)
    } finally {
      setDeletingRelId(null)
    }
  }

  const handleDeleteSkillClick = async () => {
    setIsDeleting(true)
    try {
      await onDeleteSkill(selectedNode.id)
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div
      className="w-96 border-l border-slate-100 p-6 overflow-y-auto flex flex-col gap-6 bg-white h-full relative"
      id="skill-detail-panel"
    >
      <button
        onClick={closePanel}
        className="absolute top-5 right-5 p-1 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600 transition-colors"
      >
        <XCircle className="h-6 w-6" />
      </button>

      <div>
        <span className="text-xs font-black text-slate-400 uppercase tracking-widest">
          Chi tiết kỹ năng
        </span>
        <h3 className="text-xl font-black text-slate-900 capitalize mt-1 break-all">
          {selectedNode.name}
        </h3>
        <span
          className={`inline-block mt-1.5 px-3 py-1 text-xs font-black rounded-lg uppercase tracking-wider ${
            selectedNode.isVerified
              ? 'bg-emerald-100 text-emerald-700'
              : 'bg-amber-100 text-amber-700'
          }`}
        >
          {selectedNode.isVerified ? 'Đã duyệt' : 'Chờ kiểm duyệt'}
        </span>
      </div>

      {/* Description */}
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-black text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
          <FileText className="h-4 w-4 text-slate-400" />
          Mô tả
        </label>
        <textarea
          value={editDesc}
          onChange={(e) => setEditDesc(e.target.value)}
          placeholder="Nhập mô tả kỹ năng..."
          className="w-full text-sm p-3.5 rounded-xl border border-slate-200 focus:border-violet-500 focus:outline-hidden min-h-22.5 resize-none bg-slate-50/50"
        />
      </div>

      {/* Roles Management */}
      <div className="flex flex-col gap-2">
        <label className="text-sm font-black text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
          <Tag className="h-4 w-4 text-slate-400" />
          Định vị vai trò (Roles)
        </label>
        <div className="flex flex-wrap gap-2 max-h-28 overflow-y-auto p-2 bg-slate-50 border border-slate-100 rounded-xl">
          {editRoles.map((role) => (
            <span
              key={role}
              className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-slate-700 bg-white border border-slate-200 rounded-lg shadow-xs"
            >
              {role}
              <button
                onClick={() => removeRoleTag(role)}
                className="text-slate-400 hover:text-red-500 transition-colors ml-0.5"
              >
                ×
              </button>
            </span>
          ))}
          {editRoles.length === 0 && (
            <span className="text-xs font-bold text-slate-400 p-1">Chưa gán role</span>
          )}
        </div>

        <div className="flex gap-1.5 mt-1">
          <select
            value={newRole}
            onChange={(e) => setNewRole(e.target.value)}
            className="flex-1 text-sm px-3.5 py-2 rounded-xl border border-slate-200 bg-white focus:border-violet-500 focus:outline-hidden"
          >
            <option value="">-- Chọn vai trò để gán --</option>
            {availableRoles
              .filter((role) => !editRoles.includes(role))
              .map((role) => (
                <option key={role} value={role}>
                  {role}
                </option>
              ))}
          </select>
          <button
            onClick={addRoleTag}
            disabled={!newRole}
            className="p-2.5 bg-slate-100 hover:bg-slate-200 disabled:opacity-50 text-slate-600 rounded-xl hover:text-violet-600 transition-all"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Save Node Info Button */}
      <button
        onClick={handleSave}
        disabled={isSaving}
        className="w-full py-2.5 bg-violet-600 hover:bg-violet-700 text-white rounded-xl text-sm font-black shadow-md hover:shadow-violet-200 active:scale-98 transition-all flex items-center justify-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isSaving ? (
          <Loader2 className="h-4.5 w-4.5 animate-spin" />
        ) : (
          <Check className="h-4.5 w-4.5" />
        )}
        {isSaving ? 'Đang lưu...' : 'Lưu Thay Đổi'}
      </button>

      <hr className="border-slate-100" />

      {/* Relationship Management */}
      <div className="flex flex-col gap-2.5">
        <span className="text-sm font-black text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
          <Network className="h-4 w-4 text-slate-400" />
          Các liên kết đồ thị
        </span>

        <div className="flex flex-col gap-2 max-h-36 overflow-y-auto">
          {currentNodeRels.map((edge) => {
            const targetName = skills.find((s) => s.id === edge.targetId)?.name || 'Unknown'
            return (
              <div
                key={`${edge.sourceId}-${edge.targetId}`}
                className="flex items-center justify-between p-2.5 bg-slate-50 hover:bg-slate-100/80 rounded-xl border border-slate-100 transition-colors"
              >
                <div className="flex flex-col">
                  <span className="text-xs font-black text-slate-800 capitalize">{targetName}</span>
                  <span className="text-[9px] font-black text-violet-600 uppercase tracking-wider">
                    {edge.type}
                  </span>
                </div>
                <button
                  onClick={() => handleDeleteRel(edge.targetId, edge.type)}
                  disabled={deletingRelId === edge.targetId}
                  className="p-1.5 text-slate-400 hover:text-red-650 hover:bg-white rounded-lg transition-all disabled:opacity-50"
                >
                  {deletingRelId === edge.targetId ? (
                    <Loader2 className="h-4 w-4 animate-spin text-red-600" />
                  ) : (
                    <Trash2 className="h-4 w-4" />
                  )}
                </button>
              </div>
            )
          })}
          {currentNodeRels.length === 0 && (
            <span className="text-xs font-bold text-slate-400 italic text-center py-3">
              Chưa có liên kết nào
            </span>
          )}
        </div>

        {/* Add relationship inside detail panel */}
        <div className="mt-2 bg-slate-50/50 p-4 rounded-2xl border border-slate-100 flex flex-col gap-2.5">
          <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
            Thêm liên kết mới
          </span>

          <select
            value={relTargetId}
            onChange={(e) => setRelTargetId(e.target.value)}
            className="w-full text-sm p-2 rounded-lg border border-slate-200 bg-white focus:outline-hidden"
          >
            <option value="">-- Chọn kỹ năng đích --</option>
            {skills
              .filter((s) => s.id !== selectedNode.id)
              .map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
          </select>

          <select
            value={relType}
            onChange={(e) => setRelType(e.target.value as any)}
            className="w-full text-sm p-2 rounded-lg border border-slate-200 bg-white focus:outline-hidden"
          >
            <option value="RELATED_TO">Liên quan (RELATED_TO)</option>
            <option value="PARENT_OF">Là cha của (PARENT_OF)</option>
          </select>

          <button
            onClick={handleAddRelationship}
            disabled={!relTargetId || isAddingRel}
            className="w-full mt-1 py-2 bg-slate-800 hover:bg-slate-900 disabled:bg-slate-200 disabled:cursor-not-allowed text-white rounded-xl text-xs font-black tracking-wider uppercase transition-all flex items-center justify-center gap-1"
          >
            {isAddingRel && <Loader2 className="h-3 w-3 animate-spin" />}
            {isAddingRel ? 'Đang tạo...' : 'Tạo liên kết'}
          </button>
        </div>
      </div>

      <hr className="border-slate-100 mt-auto" />

      {/* Danger Zone */}
      <button
        onClick={handleDeleteSkillClick}
        disabled={isDeleting}
        className="w-full py-2.5 bg-red-50/80 hover:bg-red-100/80 text-red-600 hover:text-red-700 rounded-xl text-sm font-black transition-all flex items-center justify-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isDeleting ? (
          <Loader2 className="h-4.5 w-4.5 animate-spin" />
        ) : (
          <Trash2 className="h-4.5 w-4.5" />
        )}
        {isDeleting ? 'Đang xóa...' : 'Xóa Kỹ Năng Này'}
      </button>
    </div>
  )
}

export default React.memo(SkillDetailPanel)
