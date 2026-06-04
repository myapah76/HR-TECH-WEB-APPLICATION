import axios from 'axios'
import { useAuthStore } from '../stores/auth.store'

export const api = axios.create({
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
  },
)

// Response Interceptor: Handle refresh token
api.interceptors.response.use(
  (response) => {
    return response
  },
  async (error) => {
    if (error.response?.status === 401) {
      const res = await api.post('/auth/refresh')
      console.log(res)
      const newAccess = res.data.accessToken
      // update token
      useAuthStore.getState().updateTokens(newAccess)
      // update header
      error.config.headers.Authorization = `Bearer ${newAccess}`
      // return request again
      return api(error.config)
    }
    return Promise.reject(error)
  },
)
