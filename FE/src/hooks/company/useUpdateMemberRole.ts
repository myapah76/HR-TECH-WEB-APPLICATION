import { useMutation, useQueryClient } from '@tanstack/react-query'
import { updateMemberRole } from '@/src/services/company.service'

export const useUpdateMemberRole = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      companyId,
      memberId,
      role,
    }: {
      companyId: string
      memberId: string
      role: string
    }) => updateMemberRole(companyId, memberId, role),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['companyMembers', variables.companyId] })
    },
  })
}
