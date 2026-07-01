import React from 'react'
import { ReactFlow, Controls, Background, Panel, Node } from '@xyflow/react'
import { Plus } from 'lucide-react'
import { Skill, SkillEdge } from '@/src/types/skill'
import SkillNodeComponent from './SkillNode'
import SkillDetailPanel from './SkillDetailPanel'
import AddSkillModal from './AddSkillModal'
import SkillGraphLegend from './SkillGraphLegend'

interface SkillGraphViewProps {
  nodes: any[]
  edges: any[]
  skills: Skill[]
  edgesList: SkillEdge[]
  selectedNode: Skill | null
  isAddOpen: boolean
  availableRoles: string[]
  nodeTypes: Record<string, any>
  onNodesChange: (changes: any) => void
  onEdgesChange: (changes: any) => void
  onNodeClick: (_: any, node: Node) => void
  onNodeDragStart: (_: any, node: Node) => void
  onNodeDrag: (_: any, node: Node) => void
  onNodeDragStop: (_: any, node: Node) => void
  onOpenAdd: () => void
  onCloseAdd: () => void
  onAddSkill: (name: string, description: string, roles: string[]) => Promise<void>
  onClosePanel: () => void
  onUpdateSkill: (description: string, roles: string[]) => Promise<void>
  onDeleteSkill: (id: string) => Promise<void>
  onAddRel: (targetId: string, type: 'PARENT_OF' | 'RELATED_TO') => Promise<void>
  onDeleteRel: (targetId: string, type: 'PARENT_OF' | 'RELATED_TO') => Promise<void>
  currentNodeRels: SkillEdge[]
}

const SkillGraphView = ({
  nodes,
  edges,
  skills,
  selectedNode,
  isAddOpen,
  availableRoles,
  nodeTypes,
  onNodesChange,
  onEdgesChange,
  onNodeClick,
  onNodeDragStart,
  onNodeDrag,
  onNodeDragStop,
  onOpenAdd,
  onCloseAdd,
  onAddSkill,
  onClosePanel,
  onUpdateSkill,
  onDeleteSkill,
  onAddRel,
  onDeleteRel,
  currentNodeRels,
}: SkillGraphViewProps) => {
  return (
    <div className="flex-1 flex gap-6 relative min-h-0 bg-white rounded-3xl border border-slate-200/60 p-1.5 shadow-sm overflow-hidden">

      {/* React Flow Container */}
      <div className="flex-1 relative h-full rounded-2xl overflow-hidden bg-slate-50">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onNodeClick={onNodeClick}
          onNodeDragStart={onNodeDragStart}
          onNodeDrag={onNodeDrag}
          onNodeDragStop={onNodeDragStop}
          nodeTypes={nodeTypes}
          fitView
          minZoom={0.2}
          maxZoom={2.5}
        >
          <Background color="#cbd5e1" gap={18} size={1} />
          <Controls className="!bg-white !border-slate-200 !shadow-lg" />

          {/* Add skill button */}
          <Panel position="top-right" className="flex gap-2">
            <button
              onClick={onOpenAdd}
              className="flex items-center gap-1.5 px-5 py-2.5 text-sm font-bold text-white bg-violet-600 hover:bg-violet-700 active:scale-95 transition-all rounded-xl shadow-md"
            >
              <Plus className="h-4 w-4" />
              Thêm Kỹ năng
            </button>
          </Panel>

          <SkillGraphLegend />
        </ReactFlow>
      </div>

      {/* Right detail panel */}
      {selectedNode && (
        <SkillDetailPanel
          selectedNode={selectedNode}
          closePanel={onClosePanel}
          skills={skills}
          currentNodeRels={currentNodeRels}
          onUpdate={onUpdateSkill}
          onDeleteSkill={onDeleteSkill}
          onAddRel={onAddRel}
          onDeleteRel={onDeleteRel}
          availableRoles={availableRoles}
        />
      )}

      {/* Add Skill Modal */}
      <AddSkillModal
        isOpen={isAddOpen}
        onClose={onCloseAdd}
        onAdd={onAddSkill}
        availableRoles={availableRoles}
      />
    </div>
  )
}

export default SkillGraphView
