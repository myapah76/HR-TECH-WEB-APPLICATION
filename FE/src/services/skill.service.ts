import { api } from '@/src/lib/axios'
import { ApiResponse } from '@/src/types/api'

import { Skill } from '@/src/types/skill'

export const searchSkills = async (keyword: string): Promise<Skill[]> => {
  const response = await api.get<ApiResponse<Skill[]>>(`/skills/search`, {
    params: { keyword },
  })
  return response.data.data
}
