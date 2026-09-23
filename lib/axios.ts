import axios, { type AxiosError } from 'axios'

// Shape of every error our API routes return: { error: { code, message, fields? } }
type ApiErrorBody = {
  error?: { code?: string; message?: string; fields?: Record<string, string> }
}

// One error type for the whole app, so callers can do: catch (e) { e instanceof ApiError }
export class ApiError extends Error {
  status: number
  code: string
  fields?: Record<string, string>

  constructor(status: number, code: string, message: string, fields?: Record<string, string>) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.code = code
    this.fields = fields
  }
}

// Use this from Client Components. The browser sends the login cookie automatically
// because the API is on the same origin, so no token handling is needed here.
export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL ?? '/api/v1',
  timeout: 10_000,
  headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
})

// Turn any failure into an ApiError with a readable message.
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiErrorBody>) => {
    const body = error.response?.data?.error
    console.error('API request failed:', {
      status: error.response?.status,
      code: body?.code ?? error.code,})
    return Promise.reject(
      new ApiError(
        error.response?.status ?? 0,
        body?.code ?? error.code ?? 'network_error',
        body?.message ??
          (error.code === 'ECONNABORTED'
            ? 'The request timed out. Please try again.'
            : 'Network error. Check your connection.'),
        body?.fields
      )
    )
  }
)