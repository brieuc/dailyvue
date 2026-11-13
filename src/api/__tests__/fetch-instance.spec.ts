import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { ApiError, customFetch } from '@/api/fetch-instance'
import { useAuthStore } from '@/stores/auth'

const { push } = vi.hoisted(() => ({ push: vi.fn() }))

vi.mock('@/router', () => ({
  default: { push, currentRoute: { value: { fullPath: '/' } } },
}))

const respond = (status: number, body = '', contentType = 'application/json') => {
  vi.stubGlobal(
    'fetch',
    vi.fn().mockResolvedValue(new Response(status === 204 ? null : body, {
      status,
      headers: { 'content-type': contentType },
    })),
  )
}

describe('customFetch', () => {
  beforeEach(() => {
    localStorage.clear()
    push.mockClear()
    setActivePinia(createPinia())
  })

  it('parse une réponse JSON', async () => {
    respond(200, '{"token":"abc"}')
    const response = await customFetch<{ data: { token: string } }>('/x')
    expect(response.data.token).toBe('abc')
  })

  it('accepte un 200 sans corps', async () => {
    respond(200)
    const response = await customFetch<{ data: unknown; status: number }>('/entry/1')
    expect(response.data).toBeUndefined()
    expect(response.status).toBe(200)
  })

  it('accepte un 204', async () => {
    respond(204)
    const response = await customFetch<{ data: unknown }>('/entry/1')
    expect(response.data).toBeUndefined()
  })

  it('envoie le token', async () => {
    useAuthStore().setSession('secret')
    respond(200, '{}')
    await customFetch('/x')
    const [, init] = vi.mocked(fetch).mock.calls[0] as [string, RequestInit]
    expect(init.headers).toMatchObject({ Authorization: 'Bearer secret' })
  })

  it('lève une ApiError si la réponse échoue, sans déconnecter', async () => {
    useAuthStore().setSession('secret')
    respond(500)
    await expect(customFetch('/x')).rejects.toBeInstanceOf(ApiError)
    expect(useAuthStore().isAuthenticated).toBe(true)
    expect(push).not.toHaveBeenCalled()
  })

  it.each([401, 403])('déconnecte et redirige sur un %i', async (status) => {
    useAuthStore().setSession('secret')
    respond(status)
    await expect(customFetch('/x')).rejects.toMatchObject({ status })
    expect(useAuthStore().isAuthenticated).toBe(false)
    expect(localStorage.getItem('token')).toBeNull()
    expect(push).toHaveBeenCalledWith({ name: 'login', query: { redirect: '/' } })
  })

  it('ne redirige qu’une fois si plusieurs requêtes expirent', async () => {
    useAuthStore().setSession('secret')
    respond(403)
    await expect(customFetch('/a')).rejects.toBeInstanceOf(ApiError)
    respond(403)
    await expect(customFetch('/b')).rejects.toBeInstanceOf(ApiError)
    expect(push).toHaveBeenCalledTimes(1)
  })

  it('ne traite pas un login refusé comme une session expirée', async () => {
    respond(403)
    await expect(customFetch('/auth/login')).rejects.toMatchObject({ status: 403 })
    expect(push).not.toHaveBeenCalled()
  })
})
