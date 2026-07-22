'use client'

import React, { useState, useMemo } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { toast } from 'sonner'
import { AlertTriangle } from 'lucide-react'
import JobInterviewsHeader from '@/src/components/recruiter/interviews/JobInterviewsHeader'
import JobInterviewsModals from '@/src/components/recruiter/interviews/JobInterviewsModals'
import InterviewStatusFilterTabs, { InterviewStatusTab } from '@/src/components/recruiter/interviews/InterviewStatusFilterTabs'
import InterviewRoundsPanel from '@/src/components/recruiter/interviews/InterviewRoundsPanel'
import InterviewsBulkActionBar from '@/src/components/recruiter/interviews/InterviewsBulkActionBar'
import JobInterviewsTable from '@/src/components/recruiter/interviews/JobInterviewsTable'
import ViewEvaluationResultModal from '@/src/components/recruiter/interviews/ViewEvaluationResultModal'
import ConfirmModal from '@/src/components/common/ConfirmModal'
import { AvailableSlot, InterviewRoundConfig, InterviewRoundDetail } from '@/src/types/recruiter-interview'
import { useGetJobInterviewRounds } from '@/src/hooks/job'
import {
  useGetApplicationsByJob,
  useScheduleMultiSlot,
  useReviewInterviewReschedule,
  useCheckInInterviewRound,
  useEvaluateInterviewRound,
  useFinalConfirmInterview,
} from '@/src/hooks/application'
import { useJobInterviewCandidates } from '@/src/components/recruiter/interviews/useJobInterviewCandidates'

export default function JobInterviewsPage() {
  const router = useRouter()
  const params = useParams()
  const jobId = (params?.jobId as string) || ''

  const handleBackToJobList = () => {
    router.push(`/recruiter/manage-jobs`)
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
  const [noShowCandidate, setNoShowCandidate] = useState<InterviewRoundDetail | null>(null)
  const [reviewingRescheduleCandidate, setReviewingRescheduleCandidate] = useState<InterviewRoundDetail | null>(null)
  const [finalConfirmationCandidate, setFinalConfirmationCandidate] = useState<InterviewRoundDetail | null>(null)
  const [viewSlotsCandidate, setViewSlotsCandidate] = useState<InterviewRoundDetail | null>(null)
  const [viewingEvaluationResultCandidate, setViewingEvaluationResultCandidate] = useState<InterviewRoundDetail | null>(null)

  // ── Real BE Rounds & Applications Data ──────────────────────────────────────
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

  // Candidates list computed cleanly via extracted custom hook
  const candidates: InterviewRoundDetail[] = useJobInterviewCandidates(
    pageData,
    roundsConfig,
    localOverrides
  )

  const isApprovalStep = roundsConfig.length > 0 && activeRound === maxRoundNumber + 1

  // Filter candidates by active round and round status tab
  const candidatesInActiveRound = useMemo(() => {
    if (isApprovalStep) {
      const latestAppRoundMap = new Map<string, InterviewRoundDetail>()
      candidates.forEach((c) => {
        const existing = latestAppRoundMap.get(c.applicationId)
        if (!existing || c.roundNumber > existing.roundNumber) {
          latestAppRoundMap.set(c.applicationId, c)
        }
      })

      const approvalCandidates: InterviewRoundDetail[] = []
      latestAppRoundMap.forEach((c) => {
        const status = c.status
        const appStatus = c.applicationStatus || (c as any).applicationStatus
        const isPassedOrCompleted =
          status === 'INTERVIEW_COMPLETED' ||
          status === 'PASSED' ||
          status === ('ACCEPTED' as any) ||
          status === ('REJECTED' as any) ||
          appStatus === 'ACCEPTED' ||
          appStatus === 'REJECTED'

        if (isPassedOrCompleted) {
          approvalCandidates.push(c)
        }
      })

      return approvalCandidates
    }
    return candidates.filter((c) => c.roundNumber === activeRound)
  }, [candidates, activeRound, isApprovalStep])

  // Lấy scheduledTime đã CONFIRMED của vòng trước (dùng cho validation slot vòng hiện tại)
  const prevRoundScheduledTime = useMemo(() => {
    if (activeRound <= 1) return undefined
    const prevRoundCandidates = candidates.filter(
      (c) => c.roundNumber === activeRound - 1 && c.scheduledTime
    )
    if (prevRoundCandidates.length === 0) return undefined
    // Lấy scheduledTime muộn nhất trong các ứng viên được chọn (hoặc tất cả nếu chưa chọn ai)
    const selectedPrev = prevRoundCandidates.filter((c) => selectedIds.has(c.applicationId))
    const pool = selectedPrev.length > 0 ? selectedPrev : prevRoundCandidates
    const latest = pool.reduce((max, c) => {
      if (!c.scheduledTime) return max
      return !max || c.scheduledTime > max ? c.scheduledTime : max
    }, undefined as string | undefined)
    return latest
  }, [candidates, activeRound, selectedIds])

  const filteredCandidates = useMemo(() => {
    let result = candidatesInActiveRound

    if (activeTab === 'NOT_STARTED') {
      result = result.filter((c) => c.status === 'NOT_STARTED')
    } else if (activeTab === 'SLOTS_SENT') {
      result = result.filter((c) => c.status === 'SLOTS_SENT' || c.status === 'RESCHEDULE_REQUESTED')
    } else if (activeTab === 'CONFIRMED') {
      result = result.filter((c) => c.status === 'CONFIRMED' || c.status === 'ATTENDED' || c.status === 'INTERVIEW_COMPLETED')
    } else if (activeTab === 'PASSED') {
      result = result.filter((c) => c.status === 'PASSED' || c.status === 'INTERVIEW_COMPLETED' || (c as any).applicationStatus === 'ACCEPTED')
    } else if (activeTab === 'FAILED') {
      result = result.filter((c) => c.status === 'FAILED' || c.status === 'TERMINATED' || (c as any).applicationStatus === 'REJECTED')
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      result = result.filter((c) => c.candidateName.toLowerCase().includes(q))
    }

    return result
  }, [candidatesInActiveRound, activeTab, searchQuery])

  // Tab counters for active round
  const tabCounts = useMemo(() => {
    const list = candidatesInActiveRound
    if (isApprovalStep) {
      return {
        total: list.length,
        notStarted: 0,
        slotsSent: 0,
        confirmed: 0,
        passed: list.filter((c) => c.status === 'PASSED' || c.status === 'INTERVIEW_COMPLETED' || (c as any).applicationStatus === 'ACCEPTED').length,
        failed: list.filter((c) => c.status === 'FAILED' || c.status === 'TERMINATED' || (c as any).applicationStatus === 'REJECTED').length,
      }
    }
    return {
      total: list.length,
      notStarted: list.filter((c) => c.status === 'NOT_STARTED').length,
      slotsSent: list.filter((c) => c.status === 'SLOTS_SENT' || c.status === 'RESCHEDULE_REQUESTED').length,
      confirmed: list.filter((c) => c.status === 'CONFIRMED' || c.status === 'ATTENDED' || c.status === 'INTERVIEW_COMPLETED').length,
      passed: list.filter((c) => c.status === 'PASSED').length,
      failed: list.filter((c) => c.status === 'FAILED' || c.status === 'TERMINATED').length,
    }
  }, [candidatesInActiveRound, isApprovalStep])

  // Selection toggle handlers
  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  const handleToggleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(new Set(filteredCandidates.map((c) => c.applicationId)))
    } else {
      setSelectedIds(new Set())
    }
  }

  // Multi-slot scheduling modal open handler
  const handleOpenSchedulerForSingle = (applicationId: string) => {
    setSelectedIds(new Set([applicationId]))
    setIsSchedulerOpen(true)
  }

  const handleOpenSchedulerForBulk = () => {
    if (selectedIds.size === 0) {
      toast.error('Vui lòng chọn ít nhất 1 ứng viên để tạo lịch phỏng vấn!')
      return
    }
    setIsSchedulerOpen(true)
  }

  const handleConfirmScheduleSlots = (slots: AvailableSlot[], note: string) => {
    const applicationIds = Array.from(selectedIds)
    if (applicationIds.length === 0) return

    scheduleMultiSlotMutation.mutate(
      {
        applicationIds,
        roundNumber: activeRound,
        note,
        slots: slots.map((s) => ({
          startTime: s.startTime,
          endTime: s.endTime,
          location: s.location,
          meetingLink: s.meetingLink,
        })),
      },
      {
        onSuccess: () => {
          setIsSchedulerOpen(false)
          setSelectedIds(new Set())
          setLocalOverrides((prev) => {
            const next = { ...prev }
            applicationIds.forEach((appId) => {
              const key = `${appId}-round-${activeRound}`
              next[key] = {
                ...next[key],
                status: 'SLOTS_SENT',
                slots,
              }
            })
            return next
          })
          toast.success(
            `Đã gửi ${slots.length} khung giờ phỏng vấn Vòng ${activeRound} thành công cho ${applicationIds.length} ứng viên!`
          )
        },
        onError: (err: any) => {
          toast.error(err?.message || 'Có lỗi khi gửi khung giờ phỏng vấn!')
        },
      }
    )
  }

  // Reschedule Review Handlers (HR Accepts or Rejects Candidate Proposed Time)
  const handleAcceptCandidateTime = (appId: string) => {
    const cand = candidates.find((c) => c.applicationId === appId && c.roundNumber === activeRound)
    if (!cand || !cand.candidatePreferredTime) return

    reviewRescheduleMutation.mutate(
      {
        applicationId: appId,
        roundNumber: activeRound,
        accepted: true,
      },
      {
        onSuccess: () => {
          setReviewingRescheduleCandidate(null)
          const key = `${appId}-round-${activeRound}`
          setLocalOverrides((prev) => ({
            ...prev,
            [key]: {
              ...prev[key],
              status: 'CONFIRMED',
              scheduledTime: cand.candidatePreferredTime,
              candidatePreferredTime: undefined,
            },
          }))
          toast.success(`Đã chấp nhận thời gian đề xuất của ứng viên ${cand.candidateName}! Lịch phỏng vấn đã được chốt.`)
        },
        onError: (err: any) => {
          toast.error(err?.message || 'Có lỗi xảy ra khi chấp nhận thời gian đổi lịch!')
        },
      }
    )
  }

  const handleRejectAndOfferNewSlots = (appId: string, rejectionReason: string, newSlots: AvailableSlot[], isTerminated: boolean) => {
    const cand = candidates.find((c) => c.applicationId === appId && c.roundNumber === activeRound)

    reviewRescheduleMutation.mutate(
      {
        applicationId: appId,
        roundNumber: activeRound,
        accepted: false,
        rejectionReason,
        newSlots: newSlots.map((s) => ({
          startTime: s.startTime,
          endTime: s.endTime,
          location: s.location,
          meetingLink: s.meetingLink,
          isNewSlot: s.isNewSlot,
        })),
      },
      {
        onSuccess: () => {
          setReviewingRescheduleCandidate(null)
          const key = `${appId}-round-${activeRound}`
          setLocalOverrides((prev) => ({
            ...prev,
            [key]: {
              ...prev[key],
              status: isTerminated ? 'TERMINATED' : 'SLOTS_SENT',
              slots: newSlots,
              candidatePreferredTime: undefined,
              hrRejectionReason: rejectionReason,
            },
          }))
          toast.success(
            isTerminated
              ? 'Đã dừng quy trình phỏng vấn của ứng viên.'
              : `Đã gửi lại ${newSlots.length} khung giờ mới cho ứng viên ${cand?.candidateName || ''}!`
          )
        },
        onError: (err: any) => {
          toast.error(err?.message || 'Có lỗi xảy ra khi từ chối và gửi lịch mới!')
        },
      }
    )
  }

  // Round Evaluation Handlers (Pass / Fail)
  const nextRoundNum = activeRound + 1

  const handlePassCandidate = (feedbackNote: string, rating: number) => {
    if (!evaluatingCandidate) return
    const appId = evaluatingCandidate.applicationId
    const currentKey = `${appId}-round-${activeRound}`
    const isFinal = activeRound >= maxRoundNumber

    const cand = evaluatingCandidate

    setLocalOverrides((prev) => ({
      ...prev,
      [currentKey]: {
        ...prev[currentKey],
        status: isFinal ? ('INTERVIEW_COMPLETED' as any) : 'PASSED',
        feedbackNote,
        rating,
      },
      ...(!isFinal
        ? {
            [`${appId}-round-${nextRoundNum}`]: {
              id: `${appId}-round-${nextRoundNum}`,
              applicationId: appId,
              candidateName: cand.candidateName,
              jobTitle: cand.jobTitle,
              roundNumber: nextRoundNum,
              roundName: roundsConfig.find((r) => r.roundNumber === nextRoundNum)?.roundName || `Vòng ${nextRoundNum}`,
              status: 'NOT_STARTED',
              rescheduleCount: 0,
              previousRoundsHistory: [
                ...(cand.previousRoundsHistory || []),
                {
                  roundNumber: activeRound,
                  roundName: cand.roundName,
                  rating,
                  feedbackNote,
                },
              ],
            },
          }
        : {}),
    }))

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
          toast.success(
            isFinal
              ? 'Đã chấm ĐẠT vòng cuối! Hãy bấm Duyệt Kết Quả Cuối Cùng để trúng tuyển.'
              : `Đã chấm ĐẠT Vòng ${activeRound}! Hồ sơ ứng viên đã chuyển sang Vòng ${nextRoundNum}.`
          )
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
    const currentKey = `${appId}-round-${activeRound}`

    setLocalOverrides((prev) => ({
      ...prev,
      [currentKey]: {
        ...prev[currentKey],
        status: 'FAILED',
        feedbackNote,
        rating,
      },
    }))

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
          toast.success(`Đã đánh giá KHÔNG ĐẠT Vòng ${activeRound} cho ứng viên.`)
        },
        onError: () => {
          toast.error('Có lỗi xảy ra khi lưu kết quả đánh giá!')
        },
      }
    )
  }

  const handleConfirmNoShowFail = (reason: string) => {
    if (!noShowCandidate) return

    const appId = noShowCandidate.applicationId
    const currentKey = `${appId}-round-${activeRound}`

    setLocalOverrides((prev) => ({
      ...prev,
      [currentKey]: {
        ...prev[currentKey],
        status: 'FAILED',
        feedbackNote: reason,
        rating: 1,
      },
    }))

    evaluateRoundMutation.mutate(
      {
        applicationId: appId,
        roundNumber: activeRound,
        passed: false,
        rating: 1,
        feedbackNote: reason,
        isAttended: false,
      },
      {
        onSuccess: () => {
          setNoShowCandidate(null)
          toast.success(`Đã đánh Fail (Vắng mặt) Vòng ${activeRound} cho ứng viên ${noShowCandidate.candidateName}.`)
        },
        onError: () => {
          toast.error('Có lỗi xảy ra khi lưu kết quả đánh giá!')
        },
      }
    )
  }

  // Final Decision Handler (Approve / Reject at INTERVIEW_COMPLETED)
  const checkInMutation = useCheckInInterviewRound()

  const handleCheckInCandidate = (cand: InterviewRoundDetail) => {
    const key = `${cand.applicationId}-round-${cand.roundNumber || activeRound}`
    setLocalOverrides((prev) => ({
      ...prev,
      [key]: {
        ...prev[key],
        status: 'ATTENDED',
        attendedAt: new Date().toISOString(),
      },
    }))

    checkInMutation.mutate(
      {
        applicationId: cand.applicationId,
        roundNumber: cand.roundNumber || activeRound,
      },
      {
        onSuccess: () => {
          toast.success(`Đã điểm danh cho ứng viên ${cand.candidateName}! Trạng thái chuyển sang Đã phỏng vấn.`)
        },
        onError: (err: any) => {
          toast.error(err?.message || 'Có lỗi khi điểm danh phỏng vấn!')
        },
      }
    )
  }

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
          const key = `${appId}-round-${activeRound}`
          setLocalOverrides((prev) => ({
            ...prev,
            [key]: {
              ...prev[key],
              status: approved ? 'PASSED' : 'FAILED',
            },
          }))
          toast.success(
            approved
              ? 'Đã duyệt TRÚNG TUYỂN (ACCEPTED) cho ứng viên!'
              : 'Đã từ chối ứng viên (REJECTED).'
          )
        },
        onError: (err: any) => {
          toast.error(err?.message || 'Có lỗi xảy ra khi xác nhận kết quả tuyển dụng!')
        },
      }
    )
  }

  return (
    <div className="space-y-6 pb-20 animate-fade-in">
      {/* Top Header */}
      <JobInterviewsHeader
        onBack={handleBackToJobList}
        showRoundsBox={showRoundsBox}
        onToggleRoundsBox={() => setShowRoundsBox(!showRoundsBox)}
      />

      {/* Rounds Structure Quick View Box */}
      {showRoundsBox && (
        <InterviewRoundsPanel
          isLoading={isLoadingRounds}
          isConfigured={isConfigured}
          roundsConfig={roundsConfig}
          activeRound={activeRound}
          onRoundClick={(rNum) => setActiveRound(rNum)}
          onOpenConfig={() => setIsConfigModalOpen(true)}
        />
      )}

      {/* Filter Tabs & Search Bar */}
      <InterviewStatusFilterTabs
        activeTab={activeTab}
        onTabChange={setActiveTab}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        isApprovalStep={isApprovalStep}
        counts={tabCounts}
      />

      {/* Bulk Action Bar (chỉ hiện ở các vòng phỏng vấn) */}
      {!isApprovalStep && (
        <InterviewsBulkActionBar
          selectedCount={selectedIds.size}
          onCreateGroupSchedule={handleOpenSchedulerForBulk}
          onClearSelection={() => setSelectedIds(new Set())}
        />
      )}

      {/* Main Candidates & Daily Confirmed Schedule Tables */}
      <JobInterviewsTable
        candidates={filteredCandidates}
        totalItems={filteredCandidates.length}
        activeRound={activeRound}
        isConfigured={isConfigured}
        isApprovalStep={isApprovalStep}
        selectedIds={selectedIds}
        currentPage={currentPage}
        itemsPerPage={itemsPerPage}
        onPageChange={setCurrentPage}
        onItemsPerPageChange={setItemsPerPage}
        onToggleSelect={handleToggleSelect}
        onToggleSelectAll={handleToggleSelectAll}
        onOpenScheduler={handleOpenSchedulerForSingle}
        onOpenViewSlots={(appId) => {
          const cand = candidates.find((c) => c.applicationId === appId && c.roundNumber === activeRound)
          if (cand) setViewSlotsCandidate(cand)
        }}
        onCheckInCandidate={handleCheckInCandidate}
        onOpenEvaluationModal={setEvaluatingCandidate}
        onOpenNoShowConfirmModal={setNoShowCandidate}
        onOpenRescheduleReviewModal={setReviewingRescheduleCandidate}
        onOpenFinalConfirmationModal={setFinalConfirmationCandidate}
        onOpenViewEvaluationResult={setViewingEvaluationResultCandidate}
        onOpenConfigModal={() => setIsConfigModalOpen(true)}
      />

      {/* All Workflow Modals Container */}
      <JobInterviewsModals
        jobId={jobId}
        activeRound={activeRound}
        maxRoundNumber={maxRoundNumber}
        roundsConfig={roundsConfig}
        isApprovalStep={isApprovalStep}
        isSchedulerOpen={isSchedulerOpen}
        onCloseScheduler={() => setIsSchedulerOpen(false)}
        selectedCandidateNames={candidatesInActiveRound
          .filter((c) => selectedIds.has(c.applicationId))
          .map((c) => c.candidateName)}
        onSaveSchedule={(slots) => handleConfirmScheduleSlots(slots, '')}
        prevRoundScheduledTime={prevRoundScheduledTime}
        isConfigOpen={isConfigModalOpen}
        onCloseConfig={() => setIsConfigModalOpen(false)}
        evaluatingCandidate={evaluatingCandidate}
        onCloseEvaluation={() => setEvaluatingCandidate(null)}
        onPassCandidate={handlePassCandidate}
        onFailCandidate={handleFailCandidate}
        noShowCandidate={noShowCandidate}
        isNoShowPending={evaluateRoundMutation.isPending}
        onCloseNoShow={() => setNoShowCandidate(null)}
        onConfirmNoShowFail={handleConfirmNoShowFail}
        viewingEvaluationResultCandidate={viewingEvaluationResultCandidate}
        onCloseViewEvaluationResult={() => setViewingEvaluationResultCandidate(null)}
        reviewingRescheduleCandidate={reviewingRescheduleCandidate}
        onCloseRescheduleReview={() => setReviewingRescheduleCandidate(null)}
        onAcceptCandidateTime={handleAcceptCandidateTime}
        onRejectAndOfferNewSlots={handleRejectAndOfferNewSlots}
        finalConfirmationCandidate={finalConfirmationCandidate}
        onCloseFinalConfirmation={() => setFinalConfirmationCandidate(null)}
        onConfirmFinalResult={handleConfirmFinalResult}
        onOpenFinalConfirmationModal={setFinalConfirmationCandidate}
        viewSlotsCandidate={viewSlotsCandidate}
        onCloseViewSlots={() => setViewSlotsCandidate(null)}
      />
    </div>
  )
}
