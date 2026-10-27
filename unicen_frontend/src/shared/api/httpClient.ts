import axios from 'axios'

export const TOKEN_KEY = 'unicen_token'
export const UNAUTHORIZED_EVENT = 'auth:unauthorized'

const LOGIN_PATH = '/auth/login'

/**
 * Single Axios instance. Injects the opaque bearer token (JWT or PASETO)
 * and signals session expiry on any 401 outside the login endpoint.
 */
export const httpClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: { 'Content-Type': 'application/json' },
})

httpClient.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY)
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

httpClient.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    // A failed login is a 401 too, but there is no session to close.
    const isLoginRequest = axios.isAxiosError(error) && error.config?.url === LOGIN_PATH
    if (axios.isAxiosError(error) && error.response?.status === 401 && !isLoginRequest) {
      window.dispatchEvent(new Event(UNAUTHORIZED_EVENT))
    }
    return Promise.reject(error)
  },
)
