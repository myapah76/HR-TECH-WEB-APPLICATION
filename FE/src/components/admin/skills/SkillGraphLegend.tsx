import React from 'react'
import { Activity } from 'lucide-react'
import { Panel } from '@xyflow/react'

const SkillGraphLegend = () => {
  return (
    <Panel position="top-left" className="bg-white/80 backdrop-blur-md px-4 py-3 rounded-2xl border border-slate-200/60 shadow-md max-w-xs">
      <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
        <Activity className="h-3.5 w-3.5 text-violet-600" />
        Chú giải sơ đồ
      </h4>
      <div className="flex flex-col gap-2 mt-2">
        <div className="flex items-center gap-2.5 text-xs font-medium text-slate-600">
          <span className="w-4 h-4 bg-violet-500 border border-violet-600 rounded-full shrink-0"></span>
          <span>Đã duyệt (Verified)</span>
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
    </Panel>
  )
}

export default SkillGraphLegend
