'use client'

import React, { useState, useRef, useEffect } from 'react'
import {
  useGetAllCvs,
  useUploadCv,
  useSetPrimaryCv,
  useDeleteCv,
  useUpdateCvTitle,
  useGetCvDetail,
} from '@/src/hooks/cv'
import { useGetSavedJobs } from '@/src/hooks/job'
import { usePremiumAiMatch } from '@/src/hooks/recommendation'
import { AiMatchHistoryResponse } from '@/src/types/recommendation'
import { toast } from 'sonner'
import { getErrorMessage } from '@/src/utils/get-error-message'

// Import components
import { CvUploadCard } from '@/src/components/candidate/cv/CvUploadCard'
import { CvJobMatchCard } from '@/src/components/candidate/cv/CvJobMatchCard'
import { CvListCard } from '@/src/components/candidate/cv/CvListCard'
import { CvDetailModal } from '@/src/components/candidate/cv/CvDetailModal'

export default function CandidateCvPage() {
  const { data: cvs = [], isLoading: loadingCvs } = useGetAllCvs()
  const { data: savedJobs = [], isLoading: loadingJobs } = useGetSavedJobs()

  const loading = loadingCvs || loadingJobs

  // Mutations
  const uploadCvMutation = useUploadCv()
  const setPrimaryCvMutation = useSetPrimaryCv()
  const deleteCvMutation = useDeleteCv()
  const updateCvTitleMutation = useUpdateCvTitle()
  const calculateScoreMutation = usePremiumAiMatch()

  // Upload state
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [cvTitle, setCvTitle] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Matching state
  const [selectedCvId, setSelectedCvId] = useState<string>(() => {
    if (typeof window !== 'undefined') return sessionStorage.getItem('match_selectedCvId') || ''
    return ''
  })
  const [selectedJobId, setSelectedJobId] = useState<string>(() => {
    if (typeof window !== 'undefined') return sessionStorage.getItem('match_selectedJobId') || ''
    return ''
  })
  const [matchScore, setMatchScore] = useState<AiMatchHistoryResponse | null>(() => {
    if (typeof window !== 'undefined') {
      const saved = sessionStorage.getItem('match_matchScore')
      if (saved) {
        try {
          return JSON.parse(saved)
        } catch (e) {
          return null
        }
      }
    }
    return null
  })

  // Persist matching state
  useEffect(() => {
    sessionStorage.setItem('match_selectedCvId', selectedCvId)
  }, [selectedCvId])

  useEffect(() => {
    sessionStorage.setItem('match_selectedJobId', selectedJobId)
  }, [selectedJobId])

  useEffect(() => {
    if (matchScore) {
      sessionStorage.setItem('match_matchScore', JSON.stringify(matchScore))
    } else {
      sessionStorage.removeItem('match_matchScore')
    }
  }, [matchScore])

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
          toast.error(getErrorMessage(error))
        },
      }
    )
  }

  const handleSetPrimary = (id: string) => {
    setPrimaryCvMutation.mutate(id)
  }

  const handleDelete = (id: string) => {
    if (confirm('Bạn có chắc chắn muốn xóa CV này không?')) {
      deleteCvMutation.mutate(id, {
        onError: (error) => {
          toast.error(getErrorMessage(error))
        },
      })
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
          alert('Lỗi cập nhật tên CV')
        },
      }
    )
  }

  const handleViewCv = (id: string) => {
    setViewCvId(id)
  }

  const handleMatch = () => {
    if (!selectedCvId || !selectedJobId) return
    calculateScoreMutation.mutate(
      { cvId: selectedCvId, jobId: selectedJobId },
      {
        onSuccess: (score) => setMatchScore(score),
        onError: (error) => console.error('Failed to calculate match score:', error),
      }
    )
  }

  if (loading) {
    return <div className="p-8 text-center text-slate-500 font-medium">Đang tải dữ liệu...</div>
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-black tracking-tight text-blue-900">
          Quản lý Hồ sơ & Phân tích AI
        </h1>
        <p className="text-slate-500 font-medium">
          Tải lên CV của bạn, chọn CV làm mặc định và chấm điểm mức độ phù hợp với các công việc đã
          lưu bằng công nghệ AI.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-8">
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

          {/* AI MATCHING SECTION */}
          <CvJobMatchCard
            cvs={cvs}
            savedJobs={savedJobs}
            selectedCvId={selectedCvId}
            setSelectedCvId={setSelectedCvId}
            selectedJobId={selectedJobId}
            setSelectedJobId={setSelectedJobId}
            handleMatch={handleMatch}
            isPending={calculateScoreMutation.isPending}
            matchScore={matchScore}
          />
        </div>

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
