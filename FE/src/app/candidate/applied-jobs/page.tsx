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
  useRequestInterviewReschedule,
  useGetMyApplications,
  useScoreApplication,
} from '@/src/hooks/application'
import { useGetJobs } from '@/src/hooks/job'
import { ApplicationMatchModal } from '@/src/components/candidate/application/ApplicationMatchModal'
import { ApplicationScoreDetailModal } from '@/src/components/candidate/application/ApplicationScoreDetailModal'
import AppliedJobCard from '@/src/components/candidate/application/AppliedJobCard'
import CandidateRescheduleModal from '@/src/components/candidate/application/CandidateRescheduleModal'
import AppliedJobsFilterTabs, { CandidateFilterStatus } from '@/src/components/candidate/application/AppliedJobsFilterTabs'
import Pagination from '@/src/components/common/Pagination'
import ConfirmModal from '@/src/components/common/ConfirmModal'
import { ApplicationStatus } from '@/src/types'
import { getErrorMessage } from '@/src/utils'

export default function AppliedJobsPage() {
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [activeTab, setActiveTab] = useState<CandidateFilterStatus>('ALL')

  const { data: applicationsPage, isLoading: loadingApps } = useGetMyApplications(currentPage - 1, itemsPerPage)
  const applications = applicationsPage?.content || []
  const totalPages = applicationsPage?.page?.totalPages ?? 1
  const totalElements = applicationsPage?.page?.totalElements ?? 0

  const { data: jobsData, isLoading: loadingJobs } = useGetJobs(0, 100)
  const requestRescheduleMutation = useRequestInterviewReschedule()
  const scoreMutation = useScoreApplication()

  const [scoreDetailAppId, setScoreDetailAppId] = useState<string | null>(null)
  const [scoringAppId, setScoringAppId] = useState<string | null>(null)
  const [confirmScoreAppId, setConfirmScoreAppId] = useState<string | null>(null)
  const [selectedApplicationId, setSelectedApplicationId] = useState<string | null>(null)
  const [changeFormInfo, setChangeFormInfo] = useState<{ applicationId: string; roundNumber: number } | null>(null)
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

  // Counts synchronized 1:1 with BE & FE ApplicationStatus
  const counts = useMemo(() => {
    return {
      all: applications.length,
      pendingSchedule: applications.filter(
        (a) =>
          a.status === ApplicationStatus.INTERVIEW &&
          a.interviewRounds?.some(
            (r: any) => r.status === 'SLOTS_SENT' || r.status === 'RESCHEDULE_REQUESTED'
          )
      ).length,
      interview: applications.filter(
        (a) => a.status === ApplicationStatus.INTERVIEW
      ).length,
      accepted: applications.filter((a) => a.status === ApplicationStatus.ACCEPTED).length,
      rejected: applications.filter((a) => a.status === ApplicationStatus.REJECTED).length,
    }
  }, [applications])

  // Filtered applications list synchronized 1:1 with BE & FE ApplicationStatus
  const filteredApplications = useMemo(() => {
    if (activeTab === 'ALL') return applications
    if (activeTab === 'PENDING_SCHEDULE') {
      return applications.filter(
        (a) =>
          a.status === ApplicationStatus.INTERVIEW &&
          a.interviewRounds?.some(
            (r: any) => r.status === 'SLOTS_SENT' || r.status === 'RESCHEDULE_REQUESTED'
          )
      )
    }
    if (activeTab === 'INTERVIEW') {
      return applications.filter(
        (a) => a.status === ApplicationStatus.INTERVIEW
      )
    }
    if (activeTab === 'ACCEPTED') {
      return applications.filter((a) => a.status === ApplicationStatus.ACCEPTED)
    }
    if (activeTab === 'REJECTED') {
      return applications.filter((a) => a.status === ApplicationStatus.REJECTED)
    }
    return applications
  }, [applications, activeTab])

  const handleSubmitChangeSchedule = (date: string, hour: string, reason: string) => {
    if (!changeFormInfo) return

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
        applicationId: changeFormInfo.applicationId,
        roundNumber: changeFormInfo.roundNumber || 1,
        preferredTime: selectedDate.toISOString(),
        reason: reason.trim(),
      },
      {
        onSuccess: () => {
          toast.success('Đã gửi yêu cầu đổi lịch phỏng vấn thành công.')
          setChangeFormInfo(null)
        },
        onError: (error: unknown) => {
          toast.error(getErrorMessage(error))
        },
      }
    )
  }

  const changingApplication = applications.find((app) => app.id === changeFormInfo?.applicationId)

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
      {/* Header & Filter Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
        <div>
          <h1 className="text-lg font-black text-slate-900">Danh Sách Đơn Ứng Tuyển</h1>
          <p className="text-xs font-medium text-slate-500">
            Theo dõi tiến trình hồ sơ và chọn lịch phỏng vấn với nhà tuyển dụng
          </p>
        </div>
        <AppliedJobsFilterTabs
          activeTab={activeTab}
          onTabChange={setActiveTab}
          counts={counts}
        />
      </div>

      {/* Applications List */}
      <div className="space-y-4">
        {filteredApplications.length === 0 ? (
          <div className="p-16 text-center bg-white rounded-3xl border border-slate-200/60 shadow-xs flex flex-col items-center justify-center gap-3">
            <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center border border-slate-100">
              <Send className="w-6 h-6 text-slate-350" />
            </div>
            <p className="text-slate-400 font-semibold text-sm">
              {activeTab === 'ALL'
                ? 'Bạn chưa ứng tuyển vị trí nào.'
                : 'Không tìm thấy đơn ứng tuyển nào ở trạng thái này.'}
            </p>
            <Link
              href="/jobs"
              className="mt-2 text-xs font-black text-blue-600 hover:text-blue-800 bg-blue-50/50 hover:bg-blue-50 px-4 py-2 rounded-xl transition-all border border-blue-100/30"
            >
              Tìm kiếm việc làm ngay
            </Link>
          </div>
        ) : (
          filteredApplications.map((app) => {
            const jobDetail = jobsMap.get(app.jobId)
            const isSelected = selectedApplicationId === app.id

            return (
              <AppliedJobCard
                key={app.id}
                app={app}
                jobDetail={jobDetail}
                isSelected={isSelected}
                isScoring={scoreMutation.isPending && scoringAppId === app.id}
                onSelect={() => setSelectedApplicationId(isSelected ? null : app.id)}
                onOpenScoreDetail={(id) => setScoreDetailAppId(id)}
                onConfirmScore={(id) => setConfirmScoreAppId(id)}
                onOpenChangeSchedule={(id, roundNum) => setChangeFormInfo({ applicationId: id, roundNumber: roundNum })}
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
      {(() => {
        const changingRound = changingApplication?.interviewRounds?.find((r) => r.roundNumber === changeFormInfo?.roundNumber)
        return (
          <CandidateRescheduleModal
            isOpen={!!changeFormInfo}
            onClose={() => setChangeFormInfo(null)}
            onSubmit={handleSubmitChangeSchedule}
            isLoading={requestRescheduleMutation.isPending}
            jobTitle={changingApplication?.jobTitle || ''}
            currentInterviewTime={changingApplication?.interviewDateTime}
            rescheduleCount={changingRound?.rescheduleCount ?? changingApplication?.rescheduleCount ?? 0}
          />
        )
      })()}

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
