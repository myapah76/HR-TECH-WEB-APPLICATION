export interface PaymentResponse {
  orderCode: number
  amount: number
  status: 'PENDING' | 'PAID' | 'CANCELLED'
  subscriptionName: string
  createdAt: string
}
