import { useMutation, useQueryClient } from '@tanstack/react-query'
import { restoreCompany } from '@/src/services/admin-company.service'

export const useRestoreCompany = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => restoreCompany(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-companies'] })
    },
  })
}
