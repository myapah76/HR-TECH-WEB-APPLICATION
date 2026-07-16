import { useMutation, useQueryClient } from '@tanstack/react-query'
import { deleteCompanyForAdmin } from '@/src/services/admin-company.service'

export const useDeleteCompanyForAdmin = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => deleteCompanyForAdmin(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-companies'] })
    },
  })
}
