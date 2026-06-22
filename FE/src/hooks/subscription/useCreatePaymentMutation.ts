import { useMutation } from '@tanstack/react-query'
import { createPayment } from '@/src/services/subscription.service'

export const useCreatePaymentMutation = () => {
  return useMutation({
    mutationFn: (planId: string) => createPayment(planId),
  })
}
