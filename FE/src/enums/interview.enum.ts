export enum InterviewRoundStatus {
  NOT_STARTED = 'NOT_STARTED',
  SLOTS_SENT = 'SLOTS_SENT',
  RESCHEDULE_REQUESTED = 'RESCHEDULE_REQUESTED',
  RESCHEDULE_REJECTED = 'RESCHEDULE_REJECTED',
  CONFIRMED = 'CONFIRMED',
  ATTENDED = 'ATTENDED',
  PASSED = 'PASSED',
  FAILED = 'FAILED',
  TERMINATED = 'TERMINATED',
  INTERVIEW_COMPLETED = 'INTERVIEW_COMPLETED',
}

export type InterviewRoundStatusType = `${InterviewRoundStatus}` | InterviewRoundStatus

export const INTERVIEW_ROUND_STATUS_LABELS: Record<InterviewRoundStatus, string> = {
  [InterviewRoundStatus.NOT_STARTED]: 'Chưa xếp lịch',
  [InterviewRoundStatus.SLOTS_SENT]: 'Đã gửi lịch',
  [InterviewRoundStatus.RESCHEDULE_REQUESTED]: 'Ứng viên đề xuất đổi lịch',
  [InterviewRoundStatus.RESCHEDULE_REJECTED]: 'HR từ chối & Đề xuất lại',
  [InterviewRoundStatus.CONFIRMED]: 'Đã chốt lịch chính thức',
  [InterviewRoundStatus.ATTENDED]: 'Đã tham gia phỏng vấn',
  [InterviewRoundStatus.PASSED]: 'Đã Đạt (Pass Vòng)',
  [InterviewRoundStatus.FAILED]: 'Không Đạt (Fail Vòng)',
  [InterviewRoundStatus.TERMINATED]: 'Đã dừng luồng (Quá 3 lần đổi lịch)',
  [InterviewRoundStatus.INTERVIEW_COMPLETED]: 'Hoàn thành các vòng phỏng vấn',
}
