'use client'

import { QueryCache, QueryClient, QueryClientProvider, MutationCache } from '@tanstack/react-query'
import { useState } from 'react'
import { getErrorMessage } from '@/src/utils/get-error-message'
import { toast } from 'sonner'

export default function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 1000 * 60, // 1 phút
          },
        },
        // Bắt lỗi toàn cục cho useQuery
        queryCache: new QueryCache({
          onError: (error) => {
            toast.error(getErrorMessage(error))
          },
        }),
        // Bắt lỗi toàn cục cho useMutation
        mutationCache: new MutationCache({
          onError: (error) => {
            toast.error(getErrorMessage(error))
          },
        }),
      })
  )

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
}
