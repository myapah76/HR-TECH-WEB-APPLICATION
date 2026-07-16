export interface Skill {
  id: string
  name: string
  description?: string
  isVerified?: boolean
  createdAt?: string
  roles?: string[]
}

export interface SkillEdge {
  sourceId: string
  targetId: string
  type: 'PARENT_OF' | 'RELATED_TO'
  status: 'PENDING' | 'APPROVED'
}

export interface SkillGraph {
  nodes: Skill[]
  edges: SkillEdge[]
}

export interface PendingRelationship {
  sourceSkillId: string
  sourceSkillName: string
  targetSkillId: string
  targetSkillName: string
  relationshipType: 'PARENT_OF' | 'RELATED_TO'
}

export interface TrendingSkill {
  name: string
  jobCount: number
}

export interface RoleAlias {
  id: string
  alias: string
  canonicalRole: string
}

