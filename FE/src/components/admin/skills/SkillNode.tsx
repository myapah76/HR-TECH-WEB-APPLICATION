import React from 'react'
import { Handle, Position } from '@xyflow/react'
import { Plus, Minus } from 'lucide-react'
import { Skill } from '@/src/types/skill'

interface SkillNodeProps {
  data: Skill & {
    isExpanded?: boolean
    hasExpandableChildren?: boolean
    onToggleExpand?: () => void
  }
}

const SkillNodeComponent = ({ data }: SkillNodeProps) => {
  const isVerified = data.isVerified ?? false
  const isDimmed = (data as any).isDimmed ?? false
  const isCurrent = (data as any).isCurrent ?? false
  const isExpanded = data.isExpanded ?? false
  const hasExpandableChildren = data.hasExpandableChildren ?? false

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (data.onToggleExpand) {
      data.onToggleExpand()
    }
  }

  return (
    <div
      className={`relative w-24 h-24 rounded-full shadow-lg border-2 transition-all duration-300 flex flex-col items-center justify-center text-center hover:scale-110 select-none ${
        isVerified
          ? 'border-violet-600 bg-violet-500 text-white shadow-violet-500/20 hover:bg-violet-600 hover:border-violet-700'
          : 'border-amber-500 border-dashed bg-amber-400 text-amber-950 shadow-amber-400/20 hover:bg-amber-500'
      } ${
        isDimmed ? 'opacity-20 scale-95' : 'opacity-100'
      } ${
        isCurrent ? 'ring-4 ring-violet-400 ring-offset-2 scale-105' : ''
      }`}
    >
      {/* Hidden handles exactly in the center to make straight lines look like Neo4j connections */}
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

      <span className="text-xs font-black leading-tight break-words px-2 max-h-[76px] overflow-hidden text-ellipsis lowercase">
        {data.name}
      </span>

      {/* Expand / Collapse Indicator Badge */}
      {(hasExpandableChildren || isExpanded) && (
        <button
          type="button"
          onClick={handleToggle}
          title={isExpanded ? 'Thu gọn nhánh' : 'Mở rộng nhánh con'}
          className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center text-white border-2 border-white shadow-md transition-transform active:scale-90 ${
            isExpanded
              ? 'bg-rose-500 hover:bg-rose-600'
              : 'bg-emerald-500 hover:bg-emerald-600 animate-pulse'
          }`}
        >
          {isExpanded ? <Minus className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
        </button>
      )}
    </div>
  )
}

export default React.memo(SkillNodeComponent)
