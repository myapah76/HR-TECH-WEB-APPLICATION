import { useMutation, useQueryClient } from '@tanstack/react-query'
import { approveCompany } from '@/src/services/admin-company.service'

export const useApproveCompany = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => approveCompany(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-companies'] })
    },
  })
}
