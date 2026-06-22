import { useQuery } from '@tanstack/react-query'
import { getAllActive } from '@/src/services/subscription.service'

export const useAllActiveSubscriptionPlansQuery = () => {
  return useQuery({
    queryKey: ['subscription-plans'],
    queryFn: getAllActive,
  })
}
