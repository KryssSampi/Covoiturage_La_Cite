import { backend } from "./backend"
import { getAccessToken, setAccessToken, clearAccessToken } from "../auth/token"

let isRefreshing = false
let failedQueue: any[] = []

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

backend.interceptors.request.use(config => {
  const token = getAccessToken()

  if (token) {
    config.headers = config.headers || {}
    config.headers.Authorization = `Bearer ${token}`
  }

  return config
})

backend.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config
if (
  error.response?.status === 401 &&
  !originalRequest._retry &&
  !originalRequest.url?.includes("/Auth/refresh")
) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        })
          .then(token => {
            originalRequest.headers = originalRequest.headers || {}
            originalRequest.headers.Authorization = `Bearer ${token}`
            return backend(originalRequest)
          })
          .catch(err => Promise.reject(err))
      }

      originalRequest._retry = true
      isRefreshing = true

      try {
        const res = await backend.post("/api/Auth/refresh")

        const newToken = res.data.accessToken

        setAccessToken(newToken)
        processQueue(null, newToken)

        originalRequest.headers = originalRequest.headers || {}
       originalRequest.headers.Authorization = `Bearer ${newToken}`
        return backend(originalRequest)
      } catch (err) {
        processQueue(err, null)
        clearAccessToken()
        window.location.href = "/login"
        return Promise.reject(err)
      } finally {
        isRefreshing = false
      }
    }

    return Promise.reject(error)
  }
)