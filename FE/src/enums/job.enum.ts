export enum JobStatus {
  DRAFT = 'DRAFT',
  PENDING_APPROVAL = 'PENDING_APPROVAL',
  APPROVED = 'APPROVED',
  OPEN = 'OPEN',
  CLOSED = 'CLOSED',
  REJECTED = 'REJECTED',
}

export enum JobType {
  FULL_TIME = 'FULL_TIME',
  PART_TIME = 'PART_TIME',
}

export enum ExperienceLevel {
  INTERN = 'INTERN',
  FRESHER = 'FRESHER',
  JUNIOR = 'JUNIOR',
  MIDDLE = 'MIDDLE',
  SENIOR = 'SENIOR',
}

export const JOB_STATUS_LABELS: Record<JobStatus, string> = {
  [JobStatus.DRAFT]: 'Bản nháp',
  [JobStatus.PENDING_APPROVAL]: 'Chờ duyệt',
  [JobStatus.APPROVED]: 'Đã duyệt',
  [JobStatus.OPEN]: 'Đang tuyển',
  [JobStatus.CLOSED]: 'Đã đóng',
  [JobStatus.REJECTED]: 'Bị từ chối',
}

export const JOB_STATUS_STYLES: Record<JobStatus, string> = {
  [JobStatus.DRAFT]: 'bg-amber-50 text-amber-700 border-amber-200',
  [JobStatus.PENDING_APPROVAL]: 'bg-blue-50 text-blue-700 border-blue-200',
  [JobStatus.APPROVED]: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  [JobStatus.OPEN]: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  [JobStatus.CLOSED]: 'bg-slate-100 text-slate-600 border-slate-200',
  [JobStatus.REJECTED]: 'bg-rose-50 text-rose-700 border-rose-200',
}

export const JOB_TYPE_LABELS: Record<JobType, string> = {
  [JobType.FULL_TIME]: 'Toàn thời gian',
  [JobType.PART_TIME]: 'Bán thời gian',
}

export const EXPERIENCE_LEVEL_LABELS: Record<ExperienceLevel, string> = {
  [ExperienceLevel.INTERN]: 'Thực tập sinh',
  [ExperienceLevel.FRESHER]: 'Mới tốt nghiệp',
  [ExperienceLevel.JUNIOR]: 'Junior',
  [ExperienceLevel.MIDDLE]: 'Middle',
  [ExperienceLevel.SENIOR]: 'Senior',
}

export type JobStatusAction = 'submit' | 'approve' | 'reject' | 'close'
