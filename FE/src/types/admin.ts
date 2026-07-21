export interface AdminDashboardSummary {
  totalUsers: number
  newUsersToday: number
  totalJobs: number
  newJobsToday: number
  totalCompanies: number
  newCompaniesToday: number
  systemActivities: {
    newUsersToday: number
    newJobsToday: number
    applicationsToday: number
    cvScansToday: number
  }
  userDistribution: {
    candidates: number
    candidatePercentage: number
    recruiters: number
    recruiterPercentage: number
    admins: number
    adminPercentage: number
  }
  revenueHistory: {
    month: string
    revenue: number
    sales: number
  }[]
  weeklyProfit: {
    day: string
    revenue: number
    sales: number
  }[]
  adminTodo?: {
    pendingCompanies: number
    pendingComplaints: number
  }
  topPackages?: {
    name: string
    salesCount: number
  }[]
  aiUsage?: {
    featureName: string
    usageCount: number
  }[]
}
