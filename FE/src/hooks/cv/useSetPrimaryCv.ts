import { useMutation, useQueryClient } from '@tanstack/react-query'
import { setPrimaryCv } from '@/src/services/cv.service'

export const useSetPrimaryCv = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: setPrimaryCv,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cvs'] })
    },
  })
}
