'use client'

import { QueryCache, QueryClient, QueryClientProvider, MutationCache } from '@tanstack/react-query'
import { useState } from 'react'
import { getErrorMessage, isBlockedLoginError, isCvAlreadyExistsError } from '@/src/utils'
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
            if (isBlockedLoginError(error) || isCvAlreadyExistsError(error)) return
            toast.error(getErrorMessage(error))
          },
        }),
      })
  )

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
}
