import { api } from '@/src/lib/axios'
import { ApiResponse, PageResponse } from '@/src/types/api'
import { PaymentResponse } from '@/src/types/payment'

export const getMyPaymentHistory = async (
  page: number = 0,
  size: number = 10
): Promise<PageResponse<PaymentResponse>> => {
  const response = await api.get<ApiResponse<PageResponse<PaymentResponse>>>(`/payments/my-history?page=${page}&size=${size}`)
  return response.data.data
}

export const verifyPaymentStatus = async (
  orderCode: number
): Promise<PaymentResponse> => {
  const response = await api.post<ApiResponse<PaymentResponse>>(`/payments/${orderCode}/verify`)
  return response.data.data
}
