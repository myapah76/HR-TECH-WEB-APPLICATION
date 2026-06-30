import { useMutation, useQueryClient } from '@tanstack/react-query'
import { verifyPaymentStatus } from '@/src/services/payment.service'

export const useVerifyPaymentMutation = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (orderCode: number) => verifyPaymentStatus(orderCode),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myPaymentHistory'] })
      queryClient.invalidateQueries({ queryKey: ['myCurrentSubscription'] })
    },
  })
}
