import React from 'react'
import { Trash2, Check, X, ChevronDown, ChevronUp, PlusCircle, Edit2 } from 'lucide-react'
import { RoleAlias } from '@/src/types/skill'

interface CanonicalGroup {
  canonicalRole: string
  aliases: RoleAlias[]
}

interface CanonicalRoleRowProps {
  group: CanonicalGroup
  isExpanded: boolean
  isEditing: boolean
  aliasInputValue: string
  editCanonicalText: string
  onToggle: (canonical: string) => void
  onStartEdit: (e: React.MouseEvent, name: string) => void
  onCancelEdit: (e: React.MouseEvent) => void
  onConfirmRename: (e: React.MouseEvent, oldName: string) => void
  onEditTextChange: (value: string) => void
  onAliasInputChange: (canonical: string, value: string) => void
  onAddAlias: (canonical: string) => void
  onDeleteAlias: (id: string, alias: string) => void
  onDeleteGroup: (group: CanonicalGroup) => void
}

const CanonicalRoleRow = ({
  group,
  isExpanded,
  isEditing,
  aliasInputValue,
  editCanonicalText,
  onToggle,
  onStartEdit,
  onCancelEdit,
  onConfirmRename,
  onEditTextChange,
  onAliasInputChange,
  onAddAlias,
  onDeleteAlias,
  onDeleteGroup,
}: CanonicalRoleRowProps) => {
  return (
    <div className="flex flex-col bg-white">
      {/* Accordion Row Header */}
      <div
        onClick={() => !isEditing && onToggle(group.canonicalRole)}
        className={`flex items-center justify-between px-6 py-5 transition-colors select-none ${
          isEditing ? 'bg-slate-50/30' : 'cursor-pointer hover:bg-slate-50/50'
        }`}
      >
        <div className="flex items-center gap-4 flex-1">
          {!isEditing && (
            <>
              {isExpanded ? (
                <ChevronUp className="h-5 w-5 text-slate-400" />
              ) : (
                <ChevronDown className="h-5 w-5 text-slate-400" />
              )}
            </>
          )}

          {isEditing ? (
            <div
              className="flex items-center gap-2 max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <input
                type="text"
                value={editCanonicalText}
                onChange={(e) => onEditTextChange(e.target.value)}
                className="px-3.5 py-2 text-sm border border-slate-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-violet-500 focus:border-violet-500 bg-white w-full transition-all lowercase"
                autoFocus
              />
              <button
                onClick={(e) => onConfirmRename(e, group.canonicalRole)}
                className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                title="Lưu tên vai trò"
              >
                <Check className="h-4.5 w-4.5" />
              </button>
              <button
                onClick={onCancelEdit}
                className="p-1.5 text-slate-400 hover:bg-slate-100 rounded-lg transition-colors"
                title="Hủy"
              >
                <X className="h-4.5 w-4.5" />
              </button>
            </div>
          ) : (
            <>
              <span className="font-bold text-slate-800 text-base tracking-wide lowercase">
                {group.canonicalRole}
              </span>
              <span className="text-xs bg-slate-100 text-slate-500 font-bold px-2.5 py-0.5 rounded-full">
                {group.aliases.length} alias
              </span>
            </>
          )}
        </div>

        {!isEditing && (
          <div className="flex items-center gap-3" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={(e) => onStartEdit(e, group.canonicalRole)}
              className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-all"
              title="Đổi tên vai trò chuẩn (Cập nhật hàng loạt)"
            >
              <Edit2 className="h-4 w-4" />
            </button>
            <button
              onClick={() => onDeleteGroup(group)}
              className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
              title="Xóa vai trò chuẩn và toàn bộ alias"
            >
              <Trash2 className="h-4.5 w-4.5" />
            </button>
          </div>
        )}
      </div>

      {/* Expanded Details */}
      {isExpanded && !isEditing && (
        <div className="px-16 pb-6 pt-2 bg-slate-50/40 border-t border-slate-50/80 animate-slideDown">
          {/* List of Aliases */}
          <div className="flex flex-wrap gap-3 mb-5">
            {group.aliases.map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200/60 rounded-xl text-slate-700 font-medium text-sm shadow-xs hover:border-slate-300 transition-all"
              >
                <span className="font-mono lowercase text-sm text-slate-600">{item.alias}</span>
                <button
                  onClick={() => onDeleteAlias(item.id, item.alias)}
                  className="text-slate-400 hover:text-rose-600 rounded-full hover:bg-slate-100 p-0.5 transition-colors"
                  title="Xóa alias"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>

          {/* Inline Add Alias Form */}
          <div className="flex items-center gap-3 max-w-md">
            <input
              type="text"
              placeholder="Thêm alias mới (vd: java dev)..."
              value={aliasInputValue}
              onChange={(e) => onAliasInputChange(group.canonicalRole, e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') onAddAlias(group.canonicalRole)
              }}
              className="flex-1 px-4 py-2 text-sm border border-slate-200 rounded-xl bg-white focus:outline-hidden focus:ring-1 focus:ring-violet-500 focus:border-violet-500 transition-all"
            />
            <button
              onClick={() => onAddAlias(group.canonicalRole)}
              className="flex items-center gap-1.5 px-4.5 py-2 text-sm font-bold text-white bg-violet-600 hover:bg-violet-700 active:scale-95 rounded-xl transition-all shadow-xs"
            >
              <PlusCircle className="h-4 w-4" />
              Thêm
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default CanonicalRoleRow
