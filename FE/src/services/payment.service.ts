import { api } from '@/src/lib/axios'
import { ApiResponse } from '@/src/types/api'
import { PaymentResponse } from '@/src/types/payment'

export const getMyPaymentHistory = async (page: number = 0, size: number = 10): Promise<ApiResponse<any>> => {
  const response = await api.get(`/payments/my-history?page=${page}&size=${size}`)
  return response.data
}
