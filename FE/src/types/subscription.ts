import { SubscriptionType, ResetType, SubscriptionStatus } from '@/src/enums/subscriptionPlan.enum'
export { SubscriptionType, ResetType, SubscriptionStatus };

export interface SubscriptionPlanResponse {
  id: string
  name: string
  description: string
  price: number
  durationDays: number
  subscriptionType: SubscriptionType
  isActive: boolean
  aiCreditBalance: number
  jobPostBalance?: number
  features: PlanFeature[]
}

export interface PlanFeature {
  code: string
  name: string
  description: string
  aiCreditCost: number
}

export interface SubFeatureRateUsageResponse {
  resetType: ResetType
  capQuota: number
  used: number
  lastResetDate: string
}

export interface SubFeatureUsageResponse {
  featureCode: string
  featureName: string
  aiCreditCost: number
  used: number
  rateLimits: SubFeatureRateUsageResponse[]
}

export interface MySubscriptionResponse {
  id: string
  planId: string
  planName: string
  planPrice: number
  status: SubscriptionStatus
  startDate: string
  endDate: string
  aiCreditBalance: number
  jobPostBalance: number
  featuresUsage: SubFeatureUsageResponse[]
}

export interface CurrentPlanCardProps {
  subscription: MySubscriptionResponse | undefined
  isLoading: boolean
}

export interface CardHeaderProps {
  planName: string
  startDate: string
  endDate: string
}

export interface RenewalAlertsProps {
  subscription: MySubscriptionResponse
}

export interface WalletSectionProps {
  wallets: SubFeatureUsageResponse[]
  subscription: MySubscriptionResponse
}

export interface RateLimitSectionProps {
  rateLimitFeatures: SubFeatureUsageResponse[]
}

export interface StandardFeaturesSectionProps {
  standardFeatures: SubFeatureUsageResponse[]
}

export interface CreatePaymentResponse {
  checkoutUrl: string
  paymentLinkId: string
}

export interface PlanFeatureRequest {
  id: string // Feature ID
  aiCreditCost: number
}

export interface SubscriptionPlanRequest {
  name: string
  description: string
  price: number
  durationDays: number
  subscriptionType: SubscriptionType
  isActive: boolean
  aiCreditBalance: number
  jobPostBalance?: number
  features: PlanFeatureRequest[]
}

export interface FeatureResponse {
  id: string
  code: string
  name: string
  description: string
}
