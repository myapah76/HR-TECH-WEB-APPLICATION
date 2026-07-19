'use client'

import React, { useState, useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useGetAllCvs } from '@/src/hooks/cv'
import { useGetSavedJobs } from '@/src/hooks/job'
import { usePremiumAiMatch } from '@/src/hooks/recommendation'
import { useSubscriptionAccess } from '@/src/hooks/subscription'
import { FeatureGate } from '@/src/components/common/FeatureGate'
import { toast } from 'sonner'
import { Sparkles, ScanSearch } from 'lucide-react'

// Import components
import { AiMatchingConfigCard } from '@/src/components/candidate/recommendation/AiMatchingConfigCard'
import { AiMatchingProgressCard } from '@/src/components/candidate/recommendation/AiMatchingProgressCard'
import { AiMatchingResultPanel } from '@/src/components/candidate/recommendation/AiMatchingResultPanel'

export default function CandidateAiMatchingPage() {
  const queryClient = useQueryClient()
  const { hasPaidPlan, isLoading: isSubLoading } = useSubscriptionAccess()
  const { data: cvs = [], isLoading: loadingCvs } = useGetAllCvs()
  const { data: savedJobs = [], isLoading: loadingJobs } = useGetSavedJobs()

  const loading = loadingCvs || loadingJobs

  // Mutations
  const calculateScoreMutation = usePremiumAiMatch()

  // State managed via React state and initialized from React Query cache
  const [selectedCvId, setSelectedCvId] = useState<string>(() => {
    return queryClient.getQueryData<string>(['aiMatching', 'selectedCvId']) || ''
  })
  const [selectedJobId, setSelectedJobId] = useState<string>(() => {
    return queryClient.getQueryData<string>(['aiMatching', 'selectedJobId']) || ''
  })
  const [matchScore, setMatchScore] = useState<any>(() => {
    return queryClient.getQueryData<any>(['aiMatching', 'matchScore']) || null
  })

  // Visual matching progress states (transient UI states)
  const [isVisualLoading, setIsVisualLoading] = useState(false)
  const [matchingProgress, setMatchingProgress] = useState(0)
  const [pendingMatchResult, setPendingMatchResult] = useState<any>(null)

  // Sync default CV on render without useEffect (similar to recommend-jobs)
  const [prevCvsLength, setPrevCvsLength] = useState(cvs.length)
  if (cvs.length !== prevCvsLength) {
    setPrevCvsLength(cvs.length)
    if (cvs.length > 0 && !selectedCvId) {
      const primaryId = cvs.find((c) => c.isPrimary)?.id || cvs[0].id
      setSelectedCvId(primaryId)
      queryClient.setQueryData(['aiMatching', 'selectedCvId'], primaryId)
    }
  }

  // Selections handlers
  const handleSelectCv = (id: string) => {
    setSelectedCvId(id)
    queryClient.setQueryData(['aiMatching', 'selectedCvId'], id)
    // Clear score if inputs change
    setMatchScore(null)
    queryClient.setQueryData(['aiMatching', 'matchScore'], null)
  }

  const handleSelectJob = (id: string) => {
    setSelectedJobId(id)
    queryClient.setQueryData(['aiMatching', 'selectedJobId'], id)
    // Clear score if inputs change
    setMatchScore(null)
    queryClient.setQueryData(['aiMatching', 'matchScore'], null)
  }

  // Drive progress bar smoothly to 100% when active
  useEffect(() => {
    let intervalId: any = null

    if (isVisualLoading) {
      intervalId = setInterval(() => {
        setMatchingProgress((prev) => {
          // If match result is available from API, accelerate to 100%
          if (pendingMatchResult) {
            if (prev >= 100) {
              clearInterval(intervalId)
              setMatchScore(pendingMatchResult)
              queryClient.setQueryData(['aiMatching', 'matchScore'], pendingMatchResult)
              setIsVisualLoading(false)
              return 100
            }
            return Math.min(prev + 5, 100)
          }

          // Otherwise, slow crawl up to 98%
          if (prev < 30) return prev + 2
          if (prev < 60) return prev + 1.5
          if (prev < 85) return prev + 1
          if (prev < 98) return prev + 0.2
          return prev
        })
      }, 100)
    }

    return () => {
      if (intervalId) clearInterval(intervalId)
    }
  }, [isVisualLoading, pendingMatchResult, queryClient])

  const handleMatch = () => {
    if (!selectedCvId || !selectedJobId) return
    
    // Reset states
    setMatchScore(null)
    queryClient.setQueryData(['aiMatching', 'matchScore'], null)
    setPendingMatchResult(null)
    setMatchingProgress(0)
    setIsVisualLoading(true)

    // Call API
    calculateScoreMutation.mutate(
      { cvId: selectedCvId, jobId: selectedJobId },
      {
        onSuccess: (score) => {
          setPendingMatchResult(score)
        },
        onError: (error) => {
          console.error('Failed to calculate match score:', error)
          toast.error('Có lỗi xảy ra khi chấm điểm bằng AI. Vui lòng thử lại.')
          setIsVisualLoading(false)
          setMatchingProgress(0)
        },
      }
    )
  }

  // Get selected CV/Job details
  const selectedCv = cvs.find((cv) => cv.id === selectedCvId)
  const selectedJob = savedJobs.find((job) => job.id === selectedJobId)

  // Format Salary
  const formatSalary = (min?: number, max?: number) => {
    if (!min && !max) return 'Thỏa thuận'
    if (min && max) return `${(min / 1000000).toFixed(0)}tr - ${(max / 1000000).toFixed(0)}tr VND`
    if (min) return `Từ ${(min / 1000000).toFixed(0)}tr VND`
    if (max) return `Đến ${(max / 1000000).toFixed(0)}tr VND`
    return 'Thỏa thuận'
  }

  // Cycle through scanning text based on progress percentage
  const getProgressStepText = (pct: number) => {
    if (pct < 25) return '🔍 [1/4] Đang đọc và phân tích cấu trúc CV của bạn...'
    if (pct < 55) return '💼 [2/4] Đang phân tích yêu cầu kỹ năng từ tin tuyển dụng...'
    if (pct < 85) return '🧠 [3/4] Đang đối khớp kỹ năng bằng Graph Database & Vector Search...'
    return '✍️ [4/4] AI đang biên soạn báo cáo chi tiết và gợi ý lộ trình học tập...'
  }

  const handleResetFilters = () => {
    setSelectedCvId('')
    queryClient.setQueryData(['aiMatching', 'selectedCvId'], '')
    setSelectedJobId('')
    queryClient.setQueryData(['aiMatching', 'selectedJobId'], '')
    setMatchScore(null)
    queryClient.setQueryData(['aiMatching', 'matchScore'], null)
  }

  if (isSubLoading || loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
        <p className="text-slate-500 font-medium animate-pulse">Đang tải dữ liệu và phân tích gói dịch vụ...</p>
      </div>
    )
  }

  // Render the core page content
  const featureBody = (
    <div className="space-y-8 animate-fade-in">
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between border-b border-slate-100 pb-5 gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-bold rounded-full uppercase tracking-wider flex items-center gap-1 shadow-sm">
              <Sparkles className="w-3.5 h-3.5" /> AI Premium Feature
            </span>
          </div>
          <h1 className="text-3xl font-black text-slate-800 mt-2 tracking-tight">Trí Tuệ Nhân Tạo: AI Matching</h1>
          <p className="text-slate-500 text-sm mt-1">
            Đánh giá mức độ phù hợp về kỹ năng và kinh nghiệm giữa hồ sơ CV của bạn với vị trí công việc đã lưu.
          </p>
        </div>
        {matchScore && (
          <button
            onClick={handleResetFilters}
            className="px-4 py-2 border border-blue-200 text-blue-700 hover:bg-blue-50/50 font-bold rounded-xl text-sm transition-all self-start md:self-center"
          >
            Làm mới bộ lọc
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* LEFT COLUMN: CONFIGURATION */}
        <div className="lg:col-span-5">
          <AiMatchingConfigCard
            cvs={cvs}
            savedJobs={savedJobs}
            selectedCvId={selectedCvId}
            setSelectedCvId={handleSelectCv}
            selectedJobId={selectedJobId}
            setSelectedJobId={handleSelectJob}
            handleMatch={handleMatch}
            isPending={isVisualLoading}
            selectedCv={selectedCv}
            selectedJob={selectedJob}
            formatSalary={formatSalary}
          />
        </div>

        {/* RIGHT COLUMN: MATCHING / RESULTS */}
        <div className="lg:col-span-7">
          {/* 1. INITIAL PLACEHOLDER STATE */}
          {!matchScore && !isVisualLoading && (
            <div className="h-full min-h-[450px] border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50/50 flex flex-col items-center justify-center p-8 text-center animate-fade-in">
              <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 shadow-inner mb-4 relative animate-pulse">
                <Sparkles className="w-8 h-8" />
                <div className="absolute inset-0 rounded-full border border-blue-200 animate-ping opacity-75"></div>
              </div>
              <h3 className="font-extrabold text-slate-800 text-lg">Chưa có kết quả phân tích</h3>
              <p className="text-slate-400 text-sm mt-2 max-w-sm">
                Hãy lựa chọn một trong những CV của bạn cùng tin tuyển dụng muốn ứng tuyển ở cột bên trái, sau đó nhấn nút <strong className="text-blue-600">Chấm điểm bằng AI</strong> để khám phá.
              </p>
            </div>
          )}

          {/* 2. PREMIUM SCANNING / RADAR ANIMATION */}
          {isVisualLoading && (
            <AiMatchingProgressCard
              progress={matchingProgress}
              getProgressText={getProgressStepText}
            />
          )}

          {/* 3. COMPLETED MATCH RESULT */}
          {matchScore && !isVisualLoading && (
            <AiMatchingResultPanel matchScore={matchScore} />
          )}
        </div>
      </div>
    </div>
  )

  return (
    <div className="space-y-8 animate-fade-in max-w-7xl mx-auto">
      {/* Feature gate: show upgrade prompt for free users wrapped in standard template */}
      {!isSubLoading && !hasPaidPlan ? (
        <FeatureGate
          featureName="Chấm điểm Phù hợp (AI Matching)"
          featureDescription="So sánh CV của bạn với các công việc đã lưu, phân tích điểm tương thích kỹ năng sâu, đề xuất lộ trình và nhận tư vấn chi tiết từ mô hình ngôn ngữ lớn (LLM)."
          showPreview={true}
          icon={<ScanSearch className="w-10 h-10 text-white" />}
          theme="candidate"
        >
          {featureBody}
        </FeatureGate>
      ) : (
        featureBody
      )}
    </div>
  )
}
