import React from 'react'
import { Handle, Position, NodeProps } from '@xyflow/react'
import { Plus, Minus } from 'lucide-react'

export interface RoleNodeData {
  label: string
  roleName: string
  skillCount: number
  isExpanded: boolean
  onToggleExpand?: () => void
}

const RoleNode: React.FC<NodeProps> = ({ data }) => {
  const roleData = data as unknown as RoleNodeData
  const { label, skillCount, isExpanded, onToggleExpand } = roleData
  const isDimmed = (data as any).isDimmed ?? false
  const isCurrent = (data as any).isCurrent ?? false

  return (
    <div
      className={`relative w-36 h-36 rounded-full border-3 shadow-xl transition-all duration-300 flex flex-col items-center justify-center text-center p-3 cursor-pointer select-none hover:scale-105 ${
        isExpanded
          ? 'bg-gradient-to-br from-violet-600 via-indigo-600 to-purple-800 text-white border-amber-400 shadow-violet-600/30'
          : 'bg-gradient-to-br from-slate-900 via-slate-800 to-violet-950 text-white border-violet-500 hover:border-amber-400 shadow-slate-900/40'
      } ${
        isDimmed ? 'opacity-20 scale-95' : 'opacity-100'
      } ${
        isCurrent ? 'ring-4 ring-amber-400 ring-offset-2 scale-105' : ''
      }`}
    >
      {/* Target & Source Handles in the center */}
      <Handle
        type="target"
        position={Position.Top}
        className="opacity-0"
        style={{ left: '50%', top: '50%', transform: 'translate(-50%, -50%)' }}
      />
      <Handle
        type="source"
        position={Position.Bottom}
        className="opacity-0"
        style={{ left: '50%', top: '50%', transform: 'translate(-50%, -50%)' }}
      />

      {/* Role Title */}
      <span className="text-sm font-black uppercase tracking-wider leading-tight break-words px-1.5 max-h-[60px] overflow-hidden text-ellipsis drop-shadow-md">
        {label}
      </span>

      {/* Skill Count Badge */}
      <div className="mt-1.5 px-2.5 py-0.5 bg-amber-400 text-slate-950 rounded-full text-[11px] font-black shadow-sm tracking-wide">
        {skillCount} skills
      </div>

      {/* Expand / Collapse Indicator Badge */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation()
          if (onToggleExpand) onToggleExpand()
        }}
        title={isExpanded ? 'Thu gọn' : 'Mở rộng'}
        className={`absolute bottom-0 right-0 w-7 h-7 rounded-full flex items-center justify-center text-white border-2 border-white shadow-md transition-transform active:scale-90 ${
          isExpanded ? 'bg-rose-500 hover:bg-rose-600' : 'bg-emerald-500 hover:bg-emerald-600 animate-pulse'
        }`}
      >
        {isExpanded ? <Minus className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
      </button>
    </div>
  )
}

export default React.memo(RoleNode)
