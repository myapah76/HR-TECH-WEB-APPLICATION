export enum InterviewRoundStatus {
  NOT_STARTED = 'NOT_STARTED',
  SLOTS_SENT = 'SLOTS_SENT',
  CONFIRMED = 'CONFIRMED',
  RESCHEDULED = 'RESCHEDULED',
  PASSED = 'PASSED',
  FAILED = 'FAILED',
}

export type InterviewRoundStatusType = `${InterviewRoundStatus}` | InterviewRoundStatus

export const INTERVIEW_ROUND_STATUS_LABELS: Record<InterviewRoundStatus, string> = {
  [InterviewRoundStatus.NOT_STARTED]: 'Chưa đặt lịch',
  [InterviewRoundStatus.SLOTS_SENT]: 'Đã gửi slots - Chờ phản hồi',
  [InterviewRoundStatus.CONFIRMED]: 'Đã chốt lịch chính thức',
  [InterviewRoundStatus.RESCHEDULED]: 'Ứng viên đề xuất đổi lịch',
  [InterviewRoundStatus.PASSED]: 'Đã Đạt (Pass Vòng)',
  [InterviewRoundStatus.FAILED]: 'Không Đạt (Fail Vòng)',
}
