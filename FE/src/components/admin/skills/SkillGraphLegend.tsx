'use client'

import React, { useState } from 'react'
import { Activity, ChevronDown, ChevronUp } from 'lucide-react'
import { Panel } from '@xyflow/react'

const SkillGraphLegend = () => {
  const [isCollapsed, setIsCollapsed] = useState(true)

  return (
    <Panel position="top-left" className="transition-all duration-300">
      <div className="bg-white/90 backdrop-blur-md rounded-2xl border border-slate-200/80 shadow-md p-3 max-w-xs transition-all duration-300">
        {/* Header Toggle */}
        <button
          type="button"
          onClick={() => setIsCollapsed((prev) => !prev)}
          className="w-full flex items-center justify-between gap-3 text-xs font-black text-slate-800 uppercase tracking-wider hover:text-violet-600 transition-colors select-none"
        >
          <div className="flex items-center gap-2">
            <Activity className="h-4 w-4 text-violet-600" />
            <span>Chú giải sơ đồ</span>
          </div>
          {isCollapsed ? (
            <ChevronDown className="h-4 w-4 text-slate-400" />
          ) : (
            <ChevronUp className="h-4 w-4 text-slate-400" />
          )}
        </button>

        {/* Collapsible Legend Details */}
        {!isCollapsed && (
          <div className="flex flex-col gap-2.5 mt-3 pt-3 border-t border-slate-100 animate-fadeIn">
            <div className="flex items-center gap-2.5 text-xs font-medium text-slate-600">
              <span className="w-4 h-4 bg-indigo-900 border-2 border-indigo-700 rounded-full shrink-0"></span>
              <span>Vai trò tuyển dụng (Root Node)</span>
            </div>
            <div className="flex items-center gap-2.5 text-xs font-medium text-slate-600">
              <span className="w-4 h-4 bg-violet-500 border border-violet-600 rounded-full shrink-0"></span>
              <span>Đã duyệt (Verified Skill)</span>
            </div>
            <div className="flex items-center gap-2.5 text-xs font-medium text-slate-600">
              <span className="w-4 h-4 bg-amber-400 border border-amber-500 border-dashed rounded-full shrink-0"></span>
              <span>AI trích xuất (Chờ duyệt)</span>
            </div>
            <div className="flex items-center gap-2.5 text-xs font-medium text-slate-600">
              <span className="w-5 h-0.5 bg-violet-500 shrink-0"></span>
              <span>Quan hệ cha-con (PARENT_OF)</span>
            </div>
            <div className="flex items-center gap-2.5 text-xs font-medium text-slate-600">
              <span className="w-5 h-0.5 bg-slate-400 shrink-0"></span>
              <span>Quan hệ tương đồng (RELATED_TO)</span>
            </div>
            <div className="flex items-center gap-2.5 text-xs font-medium text-slate-600">
              <span className="w-5 h-0.5 border-t-2 border-dashed border-violet-500 shrink-0"></span>
              <span>Mối liên kết chưa duyệt</span>
            </div>
          </div>
        )}
      </div>
    </Panel>
  )
}

export default React.memo(SkillGraphLegend)
