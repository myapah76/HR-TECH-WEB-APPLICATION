import { QueryClient, QueryCache, MutationCache } from '@tanstack/react-query'
import { getErrorMessage, isBlockedLoginError, isCvAlreadyExistsError } from '@/src/utils'
import { toast } from 'sonner'

/**
 * Singleton QueryClient – dùng chung toàn app.
 * Được export để auth.store có thể gọi queryClient.clear() khi logout
 * mà không cần import từ React provider.
 *
 * Lưu ý: toast từ sonner hoạt động độc lập với React context,
 * nên hoàn toàn an toàn khi dùng ở module-level này.
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60, // 1 phút
    },
  },
  queryCache: new QueryCache({
    onError: (error) => {
      toast.error(getErrorMessage(error))
    },
  }),
  mutationCache: new MutationCache({
    onError: (error) => {
      if (isBlockedLoginError(error) || isCvAlreadyExistsError(error)) return
      toast.error(getErrorMessage(error))
    },
  }),
})
