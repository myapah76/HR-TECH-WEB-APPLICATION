import axios from 'axios'
import { useAuthStore } from '../stores/auth.store'
import { checkCookiesEnabled } from './utils'

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
})

export const apiRaw = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
})

type QueueItem = {
  resolve: (value: string | null) => void
  reject: (reason?: unknown) => void
}

let isRefreshing = false
let failedQueue: QueueItem[] = []

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach((item) => {
    if (error) {
      item.reject(error)
    } else {
      item.resolve(token)
    }
  })
  failedQueue = []
}

const performRefreshToken = async (): Promise<string | null> => {
  if (isRefreshing) {
    return new Promise((resolve, reject) => {
      failedQueue.push({ resolve, reject })
    })
  }

  isRefreshing = true
  try {
    const { refreshToken } = useAuthStore.getState()
    const cookiesEnabled = checkCookiesEnabled()

    if (!cookiesEnabled && !refreshToken) {
      throw new Error('No refresh token available')
    }

    const refreshReqData = !cookiesEnabled && refreshToken ? { refreshToken } : undefined
    const headers = { 'X-Cookies-Enabled': cookiesEnabled ? 'true' : 'false' }
    const res = await apiRaw.post('/auth/refresh', refreshReqData, { headers })
    const newAccess = res.data.data.accessToken
    const newRefresh = res.data.data.refreshToken

    useAuthStore.getState().updateTokens(newAccess, newRefresh)
    processQueue(null, newAccess)
    return newAccess
  } catch (err) {
    processQueue(err, null)
    useAuthStore.getState().logout()
    throw err
  } finally {
    isRefreshing = false
  }
}

const isTokenAboutToExpire = (token: string) => {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]))
    // Buffer time: 30 seconds
    return payload.exp * 1000 < Date.now() + 30000
  } catch {
    return false
  }
}

// Request Interceptor: Pre-flight check & Add token
api.interceptors.request.use(
  async (config) => {
    let token = useAuthStore.getState().accessToken

    if (token && isTokenAboutToExpire(token)) {
      try {
        const newToken = await performRefreshToken()
        if (newToken) token = newToken
      } catch (err) {
        // If refresh fails, let it continue. It will hit 401 later.
        console.warn('Pre-flight token refresh failed:', err)
      }
    }

    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }

    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response Interceptor: Handle unexpected 401s
api.interceptors.response.use(
  (response) => {
    return response
  },
  async (error) => {
    const originalRequest = error.config

    if (error.config?.url?.includes('/auth/refresh')) {
      return Promise.reject(error)
    }

    if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
      originalRequest._retry = true
      try {
        const newAccess = await performRefreshToken()
        if (newAccess) {
          originalRequest.headers.Authorization = `Bearer ${newAccess}`
          return api(originalRequest)
        }
      } catch (err) {
        return Promise.reject(err)
      }
    }
    return Promise.reject(error)
  }
)
