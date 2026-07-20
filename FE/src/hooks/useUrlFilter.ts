import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { useCallback, useState, useEffect } from 'react'

interface UseUrlFilterOptions {
  keywordKey?: string
  pageKey?: string
  sizeKey?: string
  defaultPage?: number
  defaultSize?: number
}

/**
 * Custom hook quản lý đồng bộ Search/Filter với URL Query Parameters.
 * Giải quyết triệt để vấn đề lag khi gõ phím và lặp lại code đồng bộ URL.
 */
export function useUrlFilter(options: UseUrlFilterOptions = {}) {
  const {
    keywordKey = 'keyword',
    pageKey = 'page',
    sizeKey = 'size',
    defaultPage = 1,
    defaultSize = 10,
  } = options

  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  // 1. Đọc giá trị hiện tại từ URL
  const urlKeyword = searchParams.get(keywordKey) || ''
  const urlPage = parseInt(searchParams.get(pageKey) || String(defaultPage), 10)
  const urlSize = parseInt(searchParams.get(sizeKey) || String(defaultSize), 10)

  // 2. Local state cho input để gõ phím mượt mà (không bị debounce lag)
  const [keywordInput, setKeywordInput] = useState(urlKeyword)

  // 3. Đồng bộ hóa hai chiều khi URL thay đổi từ bên ngoài (VD: nút Back của trình duyệt)
  useEffect(() => {
    setKeywordInput(urlKeyword)
  }, [urlKeyword])

  // 4. Hàm cập nhật URL params tập trung
  const updateUrlParams = useCallback(
    (newParams: Record<string, string | number | undefined | null>) => {
      const params = new URLSearchParams(searchParams.toString())

      Object.entries(newParams).forEach(([key, value]) => {
        if (value === undefined || value === null || value === '') {
          params.delete(key)
        } else {
          params.set(key, String(value).trim())
        }

        // Rule mặc định: Nếu đổi filter hoặc keyword -> tự động reset về page 1
        if (key !== pageKey && key !== sizeKey) {
          params.set(pageKey, '1')
        }
      })

      router.push(`${pathname}?${params.toString()}`)
    },
    [router, pathname, searchParams, pageKey, sizeKey]
  )

  return {
    // Input state
    keywordInput,
    setKeywordInput,
    // URL values
    urlKeyword,
    urlPage,
    urlSize,
    searchParams,
    // Action
    updateUrlParams,
  }
}
