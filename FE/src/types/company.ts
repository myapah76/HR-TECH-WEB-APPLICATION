import { CompanyRole } from '@/src/enums/company.enum'

export interface CompanyResponse {
  id: string;
  name: string;
  taxCode: string;
  address: string;
  email: string;
  phone: string;
  website: string;
  description: string;
  logoUrl: string;
  coverImageUrl: string;
  status: string;
  industry?: string;
  size?: string;
  isDeleted?: boolean;
}

export interface CompanyMemberResponse {
  id: string
  userId: string
  email: string
  firstName: string
  lastName: string
  role: CompanyRole
  status?: 'ACTIVE' | 'INACTIVE' | 'REMOVED'
  createdAt: string
}

export interface GetCompaniesParams {
  keyword?: string
  page?: number
  size?: number
}

export interface TopCompany {
  id: string
  name: string
  logoUrl: string
  activeJobsCount: number
}

// ─── Request types ──────────────────────────────────────────────────────────

export interface CompanyUpdateRequest {
  name: string
  description?: string
  logoUrl?: string
  website?: string
  industry?: string
  size?: string
  address?: string
}

export interface AddMemberRequest {
  email: string
  fullName: string
  role: string
}

// ─── Dashboard types ─────────────────────────────────────────────────────────

export interface RecruiterDashboardSummary {
  activeJobsCount: number
  totalApps: number
  submittedAppsCount: number
  screeningAppsCount: number
  interviewAppsCount: number
  offerAppsCount: number
}

export interface RecruiterUpcomingInterview {
  cvTitle: string
  jobTitle: string
  interviewDateTime: string
  status: string
}

export interface RecruiterActiveJob {
  id: string
  title: string
  location: string
  salaryMin: number
  salaryMax: number
  applicantCount: number
}

export interface RecruiterAnalyticsItem {
  label: string
  count: number
}

export interface RecruiterAnalyticsResponse {
  sevenDays: RecruiterAnalyticsItem[]
  sixMonths: RecruiterAnalyticsItem[]
  threeYears: RecruiterAnalyticsItem[]
}
