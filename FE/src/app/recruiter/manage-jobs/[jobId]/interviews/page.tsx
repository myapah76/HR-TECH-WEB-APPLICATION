'use client'

import React, { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, Calendar, Plus, Users, Sparkles, CheckCircle2, X } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'
import MultiRoundInterviewStepper from '@/src/components/recruiter/interview-schedules/MultiRoundInterviewStepper'
import MultiSlotSchedulerModal from '@/src/components/recruiter/interview-schedules/MultiSlotSchedulerModal'
import { AvailableSlot, InterviewRoundConfig, InterviewRoundDetail } from '@/src/types/recruiter-interview'

export default function JobInterviewsPage() {
  const params = useParams()
  const jobId = params?.jobId as string

  const [activeRound, setActiveRound] = useState<number>(1)
  const [isSchedulerOpen, setIsSchedulerOpen] = useState(false)
  const [selectedCandidateIds, setSelectedCandidateIds] = useState<string[]>([])

  // Interview rounds configuration state for Job
  const [roundsConfig, setRoundsConfig] = useState<InterviewRoundConfig[]>([
    { roundNumber: 1, roundName: 'Vòng 1: HR Screening', description: 'Đánh giá thái độ, văn hóa & tổng quan', interviewerRole: 'HR Specialist' },
    { roundNumber: 2, roundName: 'Vòng 2: Phỏng vấn Chuyên môn', description: 'Kiểm tra kỹ năng kỹ thuật & Live Coding', interviewerRole: 'Tech Lead / Senior Engineer' },
    { roundNumber: 3, roundName: 'Vòng 3: Culture & Offer', description: 'Trao đổi về chế độ đãi ngộ & ký hợp đồng', interviewerRole: 'Engineering Director / HR Manager' },
  ])

  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false)
  const [tempRounds, setTempRounds] = useState<InterviewRoundConfig[]>(roundsConfig)

  const handleOpenConfigModal = () => {
    setTempRounds([...roundsConfig])
    setIsConfigModalOpen(true)
  }

  const handleAddRound = () => {
    const nextNum = tempRounds.length + 1
    setTempRounds([
      ...tempRounds,
      {
        roundNumber: nextNum,
        roundName: `Vòng ${nextNum}: Phỏng vấn Vòng ${nextNum}`,
        description: 'Mô tả tiêu chí phỏng vấn...',
        interviewerRole: 'Interviewer',
      },
    ])
  }

  const handleRemoveRound = (roundNumber: number) => {
    if (tempRounds.length <= 1) {
      toast.error('Quy trình phỏng vấn phải có ít nhất 1 vòng!')
      return
    }
    // Kiểm tra xem vòng có ứng viên nào đang phỏng vấn không
    const candidateCount = candidates.filter((c) => c.roundNumber === roundNumber && c.status !== 'FAILED').length
    if (candidateCount > 0) {
      toast.error(
        `Không thể xóa Vòng ${roundNumber} vì đang có ${candidateCount} ứng viên đang phỏng vấn! Vui lòng đánh giá hoặc chuyển ứng viên sang vòng khác trước khi xóa.`
      )
      return
    }

    const updated = tempRounds
      .filter((r) => r.roundNumber !== roundNumber)
      .map((r, idx) => ({ ...r, roundNumber: idx + 1 }))
    setTempRounds(updated)
  }

  const handleSaveRoundsConfig = () => {
    setRoundsConfig(tempRounds)
    setIsConfigModalOpen(false)
    toast.success(`Đã cập nhật cấu hình quy trình gồm ${tempRounds.length} vòng phỏng vấn!`)
  }

  // Mock candidate round pipeline state (10 ứng viên ở Vòng 1)
  const [candidates, setCandidates] = useState<InterviewRoundDetail[]>([
    // ─── VÒNG 1: 10 ỨNG VIÊN MOCK ──────────────────────────────────────────
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
      candidateName: 'Lê Hoàng Cường',
      jobTitle: 'Senior Fullstack Engineer',
      roundNumber: 1,
      roundName: 'Vòng 1: HR Screening',
      status: 'CONFIRMED',
      scheduledTime: '22/07/2026 09:00',
      rescheduleCount: 2,
      feedbackNote: 'Ứng viên xin dời lịch 2 lần do trùng lịch thi.',
      rating: 4,
    },
    {
      id: 'app-4',
      applicationId: 'app-4',
      candidateName: 'Phạm Minh Đức',
      jobTitle: 'Senior Fullstack Engineer',
      roundNumber: 1,
      roundName: 'Vòng 1: HR Screening',
      status: 'CONFIRMED',
      scheduledTime: '22/07/2026 14:00',
      rescheduleCount: 0,
    },
    {
      id: 'app-5',
      applicationId: 'app-5',
      candidateName: 'Đỗ Hải Đăng',
      jobTitle: 'Senior Fullstack Engineer',
      roundNumber: 1,
      roundName: 'Vòng 1: HR Screening',
      status: 'CONFIRMED',
      scheduledTime: '22/07/2026 14:00',
      rescheduleCount: 1,
    },
    {
      id: 'app-6',
      applicationId: 'app-6',
      candidateName: 'Vũ Thanh Hằng',
      jobTitle: 'Senior Fullstack Engineer',
      roundNumber: 1,
      roundName: 'Vòng 1: HR Screening',
      status: 'CONFIRMED',
      scheduledTime: '23/07/2026 10:00',
      rescheduleCount: 0,
    },
    {
      id: 'app-7',
      applicationId: 'app-7',
      candidateName: 'Bùi Quang Huy',
      jobTitle: 'Senior Fullstack Engineer',
      roundNumber: 1,
      roundName: 'Vòng 1: HR Screening',
      status: 'SLOTS_SENT',
      scheduledTime: 'Chờ ứng viên chọn khung giờ (Gửi 3 slots)',
      rescheduleCount: 0,
    },
    {
      id: 'app-8',
      applicationId: 'app-8',
      candidateName: 'Đặng Thị Mai',
      jobTitle: 'Senior Fullstack Engineer',
      roundNumber: 1,
      roundName: 'Vòng 1: HR Screening',
      status: 'RESCHEDULED',
      scheduledTime: 'Đề xuất đổi lịch sang 24/07 09:30',
      rescheduleCount: 1,
    },
    {
      id: 'app-9',
      applicationId: 'app-9',
      candidateName: 'Hoàng Trọng Nam',
      jobTitle: 'Senior Fullstack Engineer',
      roundNumber: 1,
      roundName: 'Vòng 1: HR Screening',
      status: 'NOT_STARTED',
      scheduledTime: 'Chưa đặt lịch phỏng vấn',
      rescheduleCount: 0,
    },
    {
      id: 'app-10',
      applicationId: 'app-10',
      candidateName: 'Ngô Văn Phương',
      jobTitle: 'Senior Fullstack Engineer',
      roundNumber: 1,
      roundName: 'Vòng 1: HR Screening',
      status: 'RESCHEDULED',
      scheduledTime: 'Đề xuất đổi lịch sang 25/07 15:00',
      rescheduleCount: 3,
    },
    // ─── VÒNG 2 & VÒNG 3 ──────────────────────────────────────────────────
    {
      id: 'app-11',
      applicationId: 'app-11',
      candidateName: 'Phan Bảo Long',
      jobTitle: 'Senior Fullstack Engineer',
      roundNumber: 2,
      roundName: 'Vòng 2: Phỏng vấn Chuyên môn',
      status: 'CONFIRMED',
      scheduledTime: '24/07/2026 09:00',
      rescheduleCount: 0,
    },
    {
      id: 'app-12',
      applicationId: 'app-12',
      candidateName: 'Trịnh Khánh Linh',
      jobTitle: 'Senior Fullstack Engineer',
      roundNumber: 3,
      roundName: 'Vòng 3: Culture & Offer',
      status: 'CONFIRMED',
      scheduledTime: '25/07/2026 14:00',
      rescheduleCount: 0,
    },
  ])

  const candidatesInActiveRound = candidates.filter((c) => c.roundNumber === activeRound)

  const handleOpenScheduler = (roundNum: number, candIds: string[]) => {
    setSelectedCandidateIds(candIds)
    setIsSchedulerOpen(true)
  }

  const handleSlotSubmit = (slots: AvailableSlot[], note?: string) => {
    toast.success(
      `Đã tạo ${slots.length} khung giờ rảnh và gửi lời mời phỏng vấn cho ${selectedCandidateIds.length} ứng viên!`
    )
    setCandidates((prev) =>
      prev.map((cand) =>
        selectedCandidateIds.includes(cand.applicationId)
          ? { ...cand, status: 'SLOTS_SENT', slots, scheduledTime: `Chờ ứng viên chọn (Gửi ${slots.length} slots)` }
          : cand
      )
    )
  }

  const handlePassCandidate = (
    applicationId: string,
    roundNumber: number,
    feedback: string,
    rating: number
  ) => {
    const nextRound = roundNumber + 1
    if (nextRound > roundsConfig.length) {
      toast.success(`Chúc mừng! Ứng viên đã hoàn thành xuất sắc toàn bộ ${roundsConfig.length} vòng phỏng vấn!`)
    } else {
      toast.success(`Đã phê duyệt ứng viên qua Vòng ${roundNumber} và chuyển lên Vòng ${nextRound}!`)
    }
    setCandidates((prev) =>
      prev.map((c) =>
        c.applicationId === applicationId
          ? {
              ...c,
              roundNumber: nextRound,
              roundName: roundsConfig.find((r) => r.roundNumber === nextRound)?.roundName || `Vòng ${nextRound}`,
              status: 'CONFIRMED',
              feedbackNote: feedback,
              rating,
            }
          : c
      )
    )
  }

  const handleFailCandidate = (applicationId: string, roundNumber: number, feedback: string) => {
    toast.error(`Ứng viên không đạt Vòng ${roundNumber}. Đã chuyển sang danh sách Từ chối.`)
    setCandidates((prev) =>
      prev.map((c) =>
        c.applicationId === applicationId
          ? { ...c, status: 'FAILED', feedbackNote: feedback }
          : c
      )
    )
  }

  const selectedCandidateNames = candidates
    .filter((c) => selectedCandidateIds.includes(c.applicationId))
    .map((c) => c.candidateName)

  return (
    <div className="space-y-6 pb-12">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            href={`/recruiter/manage-jobs/${jobId}/applications`}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-slate-100">
              Quản Lý Phỏng Vấn Nhiều Vòng (Multi-Round Pipeline)
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Job ID: {jobId} • {roundsConfig.length} Vòng phỏng vấn được cấu hình
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleOpenConfigModal}
          className="inline-flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold rounded-xl shadow-xs hover:bg-slate-50 transition-colors cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4 text-indigo-600" />
          <span>Thiết lập số vòng phỏng vấn ({roundsConfig.length})</span>
        </button>
      </div>

      {/* Main Multi-Round Stepper */}
      <MultiRoundInterviewStepper
        roundsConfig={roundsConfig}
        activeRound={activeRound}
        onSelectRound={setActiveRound}
        candidatesInRound={candidatesInActiveRound}
        onOpenScheduler={handleOpenScheduler}
        onPassCandidate={handlePassCandidate}
        onFailCandidate={handleFailCandidate}
      />

      {/* Multi Slot Scheduler Modal */}
      <MultiSlotSchedulerModal
        isOpen={isSchedulerOpen}
        onClose={() => setIsSchedulerOpen(false)}
        candidateNames={selectedCandidateNames}
        roundNumber={activeRound}
        roundName={roundsConfig.find((r) => r.roundNumber === activeRound)?.roundName || ''}
        onSubmit={handleSlotSubmit}
      />

      {/* Round Configuration Modal */}
      {isConfigModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl w-full max-w-xl p-6 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <div>
                <h3 className="text-lg font-black text-slate-900 dark:text-slate-100">
                  Cấu Hình Số Vòng Phỏng Vấn
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Thiết lập danh sách và tiêu chí đánh giá từng vòng cho vị trí tuyển dụng này
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsConfigModalOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-xl"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
              {tempRounds.map((round, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/50 px-2.5 py-1 rounded-lg">
                      Vòng {idx + 1}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRemoveRound(round.roundNumber)}
                      className="text-xs font-bold text-rose-600 hover:text-rose-700 p-1"
                    >
                      Xóa vòng này
                    </button>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      Tên vòng phỏng vấn
                    </label>
                    <input
                      type="text"
                      value={round.roundName}
                      onChange={(e) => {
                        const val = e.target.value
                        setTempRounds((prev) =>
                          prev.map((r, i) => (i === idx ? { ...r, roundName: val } : r))
                        )
                      }}
                      className="w-full px-3 py-2 text-xs font-semibold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-500">Mô tả tiêu chí phỏng vấn</label>
                    <input
                      type="text"
                      value={round.description || ''}
                      onChange={(e) => {
                        const val = e.target.value
                        setTempRounds((prev) =>
                          prev.map((r, i) => (i === idx ? { ...r, description: val } : r))
                        )
                      }}
                      placeholder="Ví dụ: Kiểm tra kỹ năng chuyên môn & Live Coding..."
                      className="w-full px-3 py-2 text-xs font-medium bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>
              ))}

              <button
                type="button"
                onClick={handleAddRound}
                className="w-full py-3 border border-dashed border-indigo-300 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400 font-bold text-xs rounded-2xl hover:bg-indigo-50/50 transition-colors flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Thêm vòng phỏng vấn mới (Vòng {tempRounds.length + 1})
              </button>
            </div>

            <div className="flex items-center justify-end gap-3 border-t border-slate-100 dark:border-slate-800 pt-4">
              <button
                type="button"
                onClick={() => setIsConfigModalOpen(false)}
                className="px-4 py-2 text-xs font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                onClick={handleSaveRoundsConfig}
                className="px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs"
              >
                Lưu cấu hình
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
