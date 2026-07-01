import React from 'react'
import { Handle, Position } from '@xyflow/react'
import { Skill } from '@/src/types/skill'

interface SkillNodeProps {
  data: Skill
}

const SkillNodeComponent = ({ data }: SkillNodeProps) => {
  const isVerified = data.isVerified ?? false
  const isDimmed = (data as any).isDimmed ?? false
  const isCurrent = (data as any).isCurrent ?? false

  return (
    <div
      className={`w-24 h-24 rounded-full shadow-lg border-2 transition-all duration-300 flex flex-col items-center justify-center text-center hover:scale-110 select-none ${
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
    </div>
  )
}

export default React.memo(SkillNodeComponent)
