import { MarkerType } from '@xyflow/react'
import { Skill, SkillEdge } from '@/src/types/skill'

export interface SimNode {
    id: string
    x: number
    y: number
    vx: number
    vy: number
    fx?: number
    fy?: number
}

// Helper to save coordinates to localStorage
export const savePositionsToStorage = (storageKey: string, nodes: Map<string, SimNode>) => {
    try {
        const coords: Record<string, { x: number; y: number }> = {}
        nodes.forEach((n, id) => {
            coords[id] = { x: n.x, y: n.y }
        })
        localStorage.setItem(storageKey, JSON.stringify(coords))
    } catch (e) {
        console.error('Failed to save skill positions', e)
    }
}

// Helper to load coordinates from localStorage
export const loadSavedCoords = (storageKey: string): Record<string, { x: number; y: number }> => {
    try {
        const saved = localStorage.getItem(storageKey)
        return saved ? JSON.parse(saved) : {}
    } catch (e) {
        return {}
    }
}

// Initialize sim nodes dictionary
export const buildSimNodes = (
    skills: Skill[],
    currentSimNodes: Map<string, SimNode>,
    savedCoords: Record<string, { x: number; y: number }>
): Map<string, SimNode> => {
    const simNodes = new Map<string, SimNode>()

    skills.forEach((node, i) => {
        // 1. Check if node already exists in memory (from hot-reloads or updates)
        const existing = currentSimNodes.get(node.id)
        if (existing) {
            simNodes.set(node.id, {
                ...existing,
                vx: existing.vx * 0.3, // Damp velocity
                vy: existing.vy * 0.3,
            })
            return
        }

        // 2. Check if node has a saved coordinate in localStorage (from F5 refresh)
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

        // 3. Fallback: Assign circular starting positions spread out widely
        const angle = (i / skills.length) * 2 * Math.PI
        const radius = 600 + Math.random() * 300
        simNodes.set(node.id, {
            id: node.id,
            x: 1200 + radius * Math.cos(angle),
            y: 800 + radius * Math.sin(angle),
            vx: 0,
            vy: 0,
        })
    })

    return simNodes
}

// Format React Flow initial nodes
export const formatInitialNodes = (skills: Skill[], simNodes: Map<string, SimNode>) => {
    return skills.map((node) => {
        const simN = simNodes.get(node.id)
        return {
            id: node.id,
            type: 'skillNode',
            data: { ...node },
            position: { x: simN ? simN.x : 1200, y: simN ? simN.y : 800 },
        }
    })
}

// Format React Flow initial edges
export const formatInitialEdges = (edgesList: SkillEdge[]) => {
    return edgesList.map((e, idx) => ({
        id: `e-${e.sourceId}-${e.targetId}-${idx}`,
        source: e.sourceId,
        target: e.targetId,
        type: 'straight',
        animated: e.status === 'PENDING',
        label: e.type === 'PARENT_OF' ? 'PARENT_OF' : 'RELATED_TO',
        labelStyle: {
            fontSize: 9,
            fontWeight: 700,
            fill: e.type === 'PARENT_OF' ? '#7c3aed' : '#64748b',
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
            stroke: e.type === 'PARENT_OF' ? '#8b5cf6' : '#94a3b8',
            strokeWidth: 2,
            strokeDasharray: e.status === 'PENDING' ? '5,5' : undefined,
        },
        markerEnd: e.type === 'PARENT_OF' ? {
            type: MarkerType.ArrowClosed,
            color: '#8b5cf6',
            width: 15,
            height: 15,
        } : undefined,
        data: { type: e.type, status: e.status }
    }))
}

// Compute a single physics tick step
export const applyPhysicsTick = (
    simNodes: Map<string, SimNode>,
    simEdges: SkillEdge[],
    alpha: number,
    k: number = 320,
    forceStrength: number = 0.02,
    cx: number = 1200,
    cy: number = 800
) => {
    const nodeList = Array.from(simNodes.entries())

    // 1. Repulsion force between all nodes (charge)
    for (let i = 0; i < nodeList.length; i++) {
        const [_, n1] = nodeList[i]
        for (let j = i + 1; j < nodeList.length; j++) {
            const [_, n2] = nodeList[j]
            const dx = n2.x - n1.x
            const dy = n2.y - n1.y
            const distSq = dx * dx + dy * dy + 0.01
            const dist = Math.sqrt(distSq)

            if (dist < 900) {
                const repulsionConstant = 320
                const force = (repulsionConstant * repulsionConstant) / distSq
                const fx = (dx / dist) * force * 0.1 * alpha
                const fy = (dy / dist) * force * 0.1 * alpha

                if (n1.fx === undefined) {
                    n1.vx -= fx
                    n1.vy -= fy
                }
                if (n2.fx === undefined) {
                    n2.vx += fx
                    n2.vy += fy
                }
            }
        }
    }

    // 2. Link Attraction along edges
    for (const edge of simEdges) {
        const source = simNodes.get(edge.sourceId)
        const target = simNodes.get(edge.targetId)
        if (source && target) {
            const dx = target.x - source.x
            const dy = target.y - source.y
            const dist = Math.sqrt(dx * dx + dy * dy) + 0.01
            const force = forceStrength * (dist - k)
            const fx = (dx / dist) * force * alpha
            const fy = (dy / dist) * force * alpha

            if (source.fx === undefined) {
                source.vx += fx
                source.vy += fy
            }
            if (target.fx === undefined) {
                target.vx -= fx
                target.vy -= fy
            }
        }
    }

    // 3. Gravity towards center and velocity friction decay
    simNodes.forEach((simNode) => {
        if (simNode.fx !== undefined && simNode.fy !== undefined) {
            simNode.x = simNode.fx
            simNode.y = simNode.fy
            simNode.vx = 0
            simNode.vy = 0
        } else {
            const dx = cx - simNode.x
            const dy = cy - simNode.y
            simNode.vx += dx * 0.0001 * alpha
            simNode.vy += dy * 0.0001 * alpha

            simNode.x += simNode.vx
            simNode.y += simNode.vy

            simNode.vx *= 0.55
            simNode.vy *= 0.55
        }
    })
}

// Update nodes opacity & styling based on selection
export const updateNodesStyle = (nds: any[], selectedNodeId: string | null, neighborIds: Set<string>) => {
    return nds.map((n) => {
        const isDimmed = selectedNodeId ? !neighborIds.has(n.id) : false
        const isCurrent = n.id === selectedNodeId
        return {
            ...n,
            data: {
                ...n.data,
                isDimmed,
                isCurrent,
            },
        }
    })
}

// Update edges opacity & styling based on selection
export const updateEdgesStyle = (eds: any[], selectedNodeId: string | null) => {
    return eds.map((e) => {
        if (!selectedNodeId) {
            const isParentOf = e.data?.type === 'PARENT_OF'
            const isPending = e.data?.status === 'PENDING'
            return {
                ...e,
                animated: isPending,
                labelStyle: {
                    fontSize: 9,
                    fontWeight: 700,
                    fill: isParentOf ? '#7c3aed' : '#64748b',
                    letterSpacing: '0.04em',
                    opacity: 1,
                },
                style: {
                    stroke: isParentOf ? '#8b5cf6' : '#94a3b8',
                    strokeWidth: 2,
                    strokeDasharray: isPending ? '5,5' : undefined,
                    opacity: 1,
                },
            }
        }

        const isConnected = e.source === selectedNodeId || e.target === selectedNodeId
        const isParentOf = e.data?.type === 'PARENT_OF'
        const isPending = e.data?.status === 'PENDING'

        return {
            ...e,
            animated: isConnected || isPending,
            labelStyle: {
                fontSize: 9,
                fontWeight: 700,
                fill: isConnected
                    ? (isParentOf ? '#7c3aed' : '#475569')
                    : (isParentOf ? '#7c3aed' : '#64748b'),
                letterSpacing: '0.04em',
                opacity: isConnected ? 1 : 0.15,
            },
            style: {
                stroke: isConnected
                    ? (isParentOf ? '#a78bfa' : '#64748b')
                    : (isParentOf ? '#8b5cf6' : '#94a3b8'),
                strokeWidth: isConnected ? 3.5 : 1,
                strokeDasharray: isPending ? '5,5' : undefined,
                opacity: isConnected ? 1 : 0.15,
            },
        }
    })
}

// Update node positions based on physics simulation coordinates
export const updateNodesFromSimulation = (currentNodes: any[], simNodes: Map<string, SimNode>) => {
    return currentNodes.map((n) => {
        const simNode = simNodes.get(n.id)
        if (simNode) {
            const dx = n.position.x - simNode.x
            const dy = n.position.y - simNode.y
            if (dx * dx + dy * dy > 0.09) {
                return {
                    ...n,
                    position: { x: simNode.x, y: simNode.y },
                }
            }
        }
        return n
    })
}

