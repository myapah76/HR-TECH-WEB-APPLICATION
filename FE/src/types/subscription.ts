import { SubscriptionType } from '@/src/enums/subcriptionPlan.enum'

export interface SubscriptionPlanResponse {
  id: string
  name: string
  description: string
  price: number
  durationDays: number
  subscriptionType: SubscriptionType
  isActive: boolean
  features: PlanFeature[]
}

export interface PlanFeature {
  code: string
  name: string
  description: string
  quota: number
}

export interface SubFeatureRateUsageResponse {
  resetType: 'DAILY' | 'WEEKLY'
  capQuota: number
  used: number
  lastResetDate: string
}

export interface SubFeatureUsageResponse {
  featureCode: string
  featureName: string
  quota: number
  used: number
  rateLimits: SubFeatureRateUsageResponse[]
}

export interface MySubscriptionResponse {
  id: string
  planId: string
  planName: string
  planPrice: number
  status: string
  startDate: string
  endDate: string
  featuresUsage: SubFeatureUsageResponse[]
}
