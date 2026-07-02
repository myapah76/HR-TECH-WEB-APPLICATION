import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getSystemConfig, updateSystemConfig } from '@/src/services/system.service'
import { SystemConfigRequest } from '@/src/types/system'

export const useGetSystemConfig = () => {
  return useQuery({
    queryKey: ['systemConfig'],
    queryFn: getSystemConfig,
  })
}

export const useUpdateSystemConfig = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: SystemConfigRequest) => updateSystemConfig(data),
    onSuccess: (data) => {
      queryClient.setQueryData(['systemConfig'], data)
    },
  })
}
