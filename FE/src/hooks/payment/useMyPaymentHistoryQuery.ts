import { useQuery } from '@tanstack/react-query'
import { getMyPaymentHistory } from '@/src/services/payment.service'

export const useMyPaymentHistoryQuery = (page: number = 0, size: number = 10, enabled: boolean = true) => {
  return useQuery({
    queryKey: ['myPaymentHistory', page, size],
    queryFn: () => getMyPaymentHistory(page, size),
    enabled
  })
}
