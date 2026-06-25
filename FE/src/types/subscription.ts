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

export interface SubFeatureUsageResponse {
  featureCode: string
  featureName: string
  quota: number
  used: number
}

export interface MySubscriptionResponse {
  id: string
  planId: string
  planName: string
  status: string
  startDate: string
  endDate: string
  featuresUsage: SubFeatureUsageResponse[]
}
