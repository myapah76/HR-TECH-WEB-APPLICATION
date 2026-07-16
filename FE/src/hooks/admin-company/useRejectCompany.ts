import { useMutation, useQueryClient } from '@tanstack/react-query'
import { rejectCompany } from '@/src/services/admin-company.service'

export const useRejectCompany = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => rejectCompany(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-companies'] })
    },
  })
}
