import { api } from '@/src/lib/axios'
import { ApiResponse } from '@/src/types/api'
import { SubscriptionPlanResponse } from '@/src/types/subscription'

export const getAllActive = async (): Promise<ApiResponse<SubscriptionPlanResponse[]>> => {
  const response = await api.get('/subscription-plans/active')
  return response.data
}
