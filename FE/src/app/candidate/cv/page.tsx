'use client'

import React, { useState, useRef } from 'react'
import {
  useGetAllCvs,
  useUploadCv,
  useSetPrimaryCv,
  useDeleteCv,
  useUpdateCvTitle,
  useGetCvDetail,
} from '@/src/hooks/cv'
import { toast } from 'sonner'
import { isCvAlreadyExistsError } from '@/src/utils'

// Import components
import { CvUploadCard } from '@/src/components/candidate/cv/CvUploadCard'
import { CvListCard } from '@/src/components/candidate/cv/CvListCard'
import { CvDetailModal } from '@/src/components/candidate/cv/CvDetailModal'

export default function CandidateCvPage() {
  const { data: cvs = [], isLoading: loadingCvs } = useGetAllCvs()

  // Mutations
  const uploadCvMutation = useUploadCv()
  const setPrimaryCvMutation = useSetPrimaryCv()
  const deleteCvMutation = useDeleteCv()
  const updateCvTitleMutation = useUpdateCvTitle()

  // Upload state
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [cvTitle, setCvTitle] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Edit & View state
  const [editingCvId, setEditingCvId] = useState<string | null>(null)
  const [editTitle, setEditTitle] = useState('')
  const [viewCvId, setViewCvId] = useState<string | null>(null)
  const { data: viewCv, isFetching: loadingDetail } = useGetCvDetail(viewCvId || '', !!viewCvId)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0])
      if (!cvTitle) {
        setCvTitle(e.target.files[0].name.replace('.pdf', ''))
      }
    }
  }

  const handleUpload = () => {
    if (!selectedFile || !cvTitle) return
    uploadCvMutation.mutate(
      { file: selectedFile, title: cvTitle },
      {
        onSuccess: () => {
          setSelectedFile(null)
          setCvTitle('')
          if (fileInputRef.current) fileInputRef.current.value = ''
          toast.success(
            'Tải CV lên thành công! Hệ thống đang phân tích kỹ năng, vui lòng đợi trong giây lát.',
            { duration: 5000 }
          )
        },
        onError: (error) => {
          if (isCvAlreadyExistsError(error)) {
            toast.warning('Hồ sơ này đã được tải lên trước đó.')
            setSelectedFile(null)
            setCvTitle('')
            if (fileInputRef.current) fileInputRef.current.value = ''
            return
          }
        },
      }
    )
  }

  const handleSetPrimary = (id: string) => {
    setPrimaryCvMutation.mutate(id)
  }

  const handleDelete = (id: string) => {
    if (confirm('Bạn có chắc chắn muốn xóa CV này không?')) {
      deleteCvMutation.mutate(id)
    }
  }

  const handleUpdateTitle = (id: string, oldTitle: string) => {
    if (!editTitle.trim() || editTitle.trim() === oldTitle) {
      setEditingCvId(null)
      return
    }
    updateCvTitleMutation.mutate(
      { id, title: editTitle },
      {
        onSuccess: () => setEditingCvId(null),
        onError: (error) => {
          console.error('Failed to update title', error)
        },
      }
    )
  }

  const handleViewCv = (id: string) => {
    setViewCvId(id)
  }

  if (loadingCvs) {
    return <div className="p-8 text-center text-slate-500 font-medium">Đang tải dữ liệu...</div>
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* UPLOAD SECTION WITH SCANNING ANIMATION */}
        <CvUploadCard
          cvTitle={cvTitle}
          setCvTitle={setCvTitle}
          selectedFile={selectedFile}
          fileInputRef={fileInputRef}
          handleFileChange={handleFileChange}
          handleUpload={handleUpload}
          isPending={uploadCvMutation.isPending}
        />

        {/* CV LIST SECTION */}
        <CvListCard
          cvs={cvs}
          editingCvId={editingCvId}
          setEditingCvId={setEditingCvId}
          editTitle={editTitle}
          setEditTitle={setEditTitle}
          handleUpdateTitle={handleUpdateTitle}
          handleViewCv={handleViewCv}
          handleSetPrimary={handleSetPrimary}
          handleDelete={handleDelete}
        />
      </div>

      <style
        dangerouslySetInnerHTML={{
          __html: `
        @keyframes scan {
          0% { top: 0%; opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { top: 100%; opacity: 0; }
        }
      `,
        }}
      />

      {/* CV Detail Modal */}
      <CvDetailModal
        viewCv={viewCv || null}
        loadingDetail={loadingDetail}
        setViewCvId={setViewCvId}
      />
    </div>
  )
}
