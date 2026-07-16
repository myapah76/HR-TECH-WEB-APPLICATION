'use client'

import React, { useState, useRef, useMemo } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useGetAllCvs, useUploadCv } from '@/src/hooks/cv'
import { useStartJobMatching, useGetJobMatchingStatus } from '@/src/hooks/recommendation'
import { JobMatchingStatus } from '@/src/enums/recommendation.enum'
import { useSubscriptionAccess } from '@/src/hooks/subscription'
import { FeatureGate } from '@/src/components/common/FeatureGate'
import { toast } from 'sonner'
import { isCvAlreadyExistsError } from '@/src/utils'

// Import newly refactored components
import { JobMatchConfigCard } from '@/src/components/candidate/recommendation/JobMatchConfigCard'
import { JobMatchProgressCard } from '@/src/components/candidate/recommendation/JobMatchProgressCard'
import { JobMatchResultList } from '@/src/components/candidate/recommendation/JobMatchResultList'

export default function RecommendJobsPage() {
  const queryClient = useQueryClient()
  const { hasPaidPlan, isLoading: isSubLoading } = useSubscriptionAccess()
  const { data: cvs = [], isLoading: loadingCvs } = useGetAllCvs()

  const uploadCvMutation = useUploadCv()
  const startJobMatchingMutation = useStartJobMatching()

  // Input states
  const [cvMode, setCvMode] = useState<'existing' | 'new'>('existing')
  const [selectedCvId, setSelectedCvId] = useState<string>('')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [cvTitle, setCvTitle] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Process states
  const [isStarting, setIsStarting] = useState(false)
  const [taskId, setTaskId] = useState<string | null>(() => {
    const cached = queryClient.getQueriesData({ queryKey: ['jobMatchingStatus'] })
    const valid = cached.find(([, data]) => data !== undefined)
    return valid ? (valid[0][1] as string) : null
  })

  const { data: taskStatus } = useGetJobMatchingStatus(taskId, !!taskId)

  const [prevCvsLength, setPrevCvsLength] = useState(cvs.length)
  const [prevLoadingCvs, setPrevLoadingCvs] = useState(loadingCvs)
  if (cvs.length !== prevCvsLength || loadingCvs !== prevLoadingCvs) {
    setPrevCvsLength(cvs.length)
    setPrevLoadingCvs(loadingCvs)
    if (cvs.length > 0 && !selectedCvId) {
      setSelectedCvId(cvs.find((c) => c.isPrimary)?.id || cvs[0].id)
    } else if (cvs.length === 0 && !loadingCvs) {
      setCvMode('new')
    }
  }

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
            if (isCvAlreadyExistsError(error)) {
              const duplicateCvId = (error as any).response?.data?.data?.duplicateCvId
              if (duplicateCvId) {
                toast.success('Hồ sơ này đã được tải lên trước đó. Đang sử dụng hồ sơ hiện có để phân tích việc làm.')
                triggerJobMatching(duplicateCvId)
                setSelectedFile(null)
                setCvTitle('')
                if (fileInputRef.current) fileInputRef.current.value = ''
                return
              }
            }
            console.error('Failed to upload new CV', error)
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
        queryClient.setQueryData(['jobMatchingStatus', newTaskId], {
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

  const isProcessActive = useMemo(
    () => !!(taskId && taskStatus && taskStatus.status !== JobMatchingStatus.DONE),
    [taskId, taskStatus]
  )
  const isDone = useMemo(() => taskStatus?.status === JobMatchingStatus.DONE, [taskStatus?.status])

  const handleReset = () => {
    if (taskId) {
      queryClient.removeQueries({ queryKey: ['jobMatchingStatus', taskId] })
    }
    setTaskId(null)
  }

  // The gated feature body (forms, results)
  const featureBody = (
    <>
      {isDone && taskStatus?.recommendedJobs ? (
        /* RESULT UI */
        <JobMatchResultList recommendedJobs={taskStatus.recommendedJobs} onReset={handleReset} />
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
            taskStatus={taskStatus || null}
            onReset={handleReset}
          />

          {/* Right: Visual Mockup */}
          <JobMatchProgressCard
            isProcessActive={isProcessActive}
            taskStatus={taskStatus || null}
            onReset={handleReset}
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
    <div className="space-y-8 animate-fade-in">
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
