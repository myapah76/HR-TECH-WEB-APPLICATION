import { api } from '@/src/lib/axios'
import { ApiResponse } from '@/src/types/api'
import { Skill, SkillGraph, PendingRelationship } from '@/src/types/skill'

// --- Search and Fetch ---
export const searchSkills = async (keyword: string): Promise<Skill[]> => {
  const response = await api.get<ApiResponse<Skill[]>>(`/skills/search`, {
    params: { keyword },
  })
  return response.data.data
}

export const getSkills = async (): Promise<Skill[]> => {
  const response = await api.get<ApiResponse<Skill[]>>(`/skills`)
  return response.data.data
}

export const getSkillGraph = async (): Promise<SkillGraph> => {
  const response = await api.get<ApiResponse<SkillGraph>>(`/skills/graph`)
  return response.data.data
}

// --- CRUD ---
export const createSkill = async (data: { name: string; description?: string; roles?: string[] }): Promise<Skill> => {
  const response = await api.post<ApiResponse<Skill>>(`/skills`, data)
  return response.data.data
}

export const updateSkill = async (id: string, data: { description?: string; roles?: string[] }): Promise<Skill> => {
  const response = await api.put<ApiResponse<Skill>>(`/skills/${id}`, data)
  return response.data.data
}

export const deleteSkill = async (id: string): Promise<void> => {
  await api.delete<ApiResponse<void>>(`/skills/${id}`)
}

// --- Relationships ---
export const addRelatedSkill = async (id: string, relatedId: string): Promise<void> => {
  await api.post<ApiResponse<void>>(`/skills/${id}/related/${relatedId}`)
}

export const addParentChild = async (parentId: string, childId: string): Promise<void> => {
  await api.post<ApiResponse<void>>(`/skills/${parentId}/children/${childId}`)
}

export const deleteRelationship = async (sourceId: string, targetId: string, type: 'PARENT_OF' | 'RELATED_TO'): Promise<void> => {
  await api.delete<ApiResponse<void>>(`/skills/relationships`, {
    params: { sourceId, targetId, type }
  })
}

// --- Admin Approvals ---
export const getPendingSkills = async (): Promise<Skill[]> => {
  const response = await api.get<ApiResponse<Skill[]>>(`/skills/pending`)
  return response.data.data
}

export const approveSkill = async (id: string): Promise<Skill> => {
  const response = await api.put<ApiResponse<Skill>>(`/skills/${id}/approve`)
  return response.data.data
}

export const approveAllSkills = async (): Promise<void> => {
  await api.put<ApiResponse<void>>(`/skills/approve-all`)
}

export const rejectSkill = async (id: string): Promise<void> => {
  await api.delete<ApiResponse<void>>(`/skills/${id}/reject`)
}

export const getPendingRelationships = async (): Promise<PendingRelationship[]> => {
  const response = await api.get<ApiResponse<PendingRelationship[]>>(`/skills/relationships/pending`)
  return response.data.data
}

export const approveRelationship = async (sourceId: string, targetId: string, type: string): Promise<void> => {
  await api.put<ApiResponse<void>>(`/skills/${sourceId}/relationships/${targetId}/approve`, null, {
    params: { type }
  })
}

export const approveAllPendingRelationships = async (): Promise<void> => {
  await api.put<ApiResponse<void>>(`/skills/relationships/approve-all`)
}

export const rejectRelationship = async (sourceId: string, targetId: string, type: string): Promise<void> => {
  await api.delete<ApiResponse<void>>(`/skills/${sourceId}/relationships/${targetId}/reject`, {
    params: { type }
  })
}

// --- Role Aliases ---
export interface RoleAlias {
  id: string
  alias: string
  canonicalRole: string
}

export const getRoleAliases = async (): Promise<RoleAlias[]> => {
  const response = await api.get<ApiResponse<RoleAlias[]>>(`/role-aliases`)
  return response.data.data
}

export const getDistinctCanonicalRoles = async (): Promise<string[]> => {
  const response = await api.get<ApiResponse<string[]>>(`/role-aliases/canonical`)
  return response.data.data
}

export const createRoleAlias = async (data: { alias: string; canonicalRole: string }): Promise<RoleAlias> => {
  const response = await api.post<ApiResponse<RoleAlias>>(`/role-aliases`, data)
  return response.data.data
}

export const updateRoleAlias = async (id: string, data: { alias: string; canonicalRole: string }): Promise<RoleAlias> => {
  const response = await api.put<ApiResponse<RoleAlias>>(`/role-aliases/${id}`, data)
  return response.data.data
}

export const deleteRoleAlias = async (id: string): Promise<void> => {
  await api.delete<ApiResponse<void>>(`/role-aliases/${id}`)
}

export const renameCanonicalRole = async (oldName: string, newName: string): Promise<void> => {
  await api.put<ApiResponse<void>>(`/role-aliases/canonical/${oldName}`, null, {
    params: { newName }
  })
}

export const deleteCanonicalRole = async (name: string): Promise<void> => {
  await api.delete<ApiResponse<void>>(`/role-aliases/canonical/${name}`)
}
