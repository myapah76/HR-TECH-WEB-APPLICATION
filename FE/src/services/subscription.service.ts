import { api } from '@/src/lib/axios'
import { ApiResponse } from '@/src/types/api'
import { SubscriptionPlanResponse } from '@/src/types/subscription'

export interface CreatePaymentResponse {
  checkoutUrl: string
  paymentLinkId: string
}

export const getAllActive = async (): Promise<ApiResponse<SubscriptionPlanResponse[]>> => {
  const response = await api.get('/subscription-plans/active')
  return response.data
}

export const createPayment = async (subscriptionPlanId: string): Promise<ApiResponse<CreatePaymentResponse>> => {
  const response = await api.post('/payments', { subscriptionPlanId })
  return response.data
}
