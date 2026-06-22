import { useMutation, useQueryClient } from '@tanstack/react-query'
import { uploadCv } from '@/src/services/cv.service'

export const useUploadCv = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ file, title }: { file: File; title: string }) => uploadCv(file, title),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cvs'] })
    },
  })
}
