'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { Node } from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import { Network, UserCheck, GitBranch, GitMerge, Workflow } from 'lucide-react'
import { toast, Toaster } from 'sonner'

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
  rejectSkill,
  getPendingRelationships,
  approveRelationship,
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
import { useSkillPhysics } from '@/src/hooks/skill'

export default function AdminSkillsDashboard() {
  const [activeTab, setActiveTab] = useState<SkillTab>(SkillTab.GRAPH)
  const [selectedNode, setSelectedNode] = useState<Skill | null>(null)

  const {
    nodes,
    edges,
    setNodes,
    setEdges,
    onNodesChange,
    onEdgesChange,
    initializeSimulation,
    handleNodeDragStart,
    handleNodeDrag,
    handleNodeDragStop,
  } = useSkillPhysics(selectedNode?.id || null)

  const [skills, setSkills] = useState<Skill[]>([])
  const [edgesList, setEdgesList] = useState<SkillEdge[]>([])
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [pendingSkills, setPendingSkills] = useState<Skill[]>([])
  const [pendingRels, setPendingRels] = useState<PendingRelationship[]>([])
  const [availableRoles, setAvailableRoles] = useState<string[]>([])

  const nodeTypes = useMemo(() => ({ skillNode: SkillNodeComponent }), [])

  // ── Data Fetching ──────────────────────────────────────────────────────────

  const loadGraph = async () => {
    try {
      const graph = await getSkillGraph()
      setSkills(graph.nodes)
      setEdgesList(graph.edges)
      initializeSimulation(graph.nodes, graph.edges)
      const roles = await getDistinctCanonicalRoles()
      setAvailableRoles(roles)
    } catch (err: any) {
      toast.error('Lỗi tải sơ đồ kỹ năng: ' + err.message)
    }
  }

  const loadPendingData = async () => {
    try {
      const pSkills = await getPendingSkills()
      setPendingSkills(pSkills)
      const pRels = await getPendingRelationships()
      setPendingRels(pRels)
    } catch (err: any) {
      toast.error('Lỗi tải dữ liệu kiểm duyệt: ' + err.message)
    }
  }

  useEffect(() => {
    loadGraph()
    loadPendingData()
  }, [])

  // ── Graph Handlers ─────────────────────────────────────────────────────────

  const handleNodeClick = (_: any, node: Node) => {
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
    } catch (err: any) {
      toast.error('Cập nhật thất bại: ' + err.message)
    }
  }

  const handleDeleteSkill = async (id: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa kỹ năng này và toàn bộ liên kết của nó không?')) return
    try {
      await deleteSkill(id)
      toast.success('Đã xóa kỹ năng thành công!')
      setSelectedNode(null)
      loadGraph()
    } catch (err: any) {
      toast.error('Xóa kỹ năng thất bại: ' + err.message)
    }
  }

  const handleAddSkill = async (name: string, description: string, roles: string[]) => {
    try {
      await createSkill({ name, description, roles })
      toast.success(`Đã thêm kỹ năng '${name}' thành công!`)
      loadGraph()
    } catch (err: any) {
      toast.error('Thêm kỹ năng thất bại: ' + err.message)
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
    } catch (err: any) {
      toast.error('Không thể tạo quan hệ: ' + err.message)
    }
  }

  const handleDeleteRel = async (targetId: string, type: 'PARENT_OF' | 'RELATED_TO') => {
    if (!selectedNode) return
    try {
      await deleteRelationship(selectedNode.id, targetId, type)
      toast.success('Đã xóa mối quan hệ!')
      loadGraph()
    } catch (err: any) {
      toast.error('Xóa quan hệ thất bại: ' + err.message)
    }
  }

  // ── Review Tab Handlers ────────────────────────────────────────────────────

  const handleApproveSkill = async (id: string) => {
    try {
      await approveSkill(id)
      toast.success('Đã duyệt kỹ năng!')
      loadPendingData()
      loadGraph()
    } catch (err: any) {
      toast.error('Duyệt kỹ năng thất bại: ' + err.message)
    }
  }

  const handleRejectSkill = async (id: string) => {
    if (!confirm('Bạn có muốn loại bỏ và xóa kỹ năng này không?')) return
    try {
      await rejectSkill(id)
      toast.success('Đã loại bỏ kỹ năng!')
      loadPendingData()
      loadGraph()
    } catch (err: any) {
      toast.error('Không thể từ chối: ' + err.message)
    }
  }

  const handleApproveRel = async (sourceId: string, targetId: string, type: string) => {
    try {
      await approveRelationship(sourceId, targetId, type)
      toast.success('Đã duyệt mối quan hệ!')
      loadPendingData()
      loadGraph()
    } catch (err: any) {
      toast.error('Duyệt quan hệ thất bại: ' + err.message)
    }
  }

  const handleRejectRel = async (sourceId: string, targetId: string, type: string) => {
    try {
      await rejectRelationship(sourceId, targetId, type)
      toast.success('Đã từ chối mối quan hệ!')
      loadPendingData()
      loadGraph()
    } catch (err: any) {
      toast.error('Từ chối quan hệ thất bại: ' + err.message)
    }
  }

  // ── Computed ───────────────────────────────────────────────────────────────

  const currentNodeRels = useMemo(
    () => (selectedNode ? edgesList.filter((e) => e.sourceId === selectedNode.id) : []),
    [selectedNode, edgesList]
  )

  const tabs = [
    { id: SkillTab.GRAPH, label: 'Bản đồ Đồ thị', icon: Network },
    { id: SkillTab.PENDING_SKILLS, label: `Duyệt Kỹ năng (${pendingSkills.length})`, icon: UserCheck },
    { id: SkillTab.PENDING_RELS, label: `Duyệt Liên kết (${pendingRels.length})`, icon: GitBranch },
    { id: SkillTab.ROLE_ALIAS, label: 'Quản lý Vai trò (Role Alias)', icon: GitMerge },
  ]

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col h-[calc(100vh-120px)] w-full max-w-full px-4" id="skills-admin-page">
      <Toaster position="top-right" richColors />

      {/* Header */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
            <Workflow className="h-6 w-6 text-violet-600 animate-pulse" />
            Quản lý Sơ đồ Kỹ năng
          </h1>
          <p className="text-sm text-slate-500 font-medium mt-1">
            Đồ thị kỹ năng và luồng kiểm duyệt từ AI
          </p>
        </div>

        {/* Tab Headers */}
        <div className="flex bg-slate-100/80 p-1 rounded-xl border border-slate-200/50 self-start">
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
        />
      )}

      {/* Tab: Pending Skills */}
      {activeTab === SkillTab.PENDING_SKILLS && (
        <PendingSkillsTab
          pendingSkills={pendingSkills}
          onApprove={handleApproveSkill}
          onReject={handleRejectSkill}
        />
      )}

      {/* Tab: Pending Relations */}
      {activeTab === SkillTab.PENDING_RELS && (
        <PendingRelationsTab
          pendingRels={pendingRels}
          onApprove={handleApproveRel}
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
