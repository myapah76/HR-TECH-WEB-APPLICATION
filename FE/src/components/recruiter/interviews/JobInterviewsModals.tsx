'use client'

import React from 'react'
import MultiSlotSchedulerModal from '@/src/components/recruiter/interview-schedules/MultiSlotSchedulerModal'
import InterviewRoundConfigModal from '@/src/components/recruiter/interview-schedules/InterviewRoundConfigModal'
import InterviewEvaluationModal from '@/src/components/recruiter/interviews/InterviewEvaluationModal'
import HrRescheduleReviewModal from '@/src/components/recruiter/interviews/HrRescheduleReviewModal'
import FinalConfirmationModal from '@/src/components/recruiter/interviews/FinalConfirmationModal'
import ViewSentSlotsModal from '@/src/components/recruiter/interviews/ViewSentSlotsModal'
import { AvailableSlot, InterviewRoundConfig, InterviewRoundDetail } from '@/src/types/recruiter-interview'

interface JobInterviewsModalsProps {
  jobId: string
  activeRound: number
  maxRoundNumber: number
  roundsConfig: InterviewRoundConfig[]
  // Scheduler Modal
  isSchedulerOpen: boolean
  onCloseScheduler: () => void
  selectedCandidateNames: string[]
  onSaveSchedule: (slots: AvailableSlot[]) => void
  prevRoundScheduledTime?: string
  // Config Modal
  isConfigOpen: boolean
  onCloseConfig: () => void
  // Evaluation Modal
  evaluatingCandidate: InterviewRoundDetail | null
  onCloseEvaluation: () => void
  onPassCandidate: (feedbackNote: string, rating: number) => void
  onFailCandidate: (feedbackNote: string, rating: number) => void
  // Reschedule Review Modal
  reviewingRescheduleCandidate: InterviewRoundDetail | null
  onCloseRescheduleReview: () => void
  onAcceptCandidateTime: (appId: string) => void
  onRejectAndOfferNewSlots: (
    appId: string,
    rejectionReason: string,
    newSlots: AvailableSlot[],
    isTerminated: boolean
  ) => void
  // Final Confirm Modal
  finalConfirmationCandidate: InterviewRoundDetail | null
  onCloseFinalConfirmation: () => void
  onConfirmFinalResult: (appId: string, approved: boolean, note: string) => void
  // View Sent Slots Modal
  viewSlotsCandidate: InterviewRoundDetail | null
  onCloseViewSlots: () => void
}

export default function JobInterviewsModals({
  jobId,
  activeRound,
  maxRoundNumber,
  roundsConfig,
  isSchedulerOpen,
  onCloseScheduler,
  selectedCandidateNames,
  onSaveSchedule,
  prevRoundScheduledTime,
  isConfigOpen,
  onCloseConfig,
  evaluatingCandidate,
  onCloseEvaluation,
  onPassCandidate,
  onFailCandidate,
  reviewingRescheduleCandidate,
  onCloseRescheduleReview,
  onAcceptCandidateTime,
  onRejectAndOfferNewSlots,
  finalConfirmationCandidate,
  onCloseFinalConfirmation,
  onConfirmFinalResult,
  viewSlotsCandidate,
  onCloseViewSlots,
}: JobInterviewsModalsProps) {
  const activeRoundName =
    roundsConfig.find((r) => r.roundNumber === activeRound)?.roundName || `Vòng ${activeRound}`

  return (
    <>
      {/* 1. MultiSlot Scheduler Modal */}
      <MultiSlotSchedulerModal
        isOpen={isSchedulerOpen}
        onClose={onCloseScheduler}
        candidateNames={selectedCandidateNames}
        roundNumber={activeRound}
        roundName={activeRoundName}
        onSubmit={onSaveSchedule}
        prevRoundScheduledTime={prevRoundScheduledTime}
      />

      {/* 2. Round Config Modal */}
      <InterviewRoundConfigModal
        isOpen={isConfigOpen}
        onClose={onCloseConfig}
        jobId={jobId}
        roundsConfig={roundsConfig}
      />

      {/* 3. Evaluation Modal */}
      <InterviewEvaluationModal
        candidate={evaluatingCandidate}
        activeRound={activeRound}
        isFinalRound={activeRound === maxRoundNumber}
        onClose={onCloseEvaluation}
        onPass={onPassCandidate}
        onFail={onFailCandidate}
      />

      {/* 4. Reschedule Review Modal */}
      <HrRescheduleReviewModal
        candidate={reviewingRescheduleCandidate}
        onClose={onCloseRescheduleReview}
        onAcceptCandidateTime={onAcceptCandidateTime}
        onRejectAndOfferNewSlots={onRejectAndOfferNewSlots}
      />

      {/* 5. Final Confirmation Modal */}
      <FinalConfirmationModal
        candidate={finalConfirmationCandidate}
        onClose={onCloseFinalConfirmation}
        onConfirmFinalResult={onConfirmFinalResult}
      />

      {/* 6. View Sent Slots Modal */}
      <ViewSentSlotsModal
        isOpen={!!viewSlotsCandidate}
        onClose={onCloseViewSlots}
        applicationId={viewSlotsCandidate?.applicationId || ''}
        candidateName={viewSlotsCandidate?.candidateName || ''}
        roundName={viewSlotsCandidate?.roundName || ''}
        roundNumber={viewSlotsCandidate?.roundNumber || activeRound}
      />
    </>
  )
}
