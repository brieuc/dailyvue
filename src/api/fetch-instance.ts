import router from '@/router'
import { useAuthStore } from '@/stores/auth'

const LOGIN_URL = '/auth/login'

export class ApiError extends Error {
  readonly status: number

  constructor(status: number, statusText: string) {
    super(`HTTP ${status}: ${statusText}`)
    this.name = 'ApiError'
    this.status = status
  }
}

export const customFetch = async <T>(url: string, options?: RequestInit): Promise<T> => {
  const auth = useAuthStore()

  const response = await fetch(`${import.meta.env.VITE_API_URL}${url}`, {
    ...options,
    headers: {
      ...(options?.body instanceof FormData ? {} : { 'Content-Type': 'application/json' }),
      ...(auth.token ? { Authorization: `Bearer ${auth.token}` } : {}),
      ...options?.headers,
    },
  })

  if (!response.ok) {
    // Le backend répond aussi 403 à un login refusé : ce n'est pas une session expirée.
    // Le test sur isAuthenticated évite une redirection par requête en cours.
    const sessionExpired =
      (response.status === 401 || response.status === 403) && url !== LOGIN_URL
    if (sessionExpired && auth.isAuthenticated) {
      auth.clear()
      router.push({ name: 'login', query: { redirect: router.currentRoute.value.fullPath } })
    }
    throw new ApiError(response.status, response.statusText)
  }

  // Un DELETE peut répondre 200 avec un corps vide : response.json() lèverait une erreur.
  const body = await response.text()
  const isJson = response.headers.get('content-type')?.includes('json')
  const data = body && isJson ? JSON.parse(body) : undefined

  return {
    data,
    status: response.status,
    headers: response.headers,
  } as T
}
