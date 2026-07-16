import { useMutation, useQueryClient } from '@tanstack/react-query'
import { reactivateCompanyMember } from '@/src/services/company.service'

export const useReactivateCompanyMember = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      companyId,
      memberId,
      resetPassword,
    }: {
      companyId: string;
      memberId: string;
      resetPassword: boolean;
    }) => reactivateCompanyMember(companyId, memberId, resetPassword),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['companyMembers', variables.companyId] })
    },
  })
}
