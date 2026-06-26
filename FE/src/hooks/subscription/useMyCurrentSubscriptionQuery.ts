import { useQuery } from '@tanstack/react-query'
import { getMyCurrentSubscription } from '@/src/services/subscription.service'

export const useMyCurrentSubscriptionQuery = (isAuthenticated: boolean) => {
  return useQuery({
    queryKey: ['myCurrentSubscription'],
    queryFn: () => getMyCurrentSubscription(),
    enabled: isAuthenticated,
    retry: false
  })
}
