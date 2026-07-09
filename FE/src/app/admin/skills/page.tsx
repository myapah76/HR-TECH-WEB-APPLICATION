'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { Node } from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import { Network, UserCheck, GitBranch, GitMerge, Workflow } from 'lucide-react'
import { toast, Toaster } from 'sonner'
import { getErrorMessage } from '@/src/utils'
import {
  getSkillGraph,
  createSkill,
  updateSkill,
  deleteSkill,
  addRelatedSkill,
  addParentChild,
  deleteRelationship,
  getPendingSkills,
  approveSkill,
  approveAllSkills,
  rejectSkill,
  getPendingRelationships,
  approveRelationship,
  approveAllPendingRelationships,
  rejectRelationship,
  getDistinctCanonicalRoles,
} from '@/src/services/skill.service'
import { Skill, SkillEdge, PendingRelationship } from '@/src/types/skill'
import { SkillTab } from '@/src/enums/skill.enum'
import SkillNodeComponent from '@/src/components/admin/skills/SkillNode'
import SkillGraphView from '@/src/components/admin/skills/SkillGraphView'
import PendingSkillsTab from '@/src/components/admin/skills/PendingSkillsTab'
import PendingRelationsTab from '@/src/components/admin/skills/PendingRelationsTab'
import RoleAliasesTab from '@/src/components/admin/skills/RoleAliasesTab'
import { useSkillPhysics } from '@/src/utils/skillPhysicsUtils'
import { useDrillDownGraph } from '@/src/utils/skillDrillDownUtils'

export default function AdminSkillsDashboard() {
  const [activeTab, setActiveTab] = useState<SkillTab>(SkillTab.GRAPH)
  const [selectedNode, setSelectedNode] = useState<Skill | null>(null)
  const [skills, setSkills] = useState<Skill[]>([])
  const [edgesList, setEdgesList] = useState<SkillEdge[]>([])
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [pendingSkills, setPendingSkills] = useState<Skill[]>([])
  const [pendingRels, setPendingRels] = useState<PendingRelationship[]>([])
  const [availableRoles, setAvailableRoles] = useState<string[]>([])

  const {
    nodes,
    edges,
    setNodes,
    onNodesChange,
    onEdgesChange,
    initializeSimulation,
    handleNodeDragStart,
    handleNodeDrag,
    handleNodeDragStop,
  } = useSkillPhysics(selectedNode?.id || null)

  const { visibleNodesData, visibleEdgesData, expandAll, collapseAll, expandPathToSkill } =
    useDrillDownGraph(skills, edgesList, availableRoles, selectedNode?.id || null)

  const nodeTypes = useMemo(() => ({ skillNode: SkillNodeComponent }), [])

  // Update simulation when visible nodes/edges change in drill-down mode
  useEffect(() => {
    if (visibleNodesData.length > 0) {
      initializeSimulation(visibleNodesData, visibleEdgesData)
    }
  }, [visibleNodesData, visibleEdgesData])

  // ── Data Fetching ──────────────────────────────────────────────────────────

  const loadGraph = async () => {
    try {
      const graph = await getSkillGraph()
      setSkills(graph.nodes)
      setEdgesList(graph.edges)
      const roles = await getDistinctCanonicalRoles()
      setAvailableRoles(roles)
    } catch (err) {
      toast.error('Lỗi tải sơ đồ kỹ năng: ' + getErrorMessage(err))
    }
  }

  const loadPendingData = async () => {
    try {
      const pSkills = await getPendingSkills()
      setPendingSkills(pSkills)
      const pRels = await getPendingRelationships()
      setPendingRels(pRels)
    } catch (err) {
      toast.error('Lỗi tải dữ liệu kiểm duyệt: ' + getErrorMessage(err))
    }
  }

  useEffect(() => {
    loadGraph()
    loadPendingData()
  }, [])

  // ── Graph Handlers ─────────────────────────────────────────────────────────

  const handleNodeClick = (_: any, node: Node) => {
    // Toggle deselect: If clicking the currently selected node again, clear selection to exit focus mode
    if (selectedNode?.id === node.id) {
      setSelectedNode(null)
      return
    }

    if (node.id.startsWith('role:')) {
      const canonicalRole = node.id.replace('role:', '')
      setSelectedNode({
        id: node.id,
        name: canonicalRole,
        description: `Vai trò ${canonicalRole}`,
        roles: [canonicalRole],
        isVerified: true,
      } as any)
      return
    }
    const skill = skills.find((s) => s.id === node.id)
    if (skill) setSelectedNode(skill)
  }

  const handleUpdateSkill = async (description: string, roles: string[]) => {
    if (!selectedNode) return
    try {
      const updated = await updateSkill(selectedNode.id, { description, roles })
      toast.success('Đã cập nhật kỹ năng thành công!')
      setSkills((prev) => prev.map((s) => (s.id === selectedNode.id ? updated : s)))
      setNodes((prev) =>
        prev.map((n) => (n.id === selectedNode.id ? { ...n, data: updated as any } : n))
      )
      setSelectedNode(updated)
    } catch (err) {
      toast.error('Cập nhật thất bại: ' + getErrorMessage(err))
    }
  }

  const handleDeleteSkill = async (id: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa kỹ năng này và toàn bộ liên kết của nó không?')) return
    try {
      await deleteSkill(id)
      toast.success('Đã xóa kỹ năng thành công!')
      setSelectedNode(null)
      loadGraph()
    } catch (err) {
      toast.error('Xóa kỹ năng thất bại: ' + getErrorMessage(err))
    }
  }

  const handleAddSkill = async (name: string, description: string, roles: string[]) => {
    try {
      await createSkill({ name, description, roles })
      toast.success(`Đã thêm kỹ năng '${name}' thành công!`)
      loadGraph()
    } catch (err) {
      toast.error('Thêm kỹ năng thất bại: ' + getErrorMessage(err))
    }
  }

  const handleAddRelationship = async (targetId: string, type: 'PARENT_OF' | 'RELATED_TO') => {
    if (!selectedNode || !targetId) return
    try {
      if (type === 'RELATED_TO') {
        await addRelatedSkill(selectedNode.id, targetId)
      } else {
        await addParentChild(selectedNode.id, targetId)
      }
      toast.success('Thêm mối quan hệ thành công!')
      loadGraph()
    } catch (err) {
      toast.error('Không thể tạo quan hệ: ' + getErrorMessage(err))
    }
  }

  const handleDeleteRel = async (targetId: string, type: 'PARENT_OF' | 'RELATED_TO') => {
    if (!selectedNode) return
    try {
      await deleteRelationship(selectedNode.id, targetId, type)
      toast.success('Đã xóa mối quan hệ!')
      loadGraph()
    } catch (err) {
      toast.error('Xóa quan hệ thất bại: ' + getErrorMessage(err))
    }
  }

  // ── Review Tab Handlers ────────────────────────────────────────────────────

  const handleApproveSkill = async (id: string) => {
    try {
      await approveSkill(id)
      toast.success('Đã duyệt kỹ năng!')
      loadPendingData()
      loadGraph()
    } catch (err) {
      toast.error('Duyệt kỹ năng thất bại: ' + getErrorMessage(err))
    }
  }

  const handleApproveAllSkills = async () => {
    try {
      await approveAllSkills()
      toast.success('Đã duyệt tất cả kỹ năng thành công!')
      loadPendingData()
      loadGraph()
    } catch (err) {
      toast.error('Duyệt tất cả kỹ năng thất bại: ' + getErrorMessage(err))
    }
  }

  const handleRejectSkill = async (id: string) => {
    if (!confirm('Bạn có muốn loại bỏ và xóa kỹ năng này không?')) return
    try {
      await rejectSkill(id)
      toast.success('Đã loại bỏ kỹ năng!')
      loadPendingData()
      loadGraph()
    } catch (err) {
      toast.error('Không thể từ chối: ' + getErrorMessage(err))
    }
  }

  const handleApproveRel = async (sourceId: string, targetId: string, type: string) => {
    try {
      await approveRelationship(sourceId, targetId, type)
      toast.success('Đã duyệt mối quan hệ!')
      loadPendingData()
      loadGraph()
    } catch (err) {
      toast.error('Duyệt quan hệ thất bại: ' + getErrorMessage(err))
    }
  }

  const handleApproveAllRelationships = async () => {
    try {
      await approveAllPendingRelationships()
      toast.success('Đã duyệt tất cả mối quan hệ thành công!')
      loadPendingData()
      loadGraph()
    } catch (err) {
      toast.error('Duyệt tất cả quan hệ thất bại: ' + getErrorMessage(err))
    }
  }

  const handleRejectRel = async (sourceId: string, targetId: string, type: string) => {
    try {
      await rejectRelationship(sourceId, targetId, type)
      toast.success('Đã từ chối mối quan hệ!')
      loadPendingData()
      loadGraph()
    } catch (err) {
      toast.error('Từ chối quan hệ thất bại: ' + getErrorMessage(err))
    }
  }

  // ── Computed ───────────────────────────────────────────────────────────────

  const currentNodeRels = useMemo(
    () => (selectedNode ? edgesList.filter((e) => e.sourceId === selectedNode.id) : []),
    [selectedNode, edgesList]
  )

  const tabs = [
    { id: SkillTab.GRAPH, label: 'Bản đồ Đồ thị', icon: Network },
    {
      id: SkillTab.PENDING_SKILLS,
      label: `Duyệt Kỹ năng`,
      icon: UserCheck,
    },
    { id: SkillTab.PENDING_RELS, label: `Duyệt Liên kết`, icon: GitBranch },
    { id: SkillTab.ROLE_ALIAS, label: 'Quản lý Vai trò (Role Alias)', icon: GitMerge },
  ]

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div
      className="flex flex-col h-[calc(100vh-4rem)] p-6 bg-slate-50 overflow-hidden"
      id="skills-admin-page"
    >
      <Toaster position="top-right" richColors />

      {/* Header Tabs */}
      <div className="flex items-center justify-between mb-4 shrink-0">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-violet-600 text-white rounded-xl shadow-md shadow-violet-500/20">
            <Workflow className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-800 tracking-tight">
              Quản lý Đồ thị Kỹ năng
            </h1>
            <p className="text-xs text-slate-500 font-medium">
              Kiểm duyệt, chỉnh sửa và trực quan hóa cây mối quan hệ kỹ năng
            </p>
          </div>
        </div>

        {/* Tab switcher buttons */}
        <div className="flex bg-slate-200/60 p-1 rounded-xl gap-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-bold rounded-lg transition-all ${
                activeTab === tab.id
                  ? 'bg-white text-violet-600 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
              {tab.id === SkillTab.PENDING_SKILLS && pendingSkills.length > 0 && (
                <span className="ml-1 px-2 py-0.5 text-xs font-black bg-amber-500 text-white rounded-full">
                  {pendingSkills.length}
                </span>
              )}
              {tab.id === SkillTab.PENDING_RELS && pendingRels.length > 0 && (
                <span className="ml-1 px-2 py-0.5 text-xs font-black bg-violet-500 text-white rounded-full">
                  {pendingRels.length}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Tab: Graph View */}
      {activeTab === SkillTab.GRAPH && (
        <SkillGraphView
          nodes={nodes}
          edges={edges}
          skills={skills}
          edgesList={edgesList}
          selectedNode={selectedNode}
          isAddOpen={isAddOpen}
          availableRoles={availableRoles}
          nodeTypes={nodeTypes}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onNodeClick={handleNodeClick}
          onNodeDragStart={handleNodeDragStart}
          onNodeDrag={handleNodeDrag}
          onNodeDragStop={handleNodeDragStop}
          onOpenAdd={() => setIsAddOpen(true)}
          onCloseAdd={() => setIsAddOpen(false)}
          onAddSkill={handleAddSkill}
          onClosePanel={() => setSelectedNode(null)}
          onUpdateSkill={handleUpdateSkill}
          onDeleteSkill={handleDeleteSkill}
          onAddRel={handleAddRelationship}
          onDeleteRel={handleDeleteRel}
          currentNodeRels={currentNodeRels}
          onExpandAll={expandAll}
          onCollapseAll={collapseAll}
          onExpandPathToSkill={expandPathToSkill}
        />
      )}

      {/* Tab: Pending Skills */}
      {activeTab === SkillTab.PENDING_SKILLS && (
        <PendingSkillsTab
          pendingSkills={pendingSkills}
          onApprove={handleApproveSkill}
          onApproveAll={handleApproveAllSkills}
          onReject={handleRejectSkill}
        />
      )}

      {/* Tab: Pending Relations */}
      {activeTab === SkillTab.PENDING_RELS && (
        <PendingRelationsTab
          pendingRels={pendingRels}
          onApprove={handleApproveRel}
          onApproveAll={handleApproveAllRelationships}
          onReject={handleRejectRel}
        />
      )}

      {/* Tab: Role Aliases */}
      {activeTab === SkillTab.ROLE_ALIAS && (
        <RoleAliasesTab skills={skills} onGraphUpdate={loadGraph} />
      )}
    </div>
  )
}
