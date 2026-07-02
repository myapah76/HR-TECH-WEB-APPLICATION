import { api } from '@/src/lib/axios'
import { ApiResponse } from '@/src/types/api'
import {
  SubscriptionPlanResponse,
  SubscriptionPlanRequest,
  FeatureResponse,
} from '@/src/types/subscription'

// Get all plans (Admin)
export const getAllSubscriptionPlans = async (): Promise<SubscriptionPlanResponse[]> => {
  const response = await api.get<ApiResponse<SubscriptionPlanResponse[]>>('/subscription-plans')
  return response.data.data
}

// Get active plans (Public)
export const getActiveSubscriptionPlans = async (): Promise<SubscriptionPlanResponse[]> => {
  const response = await api.get<ApiResponse<SubscriptionPlanResponse[]>>(
    '/subscription-plans/active'
  )
  return response.data.data
}

// Create new plan
export const createSubscriptionPlan = async (
  data: SubscriptionPlanRequest
): Promise<SubscriptionPlanResponse> => {
  const response = await api.post<ApiResponse<SubscriptionPlanResponse>>(
    '/subscription-plans',
    data
  )
  return response.data.data
}

// Update plan
export const updateSubscriptionPlan = async (
  id: string,
  data: SubscriptionPlanRequest
): Promise<SubscriptionPlanResponse> => {
  const response = await api.put<ApiResponse<SubscriptionPlanResponse>>(
    `/subscription-plans/${id}`,
    data
  )
  return response.data.data
}

// Delete plan
export const deleteSubscriptionPlan = async (id: string): Promise<void> => {
  await api.delete<ApiResponse<void>>(`/subscription-plans/${id}`)
}

// Get all features
export const getAllFeatures = async (): Promise<FeatureResponse[]> => {
  const response = await api.get<ApiResponse<FeatureResponse[]>>('/features')
  return response.data.data
}
