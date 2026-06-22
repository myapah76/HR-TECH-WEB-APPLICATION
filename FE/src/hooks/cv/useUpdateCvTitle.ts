import { useMutation, useQueryClient } from '@tanstack/react-query'
import { updateCvTitle } from '@/src/services/cv.service'

export const useUpdateCvTitle = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, title }: { id: string; title: string }) => updateCvTitle(id, title),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cvs'] })
    },
  })
}
