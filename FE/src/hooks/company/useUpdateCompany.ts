import { useMutation, useQueryClient } from '@tanstack/react-query'
import { updateCompany } from '@/src/services/company.service'
import type { CompanyUpdateRequest } from '@/src/types/company'

export const useUpdateCompany = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, request }: { id: string; request: CompanyUpdateRequest }) =>
      updateCompany(id, request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myCompany'] })
    },
  })
}
