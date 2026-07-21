'use client'

import React, { useState, useMemo } from 'react'
import { useParams } from 'next/navigation'
import { ArrowLeft, Sparkles } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'
import MultiRoundInterviewStepper from '@/src/components/recruiter/interview-schedules/MultiRoundInterviewStepper'
import MultiSlotSchedulerModal from '@/src/components/recruiter/interview-schedules/MultiSlotSchedulerModal'
import InterviewRoundConfigModal from '@/src/components/recruiter/interview-schedules/InterviewRoundConfigModal'
import { AvailableSlot, InterviewRoundConfig, InterviewRoundDetail } from '@/src/types/recruiter-interview'
import { useGetJobInterviewRounds } from '@/src/hooks/job'

export default function JobInterviewsPage() {
  const params = useParams()
  const jobId = params?.jobId as string

  const [activeRound, setActiveRound] = useState<number>(1)
  const [isSchedulerOpen, setIsSchedulerOpen] = useState(false)
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false)
  const [selectedCandidateIds, setSelectedCandidateIds] = useState<string[]>([])

  // ─── BE REAL DATA: INTERVIEW ROUNDS ──────────────────────────────────────────────
  const { data: dbRounds = [], isLoading: isLoadingRounds } = useGetJobInterviewRounds(jobId)

  // Map BE rounds to InterviewRoundConfig format
  const roundsConfig: InterviewRoundConfig[] = useMemo(() => {
    if (dbRounds && dbRounds.length > 0) {
      return dbRounds.map((r) => ({
        id: r.id,
        roundNumber: r.roundNumber,
        roundName: r.roundName,
        description: r.description || '',
      }))
    }
    return [
      { roundNumber: 1, roundName: 'Vòng 1: HR Screening', description: 'Đánh giá thái độ, văn hóa & tổng quan' },
    ]
  }, [dbRounds])

  // Mock candidate round pipeline state (10 ứng viên ở Vòng 1)
  const [candidates, setCandidates] = useState<InterviewRoundDetail[]>([
    {
      id: 'app-1',
      applicationId: 'app-1',
      candidateName: 'Nguyễn Văn Anh',
      jobTitle: 'Senior Fullstack Engineer',
      roundNumber: 1,
      roundName: 'Vòng 1: HR Screening',
      status: 'CONFIRMED',
      scheduledTime: '22/07/2026 09:00',
      rescheduleCount: 1,
      feedbackNote: 'Ứng viên tự tin, tiếng Anh giao tiếp tốt.',
      rating: 4,
    },
    {
      id: 'app-2',
      applicationId: 'app-2',
      candidateName: 'Trần Thị Bình',
      jobTitle: 'Senior Fullstack Engineer',
      roundNumber: 1,
      roundName: 'Vòng 1: HR Screening',
      status: 'CONFIRMED',
      scheduledTime: '22/07/2026 09:00',
      rescheduleCount: 0,
      feedbackNote: 'Đã gửi file bài test kỹ thuật trước phỏng vấn.',
      rating: 5,
    },
    {
      id: 'app-3',
      applicationId: 'app-3',
      candidateName: 'Lê Văn Cường',
      jobTitle: 'Senior Fullstack Engineer',
      roundNumber: 1,
      roundName: 'Vòng 1: HR Screening',
      status: 'SLOTS_SENT',
      scheduledTime: '22/07/2026 10:30',
      rescheduleCount: 0,
      rating: 0,
    },
    {
      id: 'app-4',
      applicationId: 'app-4',
      candidateName: 'Phạm Minh Đức',
      jobTitle: 'Senior Fullstack Engineer',
      roundNumber: 1,
      roundName: 'Vòng 1: HR Screening',
      status: 'RESCHEDULED',
      scheduledTime: '22/07/2026 14:00',
      rescheduleCount: 1,
      rating: 0,
    },
    {
      id: 'app-5',
      applicationId: 'app-5',
      candidateName: 'Hoàng Hoàng Em',
      jobTitle: 'Senior Fullstack Engineer',
      roundNumber: 1,
      roundName: 'Vòng 1: HR Screening',
      status: 'PASSED',
      scheduledTime: '21/07/2026 15:30',
      rescheduleCount: 0,
      feedbackNote: 'Vượt qua vòng HR xuất sắc.',
      rating: 5,
    },
    {
      id: 'app-6',
      applicationId: 'app-6',
      candidateName: 'Vũ Thị Giang',
      jobTitle: 'Senior Fullstack Engineer',
      roundNumber: 1,
      roundName: 'Vòng 1: HR Screening',
      status: 'NOT_STARTED',
      rescheduleCount: 0,
    },
    {
      id: 'app-7',
      applicationId: 'app-7',
      candidateName: 'Đặng Quốc Hùng',
      jobTitle: 'Senior Fullstack Engineer',
      roundNumber: 1,
      roundName: 'Vòng 1: HR Screening',
      status: 'NOT_STARTED',
      rescheduleCount: 0,
    },
    {
      id: 'app-8',
      applicationId: 'app-8',
      candidateName: 'Bùi Thị Hương',
      jobTitle: 'Senior Fullstack Engineer',
      roundNumber: 1,
      roundName: 'Vòng 1: HR Screening',
      status: 'NOT_STARTED',
      rescheduleCount: 0,
    },
    {
      id: 'app-9',
      applicationId: 'app-9',
      candidateName: 'Đỗ Văn Khoa',
      jobTitle: 'Senior Fullstack Engineer',
      roundNumber: 1,
      roundName: 'Vòng 1: HR Screening',
      status: 'FAILED',
      rescheduleCount: 0,
      feedbackNote: 'Không phù hợp mức lương kỳ vọng.',
      rating: 2,
    },
    {
      id: 'app-10',
      applicationId: 'app-10',
      candidateName: 'Ngô Thị Linh',
      jobTitle: 'Senior Fullstack Engineer',
      roundNumber: 1,
      roundName: 'Vòng 1: HR Screening',
      status: 'FAILED',
      rescheduleCount: 0,
      feedbackNote: 'Thiếu kinh nghiệm làm việc thực tế.',
      rating: 1,
    },
  ])

  const handleOpenSchedulerForCandidates = (roundNum: number, appIds: string[]) => {
    setSelectedCandidateIds(appIds)
    setIsSchedulerOpen(true)
  }

  const handleSaveMultiSlotSchedule = (slots: AvailableSlot[], note?: string) => {
    setCandidates((prev) =>
      prev.map((c) => {
        if (selectedCandidateIds.includes(c.applicationId)) {
          return {
            ...c,
            status: 'SLOTS_SENT',
            slots: slots,
          }
        }
        return c
      })
    )
    toast.success(
      `Đã tạo ${slots.length} khung giờ phỏng vấn và gửi thông báo chọn lịch tới ${selectedCandidateIds.length} ứng viên!`
    )
  }

  const handleUpdateCandidateRoundStatus = (
    applicationId: string,
    passed: boolean,
    feedbackNote: string,
    rating?: number
  ) => {
    setCandidates((prev) =>
      prev.map((c) => {
        if (c.applicationId === applicationId) {
          if (passed) {
            const nextRoundNum = c.roundNumber + 1
            const nextRoundObj = roundsConfig.find((r) => r.roundNumber === nextRoundNum)
            const nextRoundName = nextRoundObj
              ? nextRoundObj.roundName
              : `Vòng ${nextRoundNum}: Phỏng vấn Vòng ${nextRoundNum}`

            return {
              ...c,
              roundNumber: nextRoundNum,
              roundName: nextRoundName,
              status: 'NOT_STARTED',
              scheduledTime: undefined,
              slots: undefined,
              rescheduleCount: 0,
              feedbackNote,
              rating: rating || c.rating,
            }
          } else {
            return {
              ...c,
              status: 'FAILED',
              feedbackNote,
              rating: rating || c.rating,
            }
          }
        }
        return c
      })
    )

    if (passed) {
      toast.success('Đã đánh giá ĐẠT! Đơn ứng tuyển đã được tự động chuyển sang vòng tiếp theo.')
    } else {
      toast.info('Đã đánh giá TRƯỢT. Đã cập nhật trạng thái hồ sơ.')
    }
  }

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950 p-6 lg:p-10 space-y-8">
      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <Link
              href="/recruiter/manage-jobs"
              className="p-2 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                Quản Lý Quy Trình Phỏng Vấn 多 Vòng
                <span className="text-xs font-extrabold px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
                  {roundsConfig.length} Vòng Phỏng Vấn
                </span>
              </h1>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                Lên lịch nhiều slot giờ, tự động điều phối ứng viên & đánh giá kết quả nâng vòng
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setIsConfigModalOpen(true)}
            className="px-4 py-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 font-bold text-xs flex items-center gap-2 transition-all"
          >
            <Sparkles className="w-4 h-4 text-amber-500" />
            Cấu hình Quy trình Vòng ({roundsConfig.length} Vòng)
          </button>
        </div>
      </div>

      {/* Pipeline Stepper component */}
      <MultiRoundInterviewStepper
        roundsConfig={roundsConfig}
        activeRound={activeRound}
        onSelectRound={(roundNum) => setActiveRound(roundNum)}
        candidatesInRound={candidates.filter((c) => c.roundNumber === activeRound)}
        onOpenScheduler={handleOpenSchedulerForCandidates}
        onPassCandidate={(appId, roundNum, feedback, rating) =>
          handleUpdateCandidateRoundStatus(appId, true, feedback, rating)
        }
        onFailCandidate={(appId, roundNum, feedback) =>
          handleUpdateCandidateRoundStatus(appId, false, feedback)
        }
      />

      {/* Multi-slot Scheduler Modal */}
      <MultiSlotSchedulerModal
        isOpen={isSchedulerOpen}
        onClose={() => setIsSchedulerOpen(false)}
        candidateNames={candidates.filter((c) => selectedCandidateIds.includes(c.applicationId)).map((c) => c.candidateName)}
        roundNumber={activeRound}
        roundName={roundsConfig.find((r) => r.roundNumber === activeRound)?.roundName || `Vòng ${activeRound}`}
        onSubmit={handleSaveMultiSlotSchedule}
      />

      {/* Modal Cấu hình Quy trình Phỏng vấn */}
      <InterviewRoundConfigModal
        isOpen={isConfigModalOpen}
        onClose={() => setIsConfigModalOpen(false)}
        jobId={jobId}
        roundsConfig={roundsConfig}
      />
    </div>
  )
}
