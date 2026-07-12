'use client'

import { useState, useMemo, useCallback } from 'react'
import { MarkerType } from '@xyflow/react'
import { Skill, SkillEdge } from '@/src/types/skill'
import { loadSavedCoords } from '@/src/utils/physicsUtils'

const STORAGE_KEY = 'drilldown-graph-positions-v2'

export function useDrillDownGraph(
  skills: Skill[],
  edgesList: SkillEdge[],
  availableRoles: string[],
  selectedNodeId: string | null
) {
  // Expanded node IDs (can contain "role:<roleName>" or skill IDs)
  const [expandedNodeIds, setExpandedNodeIds] = useState<Set<string>>(new Set())

  // Helper: Get Top-Level Skills for a Role (In-Degree = 0 rule within the role)
  const getTopLevelSkillsForRole = useCallback(
    (roleName: string): Skill[] => {
      const canonicalRole = roleName.trim().toLowerCase()
      const roleSkills = skills.filter((s) =>
        s.roles?.some((r) => r.trim().toLowerCase() === canonicalRole)
      )
      const roleSkillIds = new Set(roleSkills.map((s) => s.id))

      // Target IDs of PARENT_OF edges where both source and target belong to this role
      const childSkillIdsInRole = new Set<string>()
      edgesList.forEach((e) => {
        if (
          e.type === 'PARENT_OF' &&
          roleSkillIds.has(e.sourceId) &&
          roleSkillIds.has(e.targetId)
        ) {
          childSkillIdsInRole.add(e.targetId)
        }
      })

      // Top-level skills: skills in this role with no parent in the same role
      return roleSkills.filter((s) => !childSkillIdsInRole.has(s.id))
    },
    [skills, edgesList]
  )

  // Toggle expand/collapse of any node (Role node or Skill node)
  const toggleExpand = useCallback((id: string) => {
    setExpandedNodeIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }, [])

  // Collapse all to Root Level
  const collapseAll = useCallback(() => {
    setExpandedNodeIds(new Set())
  }, [])

  // Expand all nodes
  const expandAll = useCallback(() => {
    const allIds = new Set<string>()
    availableRoles.forEach((r) => allIds.add(`role:${r.toLowerCase()}`))
    skills.forEach((s) => allIds.add(s.id))
    setExpandedNodeIds(allIds)
  }, [availableRoles, skills])

  // Automatically expand path to target skill ID (for Search auto-focus)
  const expandPathToSkill = useCallback(
    (targetSkillId: string) => {
      const targetSkill = skills.find((s) => s.id === targetSkillId)
      if (!targetSkill) return

      const newExpanded = new Set(expandedNodeIds)

      // 1. Expand target skill's roles
      targetSkill.roles?.forEach((r) => {
        newExpanded.add(`role:${r.trim().toLowerCase()}`)
      })

      // 2. Traversal up to find parent skill IDs
      const visited = new Set<string>()
      const queue = [targetSkillId]

      while (queue.length > 0) {
        const currentId = queue.shift()!
        if (visited.has(currentId)) continue
        visited.add(currentId)

        // Find all incoming edges (parents / related)
        edgesList.forEach((e) => {
          if (e.targetId === currentId) {
            newExpanded.add(e.sourceId)
            queue.push(e.sourceId)
          }
        })
      }

      setExpandedNodeIds(newExpanded)
    },
    [skills, edgesList, expandedNodeIds]
  )

  // Compute visible nodes & edges
  const { visibleNodesData, visibleEdgesData } = useMemo(() => {
    const visibleSkillIds = new Set<string>()
    const visibleRoleNames = new Set<string>()

    // 1. All Role Nodes are visible at Level 0
    availableRoles.forEach((r) => visibleRoleNames.add(r.trim().toLowerCase()))

    // 2. Identify visible skill IDs by role context
    availableRoles.forEach((r) => {
      const canonicalRole = r.trim().toLowerCase()
      const roleNodeId = `role:${canonicalRole}`
      if (expandedNodeIds.has(roleNodeId)) {
        const topSkills = getTopLevelSkillsForRole(canonicalRole)
        const visibleInThisRole = new Set<string>()
        topSkills.forEach((s) => visibleInThisRole.add(s.id))

        // Expand downstream skills within this role context
        let changed = true
        while (changed) {
          changed = false
          edgesList.forEach((e) => {
            if (visibleInThisRole.has(e.sourceId) && expandedNodeIds.has(e.sourceId)) {
              if (!visibleInThisRole.has(e.targetId)) {
                // Check if target skill belongs to this role context
                const targetSkill = skills.find((s) => s.id === e.targetId)
                const hasCurrentRole = targetSkill?.roles?.some(
                  (tr) => tr.trim().toLowerCase() === canonicalRole
                )
                if (hasCurrentRole) {
                  visibleInThisRole.add(e.targetId)
                  changed = true
                }
              }
            }
          })
        }

        // Merge into global visible set
        visibleInThisRole.forEach((id) => visibleSkillIds.add(id))
      }
    })

    // Always include selected node
    if (selectedNodeId) {
      visibleSkillIds.add(selectedNodeId)
    }

    // 3. Construct Role Nodes & Skill Nodes with Dynamic Radial Orbit Layout
    const nodes: any[] = []
    const nodePosMap = new Map<string, { x: number; y: number }>()

    const totalRoles = availableRoles.length || 1
    const roleRadius = 650
    const savedCoords = loadSavedCoords(STORAGE_KEY)

    // A. Position Level 0 Role Nodes
    availableRoles.forEach((r, idx) => {
      const canonicalRole = r.trim().toLowerCase()
      const roleNodeId = `role:${canonicalRole}`
      const isExpanded = expandedNodeIds.has(roleNodeId)
      const roleSkills = skills.filter((s) =>
        s.roles?.some((ro) => ro.trim().toLowerCase() === canonicalRole)
      )

      // Radial angle calculation for default role placement
      const angle = (idx / totalRoles) * 2 * Math.PI - Math.PI / 2
      const defaultRx = Math.cos(angle) * roleRadius
      const defaultRy = Math.sin(angle) * roleRadius

      const rx = savedCoords[roleNodeId]?.x ?? defaultRx
      const ry = savedCoords[roleNodeId]?.y ?? defaultRy
      nodePosMap.set(roleNodeId, { x: rx, y: ry })

      nodes.push({
        id: roleNodeId,
        type: 'roleNode',
        position: { x: rx, y: ry },
        data: {
          label: r,
          roleName: canonicalRole,
          skillCount: roleSkills.length,
          isExpanded,
          onToggleExpand: () => toggleExpand(roleNodeId),
        },
      })
    })

    // B. Position Level 1 Top-Level Skills around Expanded Role Nodes
    availableRoles.forEach((r) => {
      const canonicalRole = r.trim().toLowerCase()
      const roleNodeId = `role:${canonicalRole}`

      if (expandedNodeIds.has(roleNodeId)) {
        const rolePos = nodePosMap.get(roleNodeId) || { x: 0, y: 0 }
        const topSkills = getTopLevelSkillsForRole(canonicalRole)
        const N = topSkills.length

        if (N > 0) {
          // Dynamic radius proportional to number of child skills to avoid overlap
          const orbitRadius = Math.max(320, N * 45)

          topSkills.forEach((s, idx) => {
            if (visibleSkillIds.has(s.id) && !nodePosMap.has(s.id)) {
              const angle = (idx / N) * 2 * Math.PI - Math.PI / 2
              const defaultSx = rolePos.x + Math.cos(angle) * orbitRadius
              const defaultSy = rolePos.y + Math.sin(angle) * orbitRadius

              const sx = savedCoords[s.id]?.x ?? defaultSx
              const sy = savedCoords[s.id]?.y ?? defaultSy
              nodePosMap.set(s.id, { x: sx, y: sy })
            }
          })
        }
      }
    })

    // C. Position Downstream Skill Nodes in Orbit Circles around Expanded Skill Parents
    let posChanged = true
    while (posChanged) {
      posChanged = false
      edgesList.forEach((e) => {
        if (visibleSkillIds.has(e.sourceId) && expandedNodeIds.has(e.sourceId)) {
          // Find all visible target children for this expanded source parent
          const children = edgesList
            .filter((edge) => edge.sourceId === e.sourceId && visibleSkillIds.has(edge.targetId))
            .map((edge) => edge.targetId)

          const M = children.length
          const parentPos = nodePosMap.get(e.sourceId) || { x: 0, y: 0 }
          const orbitRadius = Math.max(260, M * 40)

          children.forEach((targetId, idx) => {
            if (!nodePosMap.has(targetId)) {
              const angle = (idx / (M || 1)) * 2 * Math.PI - Math.PI / 2
              const defaultCx = parentPos.x + Math.cos(angle) * orbitRadius
              const defaultCy = parentPos.y + Math.sin(angle) * orbitRadius

              const cx = savedCoords[targetId]?.x ?? defaultCx
              const cy = savedCoords[targetId]?.y ?? defaultCy
              nodePosMap.set(targetId, { x: cx, y: cy })
              posChanged = true
            }
          })
        }
      })
    }

    // D. Build Skill Nodes with calculated orbit positions
    skills.forEach((s) => {
      if (visibleSkillIds.has(s.id)) {
        const isExpanded = expandedNodeIds.has(s.id)
        const childEdges = edgesList.filter((e) => e.sourceId === s.id)
        const hasExpandableChildren = childEdges.some((e) => !visibleSkillIds.has(e.targetId))

        const pos = nodePosMap.get(s.id) || savedCoords[s.id] || { x: 0, y: 0 }

        nodes.push({
          id: s.id,
          type: 'skillNode',
          position: pos,
          data: {
            ...s,
            isExpanded,
            hasExpandableChildren,
            onToggleExpand: () => toggleExpand(s.id),
          },
        })
      }
    })

    // 4. Construct Visible Edges
    const edges: any[] = []

    // A. Virtual Edges from Role Node to Top-Level Skills
    availableRoles.forEach((r) => {
      const canonicalRole = r.trim().toLowerCase()
      const roleNodeId = `role:${canonicalRole}`
      if (expandedNodeIds.has(roleNodeId)) {
        const topSkills = getTopLevelSkillsForRole(canonicalRole)
        topSkills.forEach((s) => {
          if (visibleSkillIds.has(s.id)) {
            edges.push({
              id: `v-edge-${roleNodeId}-${s.id}`,
              source: roleNodeId,
              target: s.id,
              type: 'floating',
              label: 'PARENT_OF',
              labelStyle: {
                fontSize: 9,
                fontWeight: 700,
                fill: '#7c3aed',
                letterSpacing: '0.04em',
              },
              labelBgStyle: {
                fill: '#ffffff',
                fillOpacity: 0.85,
                rx: 4,
                ry: 4,
              },
              labelBgPadding: [3, 6] as [number, number],
              style: { stroke: '#8b5cf6', strokeWidth: 2, strokeDasharray: '4 4' },
              markerEnd: {
                type: MarkerType.ArrowClosed,
                color: '#8b5cf6',
                width: 15,
                height: 15,
              },
              animated: true,
              data: { type: 'PARENT_OF', status: 'APPROVED' },
            })
          }
        })
      }
    })

    // B. Real Graph Edges between visible Skill Nodes
    edgesList.forEach((e) => {
      if (visibleSkillIds.has(e.sourceId) && visibleSkillIds.has(e.targetId)) {
        const isParentOf = e.type === 'PARENT_OF'
        const isPending = e.status === 'PENDING'
        edges.push({
          id: `e-${e.sourceId}-${e.targetId}-${e.type}`,
          source: e.sourceId,
          target: e.targetId,
          type: 'floating',
          label: isParentOf ? 'PARENT_OF' : 'RELATED_TO',
          labelStyle: {
            fontSize: 9,
            fontWeight: 700,
            fill: isParentOf ? '#7c3aed' : '#64748b',
            letterSpacing: '0.04em',
          },
          labelBgStyle: {
            fill: '#ffffff',
            fillOpacity: 0.85,
            rx: 4,
            ry: 4,
          },
          labelBgPadding: [3, 6] as [number, number],
          style: {
            stroke: isParentOf ? '#8b5cf6' : '#94a3b8',
            strokeWidth: 2,
            strokeDasharray: isPending ? '5,5' : undefined,
          },
          markerEnd: isParentOf
            ? {
                type: MarkerType.ArrowClosed,
                color: '#8b5cf6',
                width: 15,
                height: 15,
              }
            : undefined,
          animated: isPending,
          data: { type: e.type, status: e.status },
        })
      }
    })

    return { visibleNodesData: nodes, visibleEdgesData: edges }
  }, [
    availableRoles,
    skills,
    edgesList,
    expandedNodeIds,
    selectedNodeId,
    getTopLevelSkillsForRole,
    toggleExpand,
  ])

  return {
    expandedNodeIds,
    visibleNodesData,
    visibleEdgesData,
    toggleExpand,
    collapseAll,
    expandAll,
    expandPathToSkill,
  }
}
