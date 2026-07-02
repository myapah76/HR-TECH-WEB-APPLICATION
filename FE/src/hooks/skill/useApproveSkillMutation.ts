import { useMutation, useQueryClient } from '@tanstack/react-query'
import { approveSkill, approveAllSkills } from '@/src/services/skill.service'

export const useApproveSkillMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => approveSkill(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pendingSkills'] })
      queryClient.invalidateQueries({ queryKey: ['skillGraph'] })
      queryClient.invalidateQueries({ queryKey: ['skills'] })
    },
  })
}

export const useApproveAllSkillsMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => approveAllSkills(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pendingSkills'] })
      queryClient.invalidateQueries({ queryKey: ['skillGraph'] })
      queryClient.invalidateQueries({ queryKey: ['skills'] })
    },
  })
}
