// src/composables/useAuth.js  
import { ref } from 'vue';
import { authService } from '@/services/auth.js';

export function useAuth() {
  const isLoggedIn = ref(authService.isLoggedIn());
  const error = ref('');

  const login = async (username, password) => {
    error.value = '';
    try {
      const token = await authService.login(username, password);
      isLoggedIn.value = true;
      return token;
    } catch (err) {
      error.value = err.message;
      throw err;
    }
  };

  const logout = () => {
    authService.logout();
    isLoggedIn.value = false;
  };

  return {
    isLoggedIn,
    error,
    login,
    logout
  };
}