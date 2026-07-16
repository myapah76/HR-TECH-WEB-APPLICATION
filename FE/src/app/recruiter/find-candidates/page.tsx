'use client'

import React, { useState, useMemo } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { Brain } from 'lucide-react'
import { useSubscriptionAccess } from '@/src/hooks/subscription'
import { useGetMyCompany } from '@/src/hooks/company'
import { useGetManageJobs } from '@/src/hooks/job'
import { useRecommendCandidatesForJob } from '@/src/hooks/recommendation'
import { FeatureGate } from '@/src/components/common/FeatureGate'
import { CandidateMatchConfigCard } from '@/src/components/recruiter/candidate-finder/CandidateMatchConfigCard'
import { CandidateMatchResultList } from '@/src/components/recruiter/candidate-finder/CandidateMatchResultList'
import { CandidateDetailModal } from '@/src/components/recruiter/candidate-finder/CandidateDetailModal'
import { CandidateFinderProgressCard } from '@/src/components/recruiter/candidate-finder/CandidateFinderProgressCard'
import { CandidateRecommendationResponse } from '@/src/types/recommendation'

export default function FindCandidatesPage() {
  const queryClient = useQueryClient()
  const { subscription, isLoading: isSubLoading } = useSubscriptionAccess()

  const hasRecommendCandidateFeature = useMemo(() => {
    if (isSubLoading) return true
    if (!subscription || subscription.status !== 'ACTIVE') return false
    return subscription.featuresUsage?.some(f => f.featureCode === 'RECOMMEND_CANDIDATE') ?? false
  }, [subscription, isSubLoading])

  const { data: myCompany } = useGetMyCompany()
  const companyId = myCompany?.id

  // Fetch company jobs – always cached by TanStack Query
  const { data: jobsPage, isLoading: loadingJobs } = useGetManageJobs(
    companyId,
    { page: 0, size: 100 }
  )

  // UI state - Restore from cache if available
  const [selectedJobId, setSelectedJobId] = useState<string>(() => {
    const cached = queryClient.getQueriesData({ queryKey: ['recommendCandidates'] })
    const valid = cached.find(([, data]) => data !== undefined)
    return valid ? (valid[0][1] as string) : ''
  })
  const [isSearchEnabled, setIsSearchEnabled] = useState<boolean>(() => {
    const cached = queryClient.getQueriesData({ queryKey: ['recommendCandidates'] })
    return cached.some(([, data]) => data !== undefined)
  })
  const [isVisualFinding, setIsVisualFinding] = useState(false)
  const [selectedCandidate, setSelectedCandidate] = useState<CandidateRecommendationResponse | null>(null)


  // Derived: active jobs (useMemo – no useEffect)
  const jobs = useMemo(
    () =>
      (jobsPage?.content ?? []).map((j: any) => ({
        id: j.id,
        title: j.title,
        status: j.status,
      })),
    [jobsPage]
  )

  // Fetch candidates – controlled by isSearchEnabled flag (no auto-fetch on mount)
  const {
    data: candidates = [],
    isLoading: isFinding,
    isError,
  } = useRecommendCandidatesForJob(selectedJobId, isSearchEnabled)

  // Using React Query's cache instead of sessionStorage


  // Derived: show results when search was triggered and data arrived
  const isDone = useMemo(
    () => isSearchEnabled && !isFinding && candidates.length >= 0,
    [isSearchEnabled, isFinding, candidates.length]
  )

  const handleFind = () => {
    if (!selectedJobId) return
    setIsSearchEnabled(true)
    setIsVisualFinding(true)
  }

  const handleReset = () => {
    // Invalidate cache for this specific search so next search refetches fresh
    queryClient.removeQueries({ queryKey: ['recommendCandidates', selectedJobId] })
    setIsSearchEnabled(false)
    setIsVisualFinding(false)
    setSelectedCandidate(null)
  }


  const featureBody = (
    <div className="space-y-8">
      {isVisualFinding ? (
        <CandidateFinderProgressCard
          isFinding={isFinding}
          onComplete={() => setIsVisualFinding(false)}
        />
      ) : !isDone ? (
        /* Config & loading state */

        <div className="max-w-xl mx-auto">
          <CandidateMatchConfigCard
            jobs={jobs}
            loadingJobs={loadingJobs}
            selectedJobId={selectedJobId}
            setSelectedJobId={(id) => {
              setSelectedJobId(id)
              // Reset previous result when job changes
              if (isSearchEnabled) {
                queryClient.removeQueries({ queryKey: ['recommendCandidates', selectedJobId] })
                setIsSearchEnabled(false)
                setIsVisualFinding(false)
              }
            }}

            onFind={handleFind}
            isFinding={isFinding}
          />
          {isError && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700 font-medium text-center">
              Có lỗi xảy ra khi tìm kiếm. Vui lòng thử lại.
            </div>
          )}
        </div>
      ) : (
        /* Results (fallback direct path) */
        <CandidateMatchResultList
          candidates={candidates}
          onSelectCandidate={setSelectedCandidate}
          onReset={handleReset}
        />
      )}

      {/* Candidate detail modal */}
      <CandidateDetailModal
        candidate={selectedCandidate}
        onClose={() => setSelectedCandidate(null)}
      />
    </div>
  )

  return (
    <div className="space-y-8 animate-fade-in font-sans" id="find-candidates-page">
      {/* Page header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/25">
          <Brain className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-black text-slate-900">AI Tìm Ứng Viên</h1>
          <p className="text-sm text-slate-500">
            Gợi ý ứng viên phù hợp nhất dựa trên kỹ năng Job Posting của bạn
          </p>
        </div>
      </div>

      {/* Feature gate */}
      {!isSubLoading && !hasRecommendCandidateFeature ? (
        <FeatureGate
          featureName="AI Tìm Ứng Viên"
          featureDescription="Tính năng phân tích kỹ năng và gợi ý ứng viên phù hợp sử dụng Graph AI. Nâng cấp gói doanh nghiệp của bạn để mở khóa tính năng này."
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
