import { useMutation, useQueryClient } from '@tanstack/react-query'
import { deleteCv } from '@/src/services/cv.service'

export const useDeleteCv = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: deleteCv,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cvs'] })
    },
  })
}
