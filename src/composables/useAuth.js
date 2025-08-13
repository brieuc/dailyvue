// src/composables/useAuth.js  
import { ref, computed } from 'vue';
import { authService } from '@/services/auth.js';

export function useAuth() {
  const token = ref(localStorage.getItem('token'))
  const isLoggedIn = computed(() => !!token.value)
  const error = ref('');

  const login = async (username, password) => {
    error.value = '';
    try {
      const data = await authService.login(username, password);
      token.value = data;
      return data;
    } catch (err) {
      error.value = err.message;
      throw err;
    }
  };

  const logout = () => {
    console.log('useAuth Token supprimé:', Date.now());
    // ✅ Suppression du token - déclenche la réactivité !
    token.value = null
    authService.logout();
  }
  
  const getToken = () => token.value;

  return {
    isLoggedIn,
    error,
    login,
    logout,
    getToken
  };
}