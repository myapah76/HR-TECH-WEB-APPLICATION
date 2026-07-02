'use client'

import { useRef, useEffect } from 'react'
import { useNodesState, useEdgesState, Node, Edge } from '@xyflow/react'
import { Skill, SkillEdge } from '@/src/types/skill'
import {
  savePositionsToStorage,
  loadSavedCoords,
  buildSimNodes,
  formatInitialNodes,
  formatInitialEdges,
  applyPhysicsTick,
  updateNodesStyle,
  updateEdgesStyle,
  updateNodesFromSimulation,
  SimNode,
} from './physicsUtils'

const STORAGE_KEY = 'drilldown-graph-positions-v2'

export const useSkillPhysics = (selectedNodeId: string | null) => {
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([])
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([])

  const simulationRef = useRef<{
    nodes: Map<string, SimNode>
    edges: SkillEdge[]
  }>({ nodes: new Map(), edges: [] })

  const alphaRef = useRef<number>(1)
  const hasSavedRef = useRef<boolean>(false)

  const initializeSimulation = (inputNodes: any[], inputEdges: any[]) => {
    alphaRef.current = 0.3
    hasSavedRef.current = false

    const savedCoords = loadSavedCoords(STORAGE_KEY)
    const isFlowNodes =
      inputNodes.length > 0 &&
      typeof inputNodes[0] === 'object' &&
      'data' in inputNodes[0] &&
      'position' in inputNodes[0]

    let flowNodes: Node[] = []
    let flowEdges: Edge[] = []
    let simEdges: SkillEdge[] = []

    if (isFlowNodes) {
      flowNodes = inputNodes
      flowEdges = inputEdges
      simEdges = inputEdges.map((e) => ({
        sourceId: e.source,
        targetId: e.target,
        type: e.data?.type || (e.label === 'PARENT_OF' ? 'PARENT_OF' : 'RELATED_TO'),
        status: e.data?.status || 'APPROVED',
      }))
    } else {
      const simNodesMap = buildSimNodes(inputNodes as Skill[], simulationRef.current.nodes, savedCoords)
      flowNodes = formatInitialNodes(inputNodes as Skill[], simNodesMap)
      flowEdges = formatInitialEdges(inputEdges as SkillEdge[])
      simEdges = inputEdges
    }

    const simNodes = new Map<string, SimNode>()
    flowNodes.forEach((node, i) => {
      const existing = simulationRef.current.nodes.get(node.id)
      if (existing) {
        simNodes.set(node.id, {
          ...existing,
          vx: existing.vx * 0.2,
          vy: existing.vy * 0.2,
        })
        return
      }

      // For role nodes, always use their radial layout coordinates and anchor them firmly
      if (node.id.startsWith('role:')) {
        const rx = node.position?.x ?? 0
        const ry = node.position?.y ?? 0
        simNodes.set(node.id, {
          id: node.id,
          x: rx,
          y: ry,
          vx: 0,
          vy: 0,
          fx: rx,
          fy: ry,
        })
        return
      }

      const saved = savedCoords[node.id]
      if (saved) {
        simNodes.set(node.id, {
          id: node.id,
          x: saved.x,
          y: saved.y,
          vx: 0,
          vy: 0,
        })
        return
      }

      const posX = node.position?.x ?? (i % 5) * 120
      const posY = node.position?.y ?? Math.floor(i / 5) * 120
      simNodes.set(node.id, {
        id: node.id,
        x: posX,
        y: posY,
        vx: 0,
        vy: 0,
      })
    })

    simulationRef.current = { nodes: simNodes, edges: simEdges }

    const positionedNodes = flowNodes.map((node) => {
      const simN = simNodes.get(node.id)
      return {
        ...node,
        position: {
          x: simN ? simN.x : node.position.x,
          y: simN ? simN.y : node.position.y,
        },
      }
    })

    const neighborIds = new Set<string>()
    if (selectedNodeId) {
      neighborIds.add(selectedNodeId)
      simEdges.forEach((e) => {
        if (e.sourceId === selectedNodeId) neighborIds.add(e.targetId)
        if (e.targetId === selectedNodeId) neighborIds.add(e.sourceId)
      })
    }

    const styledNodes = updateNodesStyle(positionedNodes, selectedNodeId, neighborIds)
    const styledEdges = updateEdgesStyle(flowEdges, selectedNodeId)

    setNodes(styledNodes)
    setEdges(styledEdges)
  }

  // Update styling (highlight/dim) whenever selectedNodeId changes
  useEffect(() => {
    if (nodes.length === 0) return

    const neighborIds = new Set<string>()
    if (selectedNodeId) {
      neighborIds.add(selectedNodeId)
      simulationRef.current.edges.forEach((e) => {
        if (e.sourceId === selectedNodeId) neighborIds.add(e.targetId)
        if (e.targetId === selectedNodeId) neighborIds.add(e.sourceId)
      })
      alphaRef.current = 0.4
    }

    setNodes((nds) => updateNodesStyle(nds, selectedNodeId, neighborIds))
    setEdges((eds) => updateEdgesStyle(eds, selectedNodeId))
  }, [selectedNodeId])

  // Physics animation tick loop
  useEffect(() => {
    let animationFrameId: number

    const tick = () => {
      if (alphaRef.current < 0.005) {
        if (!hasSavedRef.current) {
          hasSavedRef.current = true
          savePositionsToStorage(STORAGE_KEY, simulationRef.current.nodes)
        }
        animationFrameId = requestAnimationFrame(tick)
        return
      }

      alphaRef.current *= 0.98

      const { nodes: simNodes, edges: simEdges } = simulationRef.current
      if (simNodes.size === 0) {
        animationFrameId = requestAnimationFrame(tick)
        return
      }

      applyPhysicsTick(simNodes, simEdges, alphaRef.current)

      // Update React Flow nodes state
      setNodes((currentNodes) => updateNodesFromSimulation(currentNodes, simNodes))

      animationFrameId = requestAnimationFrame(tick)
    }

    animationFrameId = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(animationFrameId)
  }, [setNodes])

  // Drag handlers
  const handleNodeDragStart = (event: any, node: any) => {
    alphaRef.current = 0.5
    hasSavedRef.current = false
    const simNode = simulationRef.current.nodes.get(node.id)
    if (simNode) {
      simNode.fx = node.position.x
      simNode.fy = node.position.y
      simNode.x = node.position.x
      simNode.y = node.position.y
    }
  }

  const handleNodeDrag = (event: any, node: any) => {
    alphaRef.current = 0.5
    hasSavedRef.current = false
    const simNode = simulationRef.current.nodes.get(node.id)

    if (simNode) {
      simNode.x = node.position.x
      simNode.y = node.position.y
      simNode.fx = node.position.x
      simNode.fy = node.position.y
      simNode.vx = 0
      simNode.vy = 0
    }
  }

  const handleNodeDragStop = (event: any, node: any) => {
    alphaRef.current = 0 // Instantly stop physics simulation tick
    const simNode = simulationRef.current.nodes.get(node.id)
    if (simNode) {
      simNode.fx = node.position.x
      simNode.fy = node.position.y
      simNode.x = node.position.x
      simNode.y = node.position.y
    }

    // Zero out velocity on all nodes to freeze canvas instantly
    simulationRef.current.nodes.forEach((n) => {
      n.vx = 0
      n.vy = 0
    })

    savePositionsToStorage(STORAGE_KEY, simulationRef.current.nodes)
  }

  return {
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
    simulationRef,
  }
}
