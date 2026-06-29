import { useMutation, useQueryClient } from '@tanstack/react-query'
import { verifyPaymentStatus } from '@/src/services/payment.service'
import { toast } from 'sonner'

export const useVerifyPaymentMutation = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (orderCode: number) => verifyPaymentStatus(orderCode),
    onSuccess: (res) => {
      toast.success(res.message || 'Xác thực thanh toán thành công!')
      queryClient.invalidateQueries({ queryKey: ['myPaymentHistory'] })
      queryClient.invalidateQueries({ queryKey: ['myCurrentSubscription'] })
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Có lỗi xảy ra khi xác thực thanh toán.')
    }
  })
}
