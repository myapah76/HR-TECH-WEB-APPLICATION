import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getSystemConfig, getPublicSystemConfig, updateSystemConfig } from '@/src/services/system.service'

export const useGetSystemConfig = () => {
  return useQuery({
    queryKey: ['systemConfig'],
    queryFn: getSystemConfig,
  })
}

export const useGetPublicSystemConfig = () => {
  return useQuery({
    queryKey: ['publicSystemConfig'],
    queryFn: getPublicSystemConfig,
  })
}

export const useUpdateSystemConfig = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: updateSystemConfig,
    onSuccess: (data) => {
      queryClient.setQueryData(['systemConfig'], data)
    },
  })
}
