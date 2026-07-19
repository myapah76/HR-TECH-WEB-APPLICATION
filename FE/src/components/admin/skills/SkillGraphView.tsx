import React, { useState, useMemo } from 'react'
import { ReactFlow, ReactFlowProvider, useReactFlow, Controls, Background, Panel, Node } from '@xyflow/react'
import { Plus, Search, X, Maximize2, Minimize2 } from 'lucide-react'
import { Skill, SkillEdge } from '@/src/types/skill'
import SkillDetailPanel from './SkillDetailPanel'
import AddSkillModal from './AddSkillModal'
import SkillGraphLegend from './SkillGraphLegend'
import FloatingConnectionEdge from './FloatingConnectionEdge'
import RoleNode from './RoleNode'
import SkillNodeComponent from './SkillNode'

const edgeTypes = {
  floating: FloatingConnectionEdge,
}

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
  onExpandAll?: () => void
  onCollapseAll?: () => void
  onExpandPathToSkill?: (skillId: string) => void
  isLoading?: boolean
}

const SkillGraphInner = ({
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
  onExpandAll,
  onCollapseAll,
  onExpandPathToSkill,
  isLoading = false,
}: SkillGraphViewProps) => {
  const { setCenter } = useReactFlow()
  const [searchQuery, setSearchQuery] = useState('')
  const [showSuggestions, setShowSuggestions] = useState(false)

  const mergedNodeTypes = useMemo(
    () => ({
      skillNode: SkillNodeComponent,
      roleNode: RoleNode,
      ...nodeTypes,
    }),
    [nodeTypes]
  )

  const suggestions = useMemo(() => {
    if (!searchQuery.trim()) return []
    const query = searchQuery.toLowerCase()
    return skills.filter((s) => s.name.toLowerCase().includes(query))
  }, [skills, searchQuery])

  const handleReactFlowNodeClick = (_: any, flowNode: Node) => {
    // 1. Smoothly zoom and center viewport on clicked node
    if (flowNode.position) {
      const targetZoom = flowNode.id.startsWith('role:') ? 1.1 : 1.3
      setCenter(flowNode.position.x, flowNode.position.y, { zoom: targetZoom, duration: 800 })
    }

    // 2. Select node to highlight its relationships and dim unrelated nodes
    onNodeClick(_, flowNode)
  }

  const handleSelectSkill = (skill: Skill) => {
    // 1. Expand path to skill if drill-down is active
    if (onExpandPathToSkill) {
      onExpandPathToSkill(skill.id)
    }

    // 2. Select the node to open detail panel
    onNodeClick(null as any, { id: skill.id } as Node)

    // 3. Zoom & center the viewport on the selected node
    setTimeout(() => {
      const flowNode = nodes.find((n) => n.id === skill.id)
      if (flowNode) {
        setCenter(flowNode.position.x, flowNode.position.y, { zoom: 1.3, duration: 800 })
      }
    }, 150)

    setSearchQuery(skill.name)
    setShowSuggestions(false)
  }

  const handleClearSearch = () => {
    setSearchQuery('')
    setShowSuggestions(false)
    onClosePanel()
  }

  return (
    <div className="flex-1 flex gap-6 relative min-h-0 bg-white rounded-3xl border border-slate-200/60 p-1.5 shadow-sm overflow-hidden">
      
      {/* React Flow Container */}
      <div className="flex-1 relative h-full rounded-2xl overflow-hidden bg-slate-50">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onNodeClick={handleReactFlowNodeClick}
          onNodeDragStart={onNodeDragStart}
          onNodeDrag={onNodeDrag}
          onNodeDragStop={onNodeDragStop}
          nodeTypes={mergedNodeTypes}
          edgeTypes={edgeTypes}
          onPaneClick={() => setShowSuggestions(false)}
          fitView
          minZoom={0.2}
          maxZoom={2.5}
        >
          <Background color="#cbd5e1" gap={18} size={1} />
          <Controls className="!bg-white !border-slate-200 !shadow-lg" />

          {/* Search bar panel */}
          <Panel position="top-center" className="flex flex-col gap-1 w-80">
            <div className="relative flex items-center bg-white/95 backdrop-blur-md rounded-2xl border border-slate-200/80 shadow-md px-3.5 py-2">
              <Search className="h-4.5 w-4.5 text-slate-400 mr-2 shrink-0" />
              <input
                type="text"
                placeholder="Tìm kiếm kỹ năng..."
                value={searchQuery}
                onFocus={() => setShowSuggestions(true)}
                onChange={(e) => {
                  setSearchQuery(e.target.value)
                  setShowSuggestions(true)
                }}
                className="w-full text-sm bg-transparent border-none outline-hidden text-slate-800 placeholder-slate-400"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={handleClearSearch}
                  className="p-1 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* Suggestions list */}
            {showSuggestions && suggestions.length > 0 && (
              <div className="bg-white/95 backdrop-blur-md border border-slate-200/80 rounded-2xl shadow-xl max-h-60 overflow-y-auto flex flex-col p-1.5 z-50 animate-scale-up">
                {suggestions.map((skill) => (
                  <button
                    type="button"
                    key={skill.id}
                    onClick={() => handleSelectSkill(skill)}
                    className="w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-bold text-slate-700 hover:bg-violet-50 hover:text-violet-700 transition-all capitalize"
                  >
                    {skill.name}
                  </button>
                ))}
              </div>
            )}

            {showSuggestions && searchQuery && suggestions.length === 0 && (
              <div className="bg-white/95 backdrop-blur-md border border-slate-200/80 rounded-2xl shadow-xl p-4 text-center text-xs text-slate-400 font-bold">
                Không tìm thấy kỹ năng nào
              </div>
            )}
          </Panel>

          {/* Drill-down Controls & Add skill button */}
          <Panel position="top-right" className="flex items-center gap-2">
            {onCollapseAll && (
              <button
                type="button"
                onClick={onCollapseAll}
                title="Thu gọn về Tầng 0 (Role Roots)"
                className="flex items-center gap-1.5 px-3 py-2.5 text-xs font-bold text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl shadow-xs transition-all active:scale-95"
              >
                <Minimize2 className="h-3.5 w-3.5 text-slate-500" />
                Thu gọn
              </button>
            )}

            {onExpandAll && (
              <button
                type="button"
                onClick={onExpandAll}
                title="Mở rộng tất cả các kỹ năng"
                className="flex items-center gap-1.5 px-3 py-2.5 text-xs font-bold text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl shadow-xs transition-all active:scale-95"
              >
                <Maximize2 className="h-3.5 w-3.5 text-violet-600" />
                Mở tất cả
              </button>
            )}

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

        {/* Loading overlay */}
        {isLoading && (
          <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-slate-50/70 backdrop-blur-xs rounded-2xl transition-all duration-300">
            <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xl flex flex-col items-center space-y-4 max-w-xs text-center animate-scale-up">
              <div className="w-12 h-12 rounded-full border-4 border-violet-100 border-t-violet-600 animate-spin" />
              <div className="space-y-1">
                <h3 className="text-sm font-black text-slate-800">Đang tải sơ đồ</h3>
                <p className="text-xs text-slate-450 font-semibold leading-relaxed">
                  Hệ thống đang dựng cấu trúc đồ thị kỹ năng từ Neo4j database...
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Right detail panel */}
      {selectedNode && !selectedNode.id.startsWith('role:') && (
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

const SkillGraphView = (props: SkillGraphViewProps) => {
  return (
    <ReactFlowProvider>
      <SkillGraphInner {...props} />
    </ReactFlowProvider>
  )
}

export default SkillGraphView
