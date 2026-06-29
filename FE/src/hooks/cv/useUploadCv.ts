import { useMutation, useQueryClient } from '@tanstack/react-query'
import { uploadCv } from '@/src/services/cv.service'
import { uploadToCloudinary } from '@/src/utils'

export const useUploadCv = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ file, title }: { file: File; title: string }) => {
      const url = await uploadToCloudinary(file, 'hrtech/cvs')
      return uploadCv({
        fileUrl: url,
        title,
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cvs'] })
    },
  })
}
