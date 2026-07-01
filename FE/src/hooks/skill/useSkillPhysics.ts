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
} from '../../utils/physicsUtils'

const STORAGE_KEY = 'skill-graph-positions-v1'

export const useSkillPhysics = (selectedNodeId: string | null) => {
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([])
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([])

  const simulationRef = useRef<{
    nodes: Map<string, SimNode>
    edges: SkillEdge[]
  }>({ nodes: new Map(), edges: [] })

  const alphaRef = useRef<number>(1)
  const hasSavedRef = useRef<boolean>(false)

  const initializeSimulation = (skills: Skill[], edgesList: SkillEdge[]) => {
    alphaRef.current = 1.0
    hasSavedRef.current = false

    const savedCoords = loadSavedCoords(STORAGE_KEY)
    const simNodes = buildSimNodes(skills, simulationRef.current.nodes, savedCoords)

    simulationRef.current = { nodes: simNodes, edges: edgesList }

    setNodes(formatInitialNodes(skills, simNodes))
    setEdges(formatInitialEdges(edgesList))
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
    }
  }

  const handleNodeDrag = (event: any, node: any) => {
    alphaRef.current = 0.5
    hasSavedRef.current = false
    const simNode = simulationRef.current.nodes.get(node.id)
    if (simNode) {
      simNode.x = node.position.x
      simNode.y = node.position.y
      simNode.vx = 0
      simNode.vy = 0
      simNode.fx = node.position.x
      simNode.fy = node.position.y
    }
  }

  const handleNodeDragStop = (event: any, node: any) => {
    alphaRef.current = 0.3
    const simNode = simulationRef.current.nodes.get(node.id)
    if (simNode) {
      simNode.fx = undefined
      simNode.fy = undefined
    }
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
