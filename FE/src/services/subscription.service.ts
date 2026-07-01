import { api } from '@/src/lib/axios'
import { ApiResponse } from '@/src/types/api'
import { MySubscriptionResponse, SubscriptionPlanResponse, CreatePaymentResponse } from '@/src/types/subscription'

export const getAllActive = async (): Promise<SubscriptionPlanResponse[]> => {
  const response = await api.get<ApiResponse<SubscriptionPlanResponse[]>>(
    '/subscription-plans/active'
  )
  return response.data.data
}

export const createPayment = async (subscriptionPlanId: string): Promise<CreatePaymentResponse> => {
  const response = await api.post<ApiResponse<CreatePaymentResponse>>('/payments', {
    subscriptionPlanId,
  })
  return response.data.data
}

export const getMyCurrentSubscription = async (): Promise<MySubscriptionResponse> => {
  const response = await api.get<ApiResponse<MySubscriptionResponse>>('/subscriptions/my-current')
  return response.data.data
}
