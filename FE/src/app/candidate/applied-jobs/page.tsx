'use client'

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import { useMemo, useState } from 'react'
import Link from 'next/link'
import { toast } from 'sonner'
import { Send, Loader2 } from 'lucide-react'
import {
  useAcceptInterviewSchedule,
  useRequestInterviewReschedule,
  useGetMyApplications,
  useScoreApplication,
} from '@/src/hooks/application'
import { useGetJobs } from '@/src/hooks/job'
import { ApplicationMatchModal } from '@/src/components/candidate/application/ApplicationMatchModal'
import { ApplicationScoreDetailModal } from '@/src/components/candidate/application/ApplicationScoreDetailModal'
import AppliedJobCard from '@/src/components/candidate/application/AppliedJobCard'
import CandidateRescheduleModal from '@/src/components/candidate/application/CandidateRescheduleModal'
import Pagination from '@/src/components/common/Pagination'
import ConfirmModal from '@/src/components/common/ConfirmModal'
import { getErrorMessage } from '@/src/utils'

export default function AppliedJobsPage() {
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)

  const { data: applicationsPage, isLoading: loadingApps } = useGetMyApplications(currentPage - 1, itemsPerPage)
  const applications = applicationsPage?.content || []
  const totalPages = applicationsPage?.page?.totalPages ?? 1
  const totalElements = applicationsPage?.page?.totalElements ?? 0

  const { data: jobsData, isLoading: loadingJobs } = useGetJobs(0, 100)
  const acceptScheduleMutation = useAcceptInterviewSchedule()
  const requestRescheduleMutation = useRequestInterviewReschedule()
  const scoreMutation = useScoreApplication()

  const [scoreDetailAppId, setScoreDetailAppId] = useState<string | null>(null)
  const [scoringAppId, setScoringAppId] = useState<string | null>(null)
  const [confirmScoreAppId, setConfirmScoreAppId] = useState<string | null>(null)
  const [selectedApplicationId, setSelectedApplicationId] = useState<string | null>(null)
  const [changeFormApplicationId, setChangeFormApplicationId] = useState<string | null>(null)
  const [matchApp, setMatchApp] = useState<{
    cvId: string
    jobId: string
    jobTitle: string
    companyName: string
  } | null>(null)

  const jobsMap = useMemo(() => {
    const map = new Map<string, any>()
    if (jobsData?.content) {
      jobsData.content.forEach((job) => {
        map.set(job.id, job)
      })
    }
    return map
  }, [jobsData])

  const handleAcceptSchedule = (applicationId: string) => {
    acceptScheduleMutation.mutate(applicationId, {
      onSuccess: () => {
        toast.success('Bạn đã xác nhận lịch phỏng vấn.')
        setChangeFormApplicationId(null)
      },
      onError: (error) => {
        toast.error(getErrorMessage(error))
      },
    })
  }

  const handleSubmitChangeSchedule = (date: string, hour: string, reason: string) => {
    if (!changeFormApplicationId) return

    if (!date) {
      toast.error('Vui lòng chọn ngày phỏng vấn mong muốn.')
      return
    }

    if (!reason.trim()) {
      toast.error('Vui lòng nhập lý do đổi lịch phỏng vấn.')
      return
    }

    const selectedDate = new Date(`${date}T${hour}:00`)
    if (Number.isNaN(selectedDate.getTime())) {
      toast.error('Thời gian phỏng vấn không hợp lệ.')
      return
    }

    requestRescheduleMutation.mutate(
      {
        applicationId: changeFormApplicationId,
        roundNumber: 1,
        preferredTime: selectedDate.toISOString(),
        reason: reason.trim(),
      },
      {
        onSuccess: () => {
          toast.success('Đã gửi yêu cầu đổi lịch phỏng vấn thành công.')
          setChangeFormApplicationId(null)
        },
        onError: (error: unknown) => {
          toast.error(getErrorMessage(error))
        },
      }
    )
  }

  const changingApplication = applications.find((app) => app.id === changeFormApplicationId)

  if (loadingApps || loadingJobs) {
    return (
      <div className="flex flex-col items-center justify-center py-32 space-y-4">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        <p className="text-sm font-semibold text-slate-500">
          Đang tải danh sách việc đã ứng tuyển...
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Danh sách ứng tuyển */}
      <div className="space-y-4">
        {applications.length === 0 ? (
          <div className="p-16 text-center bg-white rounded-3xl border border-slate-200/60 shadow-xs flex flex-col items-center justify-center gap-3">
            <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center border border-slate-100">
              <Send className="w-6 h-6 text-slate-350" />
            </div>
            <p className="text-slate-400 font-semibold text-sm">Bạn chưa ứng tuyển vị trí nào.</p>
            <Link
              href="/jobs"
              className="mt-2 text-xs font-black text-blue-600 hover:text-blue-800 bg-blue-50/50 hover:bg-blue-50 px-4 py-2 rounded-xl transition-all border border-blue-100/30"
            >
              Tìm kiếm việc làm ngay
            </Link>
          </div>
        ) : (
          applications.map((app) => {
            const jobDetail = jobsMap.get(app.jobId)
            const isSelected = selectedApplicationId === app.id

            return (
              <AppliedJobCard
                key={app.id}
                app={app}
                jobDetail={jobDetail}
                isSelected={isSelected}
                isScoring={scoreMutation.isPending && scoringAppId === app.id}
                isAcceptingSchedule={acceptScheduleMutation.isPending}
                isChangingSchedule={requestRescheduleMutation.isPending}
                onSelect={() => setSelectedApplicationId(isSelected ? null : app.id)}
                onOpenScoreDetail={(id) => setScoreDetailAppId(id)}
                onConfirmScore={(id) => setConfirmScoreAppId(id)}
                onAcceptSchedule={handleAcceptSchedule}
                onOpenChangeSchedule={(id) => setChangeFormApplicationId(id)}
              />
            )
          })
        )}
      </div>

      {totalElements >= 10 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={totalElements}
          itemsPerPage={itemsPerPage}
          onPageChange={setCurrentPage}
          onItemsPerPageChange={setItemsPerPage}
          pageSizeOptions={[5, 10, 20, 50]}
        />
      )}

      {/* Match Modal */}
      <ApplicationMatchModal
        isOpen={!!matchApp}
        onClose={() => setMatchApp(null)}
        cvId={matchApp?.cvId || ''}
        jobId={matchApp?.jobId || ''}
        jobTitle={matchApp?.jobTitle || ''}
        companyName={matchApp?.companyName || ''}
      />

      {/* Score Detail Modal */}
      <ApplicationScoreDetailModal
        applicationId={scoreDetailAppId || ''}
        isOpen={!!scoreDetailAppId}
        onClose={() => setScoreDetailAppId(null)}
      />

      {/* Candidate Reschedule Modal */}
      <CandidateRescheduleModal
        isOpen={!!changeFormApplicationId}
        onClose={() => setChangeFormApplicationId(null)}
        onSubmit={handleSubmitChangeSchedule}
        isLoading={requestRescheduleMutation.isPending}
        jobTitle={changingApplication?.jobTitle || ''}
        currentInterviewTime={changingApplication?.interviewDateTime}
      />

      {/* AI Score Confirmation Modal */}
      <ConfirmModal
        isOpen={confirmScoreAppId !== null}
        title="Xác nhận chấm điểm AI"
        description="Đánh giá mức độ phù hợp của CV với vị trí tuyển dụng này sẽ tiêu tốn 1 AI Credit từ tài khoản của bạn. Bạn có muốn tiếp tục?"
        confirmText="Chấm điểm"
        cancelText="Hủy bỏ"
        variant="info"
        isLoading={scoreMutation.isPending}
        onClose={() => setConfirmScoreAppId(null)}
        onConfirm={() => {
          if (!confirmScoreAppId) return
          setScoringAppId(confirmScoreAppId)
          scoreMutation.mutate(confirmScoreAppId, {
            onSuccess: () => {
              toast.success('Chấm điểm đơn ứng tuyển thành công!')
              setConfirmScoreAppId(null)
              setScoringAppId(null)
            },
            onError: (err) => {
              toast.error(getErrorMessage(err))
              setConfirmScoreAppId(null)
              setScoringAppId(null)
            },
          })
        }}
      />
    </div>
  )
}
