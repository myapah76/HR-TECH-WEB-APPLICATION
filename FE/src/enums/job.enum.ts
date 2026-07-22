export enum JobStatus {
  DRAFT = 'DRAFT',
  PENDING_AI = 'PENDING_AI',
  FAILED_AI = 'FAILED_AI',
  APPEALED = 'APPEALED',
  APPROVED = 'APPROVED',
  OPEN = 'OPEN',
  CLOSED = 'CLOSED',
  REJECTED_BY_ADMIN = 'REJECTED_BY_ADMIN',
}

export enum JobType {
  FULL_TIME = 'FULL_TIME',
  PART_TIME = 'PART_TIME',
}

export enum SalaryType {
  MONTHLY = 'MONTHLY',
  HOURLY = 'HOURLY',
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
  [JobStatus.PENDING_AI]: 'Đang quét AI',
  [JobStatus.FAILED_AI]: 'AI từ chối',
  [JobStatus.APPEALED]: 'Đang khiếu nại',
  [JobStatus.APPROVED]: 'Đã duyệt',
  [JobStatus.OPEN]: 'Đang tuyển',
  [JobStatus.CLOSED]: 'Đã đóng',
  [JobStatus.REJECTED_BY_ADMIN]: 'Admin từ chối',
}

export const JOB_STATUS_STYLES: Record<JobStatus, string> = {
  [JobStatus.DRAFT]: 'bg-amber-50 text-amber-700 border-amber-200',
  [JobStatus.PENDING_AI]: 'bg-blue-50 text-blue-700 border-blue-200',
  [JobStatus.FAILED_AI]: 'bg-red-50 text-red-700 border-red-200',
  [JobStatus.APPEALED]: 'bg-sky-50 text-sky-700 border-sky-200',
  [JobStatus.APPROVED]: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  [JobStatus.OPEN]: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  [JobStatus.CLOSED]: 'bg-slate-100 text-slate-600 border-slate-200',
  [JobStatus.REJECTED_BY_ADMIN]: 'bg-rose-50 text-rose-700 border-rose-200',
}

export const JOB_TYPE_LABELS: Record<JobType, string> = {
  [JobType.FULL_TIME]: 'Toàn thời gian',
  [JobType.PART_TIME]: 'Bán thời gian',
}

export const SALARY_TYPE_LABELS: Record<SalaryType, string> = {
  [SalaryType.MONTHLY]: 'Theo tháng (VND/tháng)',
  [SalaryType.HOURLY]: 'Theo giờ (VND/giờ)',
}

export const EXPERIENCE_LEVEL_LABELS: Record<ExperienceLevel, string> = {
  [ExperienceLevel.INTERN]: 'Thực tập sinh',
  [ExperienceLevel.FRESHER]: 'Fresher',
  [ExperienceLevel.JUNIOR]: 'Junior',
  [ExperienceLevel.MIDDLE]: 'Middle',
  [ExperienceLevel.SENIOR]: 'Senior',
}

export type JobStatusAction = 'submit' | 'close' | 'appeal'

export const getStatusBadgeVariant = (status: JobStatus): 'success' | 'info' | 'warning' | 'danger' | 'outline' => {
  switch (status) {
    case JobStatus.APPROVED:
    case JobStatus.OPEN:
      return 'success'
    case JobStatus.PENDING_AI:
      return 'info'
    case JobStatus.DRAFT:
      return 'warning'
    case JobStatus.FAILED_AI:
    case JobStatus.REJECTED_BY_ADMIN:
      return 'danger'
    case JobStatus.CLOSED:
    default:
      return 'outline'
  }
}
