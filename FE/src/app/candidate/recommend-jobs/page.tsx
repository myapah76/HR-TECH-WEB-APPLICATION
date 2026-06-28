'use client'

import React, { useState, useEffect, useRef } from 'react'
import { useGetAllCvs, useUploadCv } from '@/src/hooks/cv'
import {
  useStartJobMatching,
  useGetJobMatchingStatus,
} from '@/src/hooks/recommendation'
import { JobMatchingTaskResponse } from '@/src/types/recommendation'
import { JobMatchingStatus } from '@/src/enums/recommendation.enum'
import { Star } from 'lucide-react'
import { useSubscriptionAccess } from '@/src/hooks/subscription'
import { FeatureGate } from '@/src/components/common/FeatureGate'

// Import newly refactored components
import { JobMatchConfigCard } from '@/src/components/candidate/recommendation/JobMatchConfigCard'
import { JobMatchProgressCard } from '@/src/components/candidate/recommendation/JobMatchProgressCard'
import { JobMatchResultList } from '@/src/components/candidate/recommendation/JobMatchResultList'


export default function RecommendJobsPage() {
  const { hasPaidPlan, isLoading: isSubLoading } = useSubscriptionAccess()
  const { data: cvs = [], isLoading: loadingCvs } = useGetAllCvs()

  const uploadCvMutation = useUploadCv()
  const startJobMatchingMutation = useStartJobMatching()

  // Input states
  const [cvMode, setCvMode] = useState<'existing' | 'new'>(() => {
    if (typeof window !== 'undefined') {
      const saved = sessionStorage.getItem('rec_cvMode')
      if (saved === 'existing' || saved === 'new') return saved
    }
    return 'existing'
  })
  const [selectedCvId, setSelectedCvId] = useState<string>(() => {
    if (typeof window !== 'undefined') return sessionStorage.getItem('rec_selectedCvId') || ''
    return ''
  })
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [cvTitle, setCvTitle] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Process states
  const [isStarting, setIsStarting] = useState(false)
  const [taskId, setTaskId] = useState<string | null>(() => {
    if (typeof window !== 'undefined') return sessionStorage.getItem('rec_taskId')
    return null
  })

  const { data: polledStatus } = useGetJobMatchingStatus(taskId, !!taskId)

  const [taskStatus, setTaskStatus] = useState<JobMatchingTaskResponse | null>(() => {
    if (typeof window !== 'undefined') {
      const saved = sessionStorage.getItem('rec_taskStatus')
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

  // Persist states
  useEffect(() => {
    sessionStorage.setItem('rec_cvMode', cvMode)
  }, [cvMode])

  useEffect(() => {
    if (selectedCvId) {
      sessionStorage.setItem('rec_selectedCvId', selectedCvId)
    }
  }, [selectedCvId])

  useEffect(() => {
    if (taskId) {
      sessionStorage.setItem('rec_taskId', taskId)
    } else {
      sessionStorage.removeItem('rec_taskId')
    }
  }, [taskId])

  useEffect(() => {
    if (taskStatus) {
      sessionStorage.setItem('rec_taskStatus', JSON.stringify(taskStatus))
    } else {
      sessionStorage.removeItem('rec_taskStatus')
    }
  }, [taskStatus])

  // Update status from polling
  useEffect(() => {
    if (polledStatus) {
      setTaskStatus(polledStatus)
    }
  }, [polledStatus])

  useEffect(() => {
    if (cvs.length > 0 && !selectedCvId) {
      setSelectedCvId(cvs.find((c) => c.isPrimary)?.id || cvs[0].id)
    } else if (cvs.length === 0 && !loadingCvs) {
      setCvMode('new')
    }
  }, [cvs, loadingCvs, selectedCvId])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0])
      if (!cvTitle) {
        setCvTitle(e.target.files[0].name.replace('.pdf', ''))
      }
    }
  }

  const handleStartProcess = () => {
    if (cvMode === 'new') {
      if (!selectedFile || !cvTitle) {
        alert('Vui lòng chọn file và nhập tên CV')
        return
      }
      setIsStarting(true)
      uploadCvMutation.mutate(
        { file: selectedFile, title: cvTitle },
        {
          onSuccess: (newCv) => {
            triggerJobMatching(newCv.id)
            setSelectedFile(null)
            setCvTitle('')
            if (fileInputRef.current) fileInputRef.current.value = ''
          },
          onError: (error) => {
            console.error('Failed to upload new CV', error)
            alert('Lỗi khi tải lên CV mới')
            setIsStarting(false)
          },
        }
      )
    } else {
      if (!selectedCvId) {
        alert('Không tìm thấy ID CV hợp lệ')
        return
      }
      triggerJobMatching(selectedCvId)
    }
  }

  const triggerJobMatching = (id: string) => {
    setIsStarting(true)
    startJobMatchingMutation.mutate(id, {
      onSuccess: ({ taskId: newTaskId }) => {
        setTaskId(newTaskId)
        setTaskStatus({
          taskId: newTaskId,
          status: JobMatchingStatus.PENDING,
          message: 'Đang khởi tạo tiến trình AI...',
          progressPercentage: 5,
          recommendedJobs: null,
        })
      },
      onError: (error) => {
        console.error('Failed to start job matching:', error)
        alert('Có lỗi xảy ra khi bắt đầu tiến trình AI')
      },
      onSettled: () => {
        setIsStarting(false)
      },
    })
  }

  const isProcessActive = !!(taskId && taskStatus && taskStatus.status !== JobMatchingStatus.DONE)
  const isDone = taskStatus?.status === JobMatchingStatus.DONE

  const handleReset = () => {
    setTaskId(null)
    setTaskStatus(null)
  }

  // The gated feature body (forms, results)
  const featureBody = (
    <>
      {isDone && taskStatus?.recommendedJobs ? (
        /* RESULT UI */
        <JobMatchResultList
          recommendedJobs={taskStatus.recommendedJobs}
          onReset={handleReset}
        />
      ) : (
        /* UPLOAD & MOCKUP UI */
        <div
          className={`grid grid-cols-1 ${isProcessActive ? 'lg:grid-cols-2' : ''} gap-8 items-start transition-all duration-700`}
        >
          {/* Left: Form */}
          <JobMatchConfigCard
            cvMode={cvMode}
            setCvMode={setCvMode}
            loadingCvs={loadingCvs}
            cvs={cvs}
            selectedCvId={selectedCvId}
            setSelectedCvId={setSelectedCvId}
            cvTitle={cvTitle}
            setCvTitle={setCvTitle}
            selectedFile={selectedFile}
            fileInputRef={fileInputRef}
            handleFileChange={handleFileChange}
            handleStartProcess={handleStartProcess}
            isStarting={isStarting}
            isProcessActive={isProcessActive}
          />

          {/* Right: Visual Mockup */}
          <JobMatchProgressCard
            isProcessActive={isProcessActive}
            taskStatus={taskStatus}
          />
        </div>
      )}

      <style
        dangerouslySetInnerHTML={{
          __html: `
        @keyframes scanner {
          0% { top: 0%; }
          100% { top: 100%; }
        }
        .animate-scanner {
          animation: scanner 2s ease-in-out infinite alternate;
        }
      `,
        }}
      />
    </>
  )

  return (
    <div className="space-y-8 animate-fade-in max-w-6xl mx-auto">
      {/* Page header – always visible */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-3">
          <Star className="w-8 h-8 text-blue-600" />
          <h1 className="text-3xl font-black tracking-tight text-slate-900">
            AI Cố vấn: Gợi ý Việc làm
          </h1>
        </div>
        <p className="text-slate-500 font-medium">
          Sử dụng công nghệ Graph &amp; LLM để tìm kiếm và đề xuất những công việc phù hợp nhất với kỹ
          năng trong CV của bạn.
        </p>
      </div>

      {/* Feature gate: show upgrade prompt for free users */}
      {!isSubLoading && !hasPaidPlan ? (
        <FeatureGate
          featureName="AI Gợi ý Việc làm"
          featureDescription="Tính năng phân tích CV và gợi ý việc làm phù hợp sử dụng công nghệ Graph AI & LLM. Nâng cấp gói để nhận những gợi ý chính xác nhất cho sự nghiệp của bạn."
          showPreview={false}
        >
          {featureBody}
        </FeatureGate>
      ) : (
        featureBody
      )}
    </div>
  )
}

