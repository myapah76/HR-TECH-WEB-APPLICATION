'use client'

import { useMemo } from 'react'
import { InterviewRoundConfig, InterviewRoundDetail } from '@/src/types/recruiter-interview'

export function useJobInterviewCandidates(
  pageData: any,
  roundsConfig: InterviewRoundConfig[],
  localOverrides: Record<string, Partial<InterviewRoundDetail>>
): InterviewRoundDetail[] {
  return useMemo(() => {
    if (!pageData?.content || pageData.content.length === 0) return []

    const firstRoundName = roundsConfig[0]?.roundName || 'Vòng 1: HR Screening'

    const interviewEligibleApps = pageData.content.filter((a: any) => {
      const hasInterviewRounds = a.interviewRounds && a.interviewRounds.length > 0

      // Nếu hồ sơ bị từ chối ở bước Duyệt CV (REJECTED và chưa có vòng phỏng vấn nào), BỎ QUA HOÀN TOÀN
      if (a.status === 'REJECTED' && !hasInterviewRounds) {
        return false
      }

      return (
        hasInterviewRounds ||
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
        a.status === 'FAILED' ||
        a.status === 'TERMINATED'
      )
    })

    const list: InterviewRoundDetail[] = []

    interviewEligibleApps.forEach((a: any) => {
      const candidateName = a.candidateName || a.fullName || 'Ứng viên'
      const jobTitle = a.jobTitle || a.title || 'Vị trí tuyển dụng'

      if (a.interviewRounds && a.interviewRounds.length > 0) {
        const roundsSorted = [...a.interviewRounds].sort((r1: any, r2: any) => r1.roundNumber - r2.roundNumber)

        roundsSorted.forEach((r: any, idx: number) => {
          const previousRoundsHistory = roundsSorted.slice(0, idx).map((prevR: any) => ({
            roundNumber: prevR.roundNumber,
            roundName: prevR.roundName || `Vòng ${prevR.roundNumber}`,
            rating: prevR.rating || 0,
            feedbackNote: prevR.feedbackNote || '',
            evaluatedAt: prevR.attendedAt || undefined,
          }))

          const isAppFinalized = a.status === 'ACCEPTED' || a.status === 'REJECTED'
          const effectiveStatus = isAppFinalized && idx === roundsSorted.length - 1
            ? (a.status === 'ACCEPTED' ? 'PASSED' : 'FAILED')
            : r.status

          const baseCandidate: InterviewRoundDetail = {
            id: `${a.id}-round-${r.roundNumber}`,
            applicationId: a.id,
            candidateName,
            jobTitle,
            roundNumber: r.roundNumber,
            roundName: r.roundName || `Vòng ${r.roundNumber}`,
            status: effectiveStatus as any,
            rescheduleCount: r.rescheduleCount || 0,
            scheduledTime: r.scheduledTime,
            candidatePreferredTime: r.candidatePreferredTime,
            candidateRescheduleReason: r.candidateRescheduleReason,
            hrRejectionReason: r.hrRejectionReason,
            attendedAt: r.attendedAt,
            feedbackNote: r.feedbackNote,
            rating: r.rating,
            slots: r.slots,
            previousRoundsHistory,
          }

          const key = `${a.id}-round-${r.roundNumber}`
          const override = localOverrides[key]
          if (override) {
            list.push({ ...baseCandidate, ...override })
          } else {
            list.push(baseCandidate)
          }
        })
      } else {
        const baseStatus =
          (a as any).interviewRoundStatus ||
          (a.status === 'ACCEPTED'
            ? 'NOT_STARTED'
            : a.status === 'PENDING_INTERVIEW_SCHEDULE'
            ? 'SLOTS_SENT'
            : a.status === 'CANDIDATE_REQUESTED_INTERVIEW_RESCHEDULE'
            ? 'RESCHEDULE_REQUESTED'
            : a.status === 'INTERVIEW'
            ? 'CONFIRMED'
            : (a.status as any))

        const baseCandidate: InterviewRoundDetail = {
          id: `${a.id}-round-1`,
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

        const override = localOverrides[`${a.id}-round-1`]
        list.push(override ? { ...baseCandidate, ...override } : baseCandidate)
      }
    })

    return list
  }, [pageData, roundsConfig, localOverrides])
}
