import { useMutation, useQueryClient } from '@tanstack/react-query'
import { removeCompanyMember } from '@/src/services/company.service'

export const useRemoveCompanyMember = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ companyId, memberId }: { companyId: string; memberId: string }) =>
      removeCompanyMember(companyId, memberId),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['companyMembers', variables.companyId] })
    },
  })
}
