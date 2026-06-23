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
