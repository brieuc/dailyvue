import { useRouter } from 'vue-router'
import { login, type AuthenticationRequest } from '@/api/generated'
import { useAuthStore } from '@/stores/auth'

export function useAuth() {
  const auth = useAuthStore()
  const router = useRouter()

  /** true si la session est ouverte. Un refus comme une panne réseau donnent false. */
  const doLogin = async (credentials: AuthenticationRequest) => {
    try {
      const { data } = await login(credentials)
      if (!data.token) return false
      auth.setSession(data.token)
      return true
    } catch {
      return false
    }
  }

  const logout = () => {
    auth.clear()
    router.push({ name: 'login' })
  }

  return { doLogin, logout }
}
