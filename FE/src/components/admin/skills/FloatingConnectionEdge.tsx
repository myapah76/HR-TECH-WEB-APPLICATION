import React from 'react'
import { useInternalNode, getEdgeCenter, EdgeLabelRenderer, type EdgeProps } from '@xyflow/react'

const FloatingConnectionEdge = ({
  id,
  source,
  target,
  style,
  markerEnd,
  label,
  labelStyle,
  labelBgStyle,
  labelBgPadding,
}: EdgeProps) => {
  const sourceNode = useInternalNode(source)
  const targetNode = useInternalNode(target)

  if (!sourceNode || !targetNode) {
    return null
  }

  // Get measured dimensions or default to 96 (width/height of w-24 h-24 node)
  const sourceWidth = sourceNode.measured?.width ?? 96
  const sourceHeight = sourceNode.measured?.height ?? 96
  const targetWidth = targetNode.measured?.width ?? 96
  const targetHeight = targetNode.measured?.height ?? 96

  // Absolute center coords of nodes
  const sx = sourceNode.internals.positionAbsolute.x + sourceWidth / 2
  const sy = sourceNode.internals.positionAbsolute.y + sourceHeight / 2
  const tx = targetNode.internals.positionAbsolute.x + targetWidth / 2
  const ty = targetNode.internals.positionAbsolute.y + targetHeight / 2

  const dx = tx - sx
  const dy = ty - sy
  const dist = Math.sqrt(dx * dx + dy * dy)

  if (dist === 0) return null

  // Circle radius (since nodes are perfect circles, radius is width / 2)
  const sourceRadius = sourceWidth / 2
  const targetRadius = targetWidth / 2

  // Intersect points with the node border
  const sourceX = sx + (dx / dist) * sourceRadius
  const sourceY = sy + (dy / dist) * sourceRadius
  const targetX = tx - (dx / dist) * targetRadius
  const targetY = ty - (dy / dist) * targetRadius

  const path = `M${sourceX},${sourceY} L${targetX},${targetY}`

  // Center of the custom edge for label rendering
  const [centerX, centerY] = getEdgeCenter({
    sourceX,
    sourceY,
    targetX,
    targetY,
  })

  return (
    <>
      <path
        id={id}
        className="react-flow__edge-path"
        d={path}
        style={style}
        markerEnd={markerEnd}
      />
      {label && (
        <EdgeLabelRenderer>
          <div
            style={{
              position: 'absolute',
              transform: `translate(-50%, -50%) translate(${centerX}px,${centerY}px)`,
              pointerEvents: 'all',
            }}
            className="nodrag nopan"
          >
            <span
              style={{
                ...labelStyle,
                background: labelBgStyle?.fill ?? '#ffffff',
                padding: labelBgPadding ? `${labelBgPadding[0]}px ${labelBgPadding[1]}px` : '3px 6px',
                borderRadius: '6px',
                border: '1px solid #f1f5f9',
                boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
                display: 'inline-block',
                whiteSpace: 'nowrap',
                userSelect: 'none',
              }}
            >
              {label}
            </span>
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  )
}

export default React.memo(FloatingConnectionEdge)
