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

// Request Interceptor: Add token into headers
api.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().accessToken

    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }

    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response Interceptor: Handle refresh token with no race condition
type QueueItem = {
  resolve: (value: string | null) => void
  reject: (reason?: unknown) => void
}
let isRefreshing = false
let failedQueue: QueueItem[] = []
// queue of request that failed due to 401 before refresh token
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
// api response interceptor
api.interceptors.response.use(
  (response) => {
    return response
  },
  async (error) => {
    const originalRequest = error.config
    // if request is refresh token request, return error
    if (error.config.url?.includes('/auth/refresh')) {
      return Promise.reject(error)
    }
    // if request is 401 and not retry
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`
            return api(originalRequest)
          })
          .catch((err) => {
            return Promise.reject(err)
          })
      }
      isRefreshing = true
      originalRequest._retry = true
      try {
        const { refreshToken } = useAuthStore.getState()
        const cookiesEnabled = checkCookiesEnabled();
        
        if (!cookiesEnabled && !refreshToken) {
          throw new Error('No refresh token available')
        }

        const refreshReqData = (!cookiesEnabled && refreshToken) ? { refreshToken } : undefined
        const headers = { 'X-Cookies-Enabled': cookiesEnabled ? 'true' : 'false' }
        const res = await apiRaw.post('/auth/refresh', refreshReqData, { headers })
        const newAccess = res.data.data.accessToken
        const newRefresh = res.data.data.refreshToken
        // update token
        useAuthStore.getState().updateTokens(newAccess, newRefresh)
        processQueue(null, newAccess)
        // update header
        error.config.headers.Authorization = `Bearer ${newAccess}`
        // return request again
        return api(error.config)
      } catch (err) {
        processQueue(err, null)
        useAuthStore.getState().logout()
        return Promise.reject(err)
      } finally {
        isRefreshing = false
      }
    }
    return Promise.reject(error)
  }
)
