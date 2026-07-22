'use client'

import React, { useState, useMemo } from 'react'
import { useRouter, useParams } from 'next/navigation'
import {
  ArrowLeft,
  Sparkles,
  Calendar,
  ChevronDown,
  ChevronUp,
} from 'lucide-react'
import { toast } from 'sonner'
import JobInterviewsHeader from '@/src/components/recruiter/interviews/JobInterviewsHeader'
import JobInterviewsModals from '@/src/components/recruiter/interviews/JobInterviewsModals'
import InterviewStatusFilterTabs, { InterviewStatusTab } from '@/src/components/recruiter/interviews/InterviewStatusFilterTabs'
import InterviewRoundsPanel from '@/src/components/recruiter/interviews/InterviewRoundsPanel'
import InterviewsBulkActionBar from '@/src/components/recruiter/interviews/InterviewsBulkActionBar'
import JobInterviewsTable from '@/src/components/recruiter/interviews/JobInterviewsTable'
import { AvailableSlot, InterviewRoundConfig, InterviewRoundDetail } from '@/src/types/recruiter-interview'
import { useGetJobInterviewRounds } from '@/src/hooks/job'
import {
  useGetApplicationsByJob,
  useScheduleMultiSlot,
  useReviewInterviewReschedule,
  useEvaluateInterviewRound,
  useFinalConfirmInterview,
} from '@/src/hooks/application'

export default function JobInterviewsPage() {
  const router = useRouter()
  const params = useParams()
  const jobId = (params?.jobId as string) || ''

  const handleBackToJobList = () => {
    if (typeof window !== 'undefined' && window.history.length > 1) {
      router.back()
    } else {
      router.push('/recruiter/manage-jobs')
    }
  }

  // ── State Management ────────────────────────────────────────────────────────
  const [activeRound, setActiveRound] = useState<number>(1)
  const [showRoundsBox, setShowRoundsBox] = useState<boolean>(true)
  const [isSchedulerOpen, setIsSchedulerOpen] = useState(false)
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [activeTab, setActiveTab] = useState<InterviewStatusTab>('ALL')
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)

  // Candidate Modals
  const [evaluatingCandidate, setEvaluatingCandidate] = useState<InterviewRoundDetail | null>(null)
  const [reviewingRescheduleCandidate, setReviewingRescheduleCandidate] = useState<InterviewRoundDetail | null>(null)
  const [finalConfirmationCandidate, setFinalConfirmationCandidate] = useState<InterviewRoundDetail | null>(null)
  const [viewSlotsCandidate, setViewSlotsCandidate] = useState<InterviewRoundDetail | null>(null)

  // ── Real BE Rounds & Applications Data (React Query Cache - Zero useEffect) ──
  const { data: dbRounds = [], isLoading: isLoadingRounds } = useGetJobInterviewRounds(jobId)
  const { data: pageData } = useGetApplicationsByJob(jobId, 0, 100)

  // Interview Workflow Mutation Hooks
  const scheduleMultiSlotMutation = useScheduleMultiSlot()
  const reviewRescheduleMutation = useReviewInterviewReschedule()
  const evaluateRoundMutation = useEvaluateInterviewRound()
  const finalConfirmMutation = useFinalConfirmInterview()

  const roundsConfig: InterviewRoundConfig[] = useMemo(() => {
    if (dbRounds && dbRounds.length > 0) {
      return dbRounds.map((r) => ({
        id: r.id,
        roundNumber: r.roundNumber,
        roundName: r.roundName,
        description: r.description || '',
      }))
    }
    return []
  }, [dbRounds])

  const isConfigured = roundsConfig.length > 0
  const maxRoundNumber = useMemo(() => {
    if (roundsConfig.length === 0) return 1
    return Math.max(...roundsConfig.map((r) => r.roundNumber))
  }, [roundsConfig])

  // Local interactive overrides for UI actions
  const [localOverrides, setLocalOverrides] = useState<Record<string, Partial<InterviewRoundDetail>>>({})

  // ── Candidates computed declaratively via useMemo (No useEffect) ─────────────
  const candidates: InterviewRoundDetail[] = useMemo(() => {
    if (!pageData?.content || pageData.content.length === 0) return []

    const firstRoundName = roundsConfig[0]?.roundName || 'Vòng 1: HR Screening'

    const interviewEligibleApps = pageData.content.filter(
      (a: any) =>
        a.status === 'ACCEPTED' ||
        a.status === 'PENDING_INTERVIEW_SCHEDULE' ||
        a.status === 'CANDIDATE_REQUESTED_INTERVIEW_RESCHEDULE' ||
        a.status === 'INTERVIEW' ||
        a.status === 'SLOTS_SENT' ||
        a.status === 'RESCHEDULE_REQUESTED' ||
        a.status === 'RESCHEDULE_REJECTED' ||
        a.status === 'CONFIRMED' ||
        a.status === 'ATTENDED' ||
        a.status === 'PASSED' ||
        a.status === 'INTERVIEW_COMPLETED' ||
        a.status === 'TERMINATED'
    )

    return interviewEligibleApps.map((a: any) => {
      const candidateName = a.candidateName || a.fullName || 'Ứng viên'
      const jobTitle = a.jobTitle || a.title || 'Vị trí tuyển dụng'
      const baseStatus =
        a.status === 'ACCEPTED'
          ? 'NOT_STARTED'
          : a.status === 'PENDING_INTERVIEW_SCHEDULE'
          ? 'SLOTS_SENT'
          : a.status === 'CANDIDATE_REQUESTED_INTERVIEW_RESCHEDULE'
          ? 'RESCHEDULE_REQUESTED'
          : a.status === 'INTERVIEW'
          ? 'CONFIRMED'
          : (a.status as any)

      const baseCandidate: InterviewRoundDetail = {
        id: a.id,
        applicationId: a.id,
        candidateName,
        jobTitle,
        roundNumber: 1,
        roundName: firstRoundName,
        status: baseStatus,
        rescheduleCount: a.rescheduleCount || 0,
        scheduledTime: a.scheduledTime,
        candidatePreferredTime: a.candidatePreferredTime,
        candidateRescheduleReason: a.candidateRescheduleReason,
        hrRejectionReason: a.hrRejectionReason,
        hrAvailableSlots: a.hrAvailableSlots,
        attendedAt: a.attendedAt,
        feedbackNote: a.feedbackNote,
        rating: a.rating,
        slots: a.slots,
      }

      const override = localOverrides[a.id]
      if (override) {
        return { ...baseCandidate, ...override }
      }
      return baseCandidate
    })
  }, [pageData, roundsConfig, localOverrides])

  // Filter candidates by activeRound, activeTab & searchQuery
  const roundCandidates = useMemo(
    () => candidates.filter((c) => c.roundNumber === activeRound),
    [candidates, activeRound]
  )

  const counts = useMemo(() => {
    const total = roundCandidates.length
    const notStarted = roundCandidates.filter((c) => c.status === 'NOT_STARTED').length
    const slotsSent = roundCandidates.filter(
      (c) =>
        c.status === 'SLOTS_SENT' ||
        c.status === 'RESCHEDULE_REQUESTED' ||
        c.status === 'RESCHEDULE_REJECTED'
    ).length
    const confirmed = roundCandidates.filter((c) => c.status === 'CONFIRMED' || c.status === 'ATTENDED').length
    const passed = roundCandidates.filter((c) => c.status === 'PASSED' || c.status === 'INTERVIEW_COMPLETED').length
    const failed = roundCandidates.filter((c) => c.status === 'FAILED' || c.status === 'TERMINATED').length
    return { total, notStarted, slotsSent, confirmed, passed, failed }
  }, [roundCandidates])

  const filteredCandidates = useMemo(() => {
    return roundCandidates.filter((c) => {
      if (activeTab === 'NOT_STARTED') {
        if (c.status !== 'NOT_STARTED') return false
      } else if (activeTab === 'SLOTS_SENT') {
        if (
          c.status !== 'SLOTS_SENT' &&
          c.status !== 'RESCHEDULE_REQUESTED' &&
          c.status !== 'RESCHEDULE_REJECTED'
        )
          return false
      } else if (activeTab === 'CONFIRMED') {
        if (c.status !== 'CONFIRMED' && c.status !== 'ATTENDED') return false
      } else if (activeTab === 'PASSED') {
        if (c.status !== 'PASSED' && c.status !== 'INTERVIEW_COMPLETED') return false
      } else if (activeTab === 'FAILED') {
        if (c.status !== 'FAILED' && c.status !== 'TERMINATED') return false
      }

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim()
        const nameMatch = c.candidateName.toLowerCase().includes(q)
        const jobMatch = c.jobTitle.toLowerCase().includes(q)
        if (!nameMatch && !jobMatch) return false
      }

      return true
    })
  }, [roundCandidates, activeTab, searchQuery])

  // Pagination slicing
  const paginatedCandidates = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage
    return filteredCandidates.slice(start, start + itemsPerPage)
  }, [filteredCandidates, currentPage, itemsPerPage])

  // Checkbox handlers
  const handleToggleSelect = (id: string) => {
    if (!isConfigured) {
      toast.error('Vui lòng cấu hình quy trình phỏng vấn trước khi thao tác!')
      setIsConfigModalOpen(true)
      return
    }
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return new Set(next)
    })
  }

  const handleToggleSelectAll = (checked: boolean) => {
    if (!isConfigured) {
      toast.error('Vui lòng cấu hình quy trình phỏng vấn trước khi thao tác!')
      setIsConfigModalOpen(true)
      return
    }
    if (checked) {
      setSelectedIds(new Set(paginatedCandidates.map((c) => c.applicationId)))
    } else {
      setSelectedIds(new Set())
    }
  }

  // Scheduler handlers
  const handleOpenSingleScheduler = (appId: string) => {
    if (!isConfigured) {
      toast.error('Vui lòng cấu hình quy trình phỏng vấn trước khi tạo lịch phỏng vấn!')
      setIsConfigModalOpen(true)
      return
    }
    setSelectedIds(new Set([appId]))
    setIsSchedulerOpen(true)
  }

  // View sent slots handler
  const handleOpenViewSlots = (appId: string) => {
    const cand = candidates.find((c) => c.applicationId === appId)
    if (cand) {
      setViewSlotsCandidate(cand)
    }
  }

  const handleOpenBulkScheduler = () => {
    if (!isConfigured) {
      toast.error('Vui lòng cấu hình quy trình phỏng vấn trước khi tạo lịch phỏng vấn!')
      setIsConfigModalOpen(true)
      return
    }
    if (selectedIds.size === 0) return
    setIsSchedulerOpen(true)
  }

  const handleSaveMultiSlotSchedule = (slots: AvailableSlot[]) => {
    const targetIds = Array.from(selectedIds)
    const formattedSlots = slots.map((s) => ({
      startTime: s.startTime,
      endTime: s.endTime,
      location: s.location,
      meetingLink: s.meetingLink,
    }))

    scheduleMultiSlotMutation.mutate(
      {
        applicationIds: targetIds,
        roundNumber: activeRound,
        slots: formattedSlots,
      },
      {
        onSuccess: () => {
          setSelectedIds(new Set())
          toast.success(`Đã gửi khung giờ phỏng vấn tới ${targetIds.length} ứng viên!`)
        },
        onError: () => {
          toast.error('Có lỗi xảy ra khi gửi khung giờ phỏng vấn!')
        },
      }
    )
  }

  // Reschedule Negotiation Handlers
  const handleAcceptCandidateTime = (appId: string) => {
    reviewRescheduleMutation.mutate(
      {
        applicationId: appId,
        roundNumber: activeRound,
        accepted: true,
      },
      {
        onSuccess: () => {
          setReviewingRescheduleCandidate(null)
          toast.success('Đã chấp nhận thời gian đề xuất của ứng viên & chốt lịch chính thức!')
        },
        onError: () => {
          toast.error('Có lỗi xảy ra khi duyệt lịch!')
        },
      }
    )
  }

  const handleRejectAndOfferNewSlots = (
    appId: string,
    rejectionReason: string,
    newSlots: AvailableSlot[],
    isTerminated: boolean
  ) => {
    const formattedSlots = newSlots.map((s) => ({
      startTime: s.startTime,
      endTime: s.endTime,
      location: s.location,
      meetingLink: s.meetingLink,
    }))

    reviewRescheduleMutation.mutate(
      {
        applicationId: appId,
        roundNumber: activeRound,
        accepted: false,
        rejectionReason,
        newSlots: formattedSlots,
      },
      {
        onSuccess: () => {
          setReviewingRescheduleCandidate(null)
          if (isTerminated) {
            toast.info('Đã dừng luồng tuyển dụng do quá 3 lần đổi lịch. Hệ thống đã gửi email cảm ơn & từ chối.')
          } else {
            toast.success('Đã từ chối đề xuất và gửi lại danh sách khung giờ rảnh mới của HR tới ứng viên!')
          }
        },
        onError: () => {
          toast.error('Có lỗi xảy ra khi phản hồi yêu cầu đổi lịch!')
        },
      }
    )
  }

  // Evaluation Handlers (Pass / Fail)
  const handlePassCandidate = (feedbackNote: string, rating: number) => {
    if (!evaluatingCandidate) return
    const appId = evaluatingCandidate.applicationId

    evaluateRoundMutation.mutate(
      {
        applicationId: appId,
        roundNumber: activeRound,
        passed: true,
        rating,
        feedbackNote,
        isAttended: true,
      },
      {
        onSuccess: () => {
          setEvaluatingCandidate(null)
          toast.success('Đã chấm ĐẠT vòng phỏng vấn thành công!')
        },
        onError: () => {
          toast.error('Có lỗi xảy ra khi lưu kết quả đánh giá!')
        },
      }
    )
  }

  const handleFailCandidate = (feedbackNote: string, rating: number) => {
    if (!evaluatingCandidate) return
    const appId = evaluatingCandidate.applicationId

    evaluateRoundMutation.mutate(
      {
        applicationId: appId,
        roundNumber: activeRound,
        passed: false,
        rating,
        feedbackNote,
        isAttended: true,
      },
      {
        onSuccess: () => {
          setEvaluatingCandidate(null)
          toast.info('Đã đánh giá TRƯỢT. Đã cập nhật trạng thái hồ sơ.')
        },
        onError: () => {
          toast.error('Có lỗi xảy ra khi lưu kết quả đánh giá!')
        },
      }
    )
  }

  // Final Decision Handler (Approve / Reject at INTERVIEW_COMPLETED)
  const handleConfirmFinalResult = (appId: string, approved: boolean, note: string) => {
    finalConfirmMutation.mutate(
      {
        applicationId: appId,
        approved,
        note,
      },
      {
        onSuccess: () => {
          setFinalConfirmationCandidate(null)
          if (approved) {
            toast.success('Đã DUYỆT TUYỂN DỤNG thành công! Hệ thống đã gửi email chúc mừng tới ứng viên.')
          } else {
            toast.info('Đã TỪ CHỐI hồ sơ ứng tuyển. Hệ thống đã gửi email thư cảm ơn.')
          }
        },
        onError: () => {
          toast.error('Có lỗi xảy ra khi lưu kết quả tuyển dụng cuối cùng!')
        },
      }
    )
  }

  return (
    <div className="space-y-6 pb-12">
      {/* ── 1. Header Bar ───────────────────────────────────────── */}
      <JobInterviewsHeader
        onBack={handleBackToJobList}
        showRoundsBox={showRoundsBox}
        onToggleRoundsBox={() => setShowRoundsBox((prev) => !prev)}
      />

      {/* ── 2. Collapsible Rounds Panel ───────────────────────────────────── */}
      {showRoundsBox && (
        <InterviewRoundsPanel
          isLoading={isLoadingRounds}
          isConfigured={isConfigured}
          roundsConfig={roundsConfig}
          activeRound={activeRound}
          onRoundClick={(roundNum) => {
            setActiveRound(roundNum)
            setSelectedIds(new Set())
          }}
          onOpenConfig={() => setIsConfigModalOpen(true)}
        />
      )}


      {/* ── 3. Combined Filter & Search Bar Container (Matching JobApplicationsPage) ─ */}
      <InterviewStatusFilterTabs
        activeTab={activeTab}
        onTabChange={(tab) => {
          setActiveTab(tab)
          setCurrentPage(1)
        }}
        searchQuery={searchQuery}
        onSearchChange={(q) => {
          setSearchQuery(q)
          setCurrentPage(1)
        }}
        counts={counts}
      />

      <InterviewsBulkActionBar
        selectedCount={selectedIds.size}
        onCreateGroupSchedule={handleOpenBulkScheduler}
        onClearSelection={() => setSelectedIds(new Set())}
      />

      {/* ── 4. Candidate Table & Pagination ──────────────────────── */}
      <JobInterviewsTable
        candidates={paginatedCandidates}
        totalItems={filteredCandidates.length}
        activeRound={activeRound}
        isConfigured={isConfigured}
        selectedIds={selectedIds}
        currentPage={currentPage}
        itemsPerPage={itemsPerPage}
        onPageChange={(page) => setCurrentPage(page)}
        onItemsPerPageChange={(size) => setItemsPerPage(size)}
        onToggleSelect={handleToggleSelect}
        onToggleSelectAll={handleToggleSelectAll}
        onOpenScheduler={handleOpenSingleScheduler}
        onOpenViewSlots={handleOpenViewSlots}
        onOpenEvaluationModal={(cand) => setEvaluatingCandidate(cand)}
        onOpenRescheduleReviewModal={(cand) => setReviewingRescheduleCandidate(cand)}
        onOpenFinalConfirmationModal={(cand) => setFinalConfirmationCandidate(cand)}
        onOpenConfigModal={() => setIsConfigModalOpen(true)}
      />

      {/* ── 5. All Modals Isolated Bundle ──────────────────────── */}
      <JobInterviewsModals
        jobId={jobId}
        activeRound={activeRound}
        maxRoundNumber={maxRoundNumber}
        roundsConfig={roundsConfig}
        isSchedulerOpen={isSchedulerOpen}
        onCloseScheduler={() => setIsSchedulerOpen(false)}
        selectedCandidateNames={candidates
          .filter((c) => selectedIds.has(c.applicationId))
          .map((c) => c.candidateName)}
        onSaveSchedule={handleSaveMultiSlotSchedule}
        isConfigOpen={isConfigModalOpen}
        onCloseConfig={() => setIsConfigModalOpen(false)}
        evaluatingCandidate={evaluatingCandidate}
        onCloseEvaluation={() => setEvaluatingCandidate(null)}
        onPassCandidate={handlePassCandidate}
        onFailCandidate={handleFailCandidate}
        reviewingRescheduleCandidate={reviewingRescheduleCandidate}
        onCloseRescheduleReview={() => setReviewingRescheduleCandidate(null)}
        onAcceptCandidateTime={handleAcceptCandidateTime}
        onRejectAndOfferNewSlots={handleRejectAndOfferNewSlots}
        finalConfirmationCandidate={finalConfirmationCandidate}
        onCloseFinalConfirmation={() => setFinalConfirmationCandidate(null)}
        onConfirmFinalResult={handleConfirmFinalResult}
        viewSlotsCandidate={viewSlotsCandidate}
        onCloseViewSlots={() => setViewSlotsCandidate(null)}
      />
    </div>
  )
}
