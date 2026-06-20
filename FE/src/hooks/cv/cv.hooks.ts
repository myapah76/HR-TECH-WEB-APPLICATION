import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getAllCvs,
  getCvDetail,
  uploadCv,
  setPrimaryCv,
  deleteCv,
  updateCvTitle,
} from '@/src/services/cv.service'

export const useGetAllCvs = (enabled = true) => {
  return useQuery({
    queryKey: ['cvs'],
    queryFn: getAllCvs,
    enabled,
    refetchInterval: (query) => {
      const cvs = query.state?.data || []
      const hasPending = cvs.some(cv => cv.extractionStatus === 'PENDING' || cv.extractionStatus === 'PROCESSING')
      return hasPending ? 3000 : false
    }
  })
}

export const useGetCvDetail = (cvId: string, enabled = true) => {
  return useQuery({
    queryKey: ['cvs', cvId],
    queryFn: () => getCvDetail(cvId),
    enabled,
  })
}

export const useUploadCv = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ file, title }: { file: File; title: string }) => uploadCv(file, title),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cvs'] })
    },
  })
}

export const useSetPrimaryCv = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: setPrimaryCv,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cvs'] })
    },
  })
}

export const useDeleteCv = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: deleteCv,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cvs'] })
    },
  })
}

export const useUpdateCvTitle = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, title }: { id: string; title: string }) => updateCvTitle(id, title),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cvs'] })
    },
  })
}
