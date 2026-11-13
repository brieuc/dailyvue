import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

const STORAGE_KEY = 'token'

export const useAuthStore = defineStore('auth', () => {
  const token = ref<string | null>(localStorage.getItem(STORAGE_KEY))

  const isAuthenticated = computed(() => !!token.value)

  const setSession = (newToken: string) => {
    localStorage.setItem(STORAGE_KEY, newToken)
    token.value = newToken
  }

  const clear = () => {
    localStorage.removeItem(STORAGE_KEY)
    token.value = null
  }

  return { token, isAuthenticated, setSession, clear }
})
