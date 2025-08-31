// src/composables/useAuth.js  
import { ref, computed } from 'vue';
import { authService } from '@/services/auth.js';

// État global partagé (en dehors de la fonction)
const isLoggedIn = ref(authService.isLoggedIn());
const error = ref('');

export {isLoggedIn, error};
export function useAuth() {

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
  }

  return {
    login,
    logout
  };
}