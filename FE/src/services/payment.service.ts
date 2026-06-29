import { api } from '@/src/lib/axios'
import { ApiResponse, PageResponse } from '@/src/types/api'
import { PaymentResponse } from '@/src/types/payment'

export const getMyPaymentHistory = async (
  page: number = 0,
  size: number = 10
): Promise<ApiResponse<PageResponse<PaymentResponse>>> => {
  const response = await api.get(`/payments/my-history?page=${page}&size=${size}`)
  return response.data
}

export const verifyPaymentStatus = async (
  orderCode: number
): Promise<ApiResponse<PaymentResponse>> => {
  const response = await api.post(`/payments/${orderCode}/verify`)
  return response.data
}
