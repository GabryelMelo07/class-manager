import axios from 'axios'
import { getAccessToken, getRefreshToken, setTokens, clearTokens } from '@/lib/auth'

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080'

const api = axios.create({
  baseURL: BASE_URL,
})

let isRefreshing = false
let failedQueue: {
  resolve: (value?: any) => void
  reject: (reason?: any) => void
}[] = []

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error)
    } else {
      prom.resolve(token)
    }
  })
  failedQueue = []
}

api.interceptors.request.use(config => {
  const token = getAccessToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config

    const shouldRefresh =
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url.includes('/auth/refresh-token')

    if (!shouldRefresh) {
      return Promise.reject(error)
    }

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({
          resolve: (token: string) => {
            originalRequest.headers.Authorization = `Bearer ${token}`
            resolve(api(originalRequest))
          },
          reject: reject,
        })
      })
    }

    originalRequest._retry = true
    isRefreshing = true

    const accessToken = getAccessToken()
    const refreshToken = getRefreshToken()

    if (!accessToken || !refreshToken) {
      clearTokens()
      window.location.href = '/login'
      return Promise.reject(error)
    }

    try {
      const response = await api.post('/api/v1/auth/refresh-token', {
        accessToken,
        refreshToken,
      })

      const { accessToken: newAccessToken, refreshToken: newRefreshToken } = response.data
      setTokens(newAccessToken, newRefreshToken)

      processQueue(null, newAccessToken)

      originalRequest.headers.Authorization = `Bearer ${newAccessToken}`
      return api(originalRequest)
    } catch (err: any) {
      processQueue(err, null)

      if (
        err.response?.status === 400 ||
        err.response?.status === 401 ||
        err.response?.status === 403 ||
        err.response?.status === 500
      ) {
        clearTokens()
        window.location.href = '/login'
      }

      return Promise.reject(err)
    } finally {
      isRefreshing = false
    }
  }
)

export default api
