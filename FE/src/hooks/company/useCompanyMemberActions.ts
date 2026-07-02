import { useMutation, useQueryClient } from '@tanstack/react-query'
import {
  addCompanyMember,
  removeCompanyMember,
  AddMemberRequest,
} from '@/src/services/company.service'

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
