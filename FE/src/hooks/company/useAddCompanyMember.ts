import { useMutation, useQueryClient } from '@tanstack/react-query'
import { addCompanyMember } from '@/src/services/company.service'
import type { AddMemberRequest } from '@/src/types/company'

export const useAddCompanyMember = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ companyId, request }: { companyId: string; request: AddMemberRequest }) =>
      addCompanyMember(companyId, request),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['companyMembers', variables.companyId] })
    },
  })
}
