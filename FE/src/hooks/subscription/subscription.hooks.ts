import { useQuery, useMutation } from '@tanstack/react-query'
import { getAllActive, createPayment } from '@/src/services/subscription.service'

export const useAllActiveSubscriptionPlansQuery = () => {
  return useQuery({
    queryKey: ['subscription-plans'],
    queryFn: getAllActive,
  })
}

export const useCreatePaymentMutation = () => {
  return useMutation({
    mutationFn: (planId: string) => createPayment(planId),
  })
}
