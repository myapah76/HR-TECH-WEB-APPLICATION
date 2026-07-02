import { useMutation, useQueryClient } from '@tanstack/react-query'
import {
  approveCompany,
  rejectCompany,
  deleteCompanyForAdmin,
  restoreCompany,
} from '@/src/services/admin-company.service'

export const useApproveCompany = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => approveCompany(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-companies'] })
    },
  })
}

export const useRejectCompany = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => rejectCompany(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-companies'] })
    },
  })
}

export const useDeleteCompanyForAdmin = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => deleteCompanyForAdmin(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-companies'] })
    },
  })
}

export const useRestoreCompany = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => restoreCompany(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-companies'] })
    },
  })
}
