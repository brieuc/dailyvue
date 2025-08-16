// src/composables/useAuth.js  
import { ref, computed } from 'vue';
import { authService } from '@/services/auth.js';

// État global partagé (en dehors de la fonction)
const isLoggedIn = ref(authService.isLoggedIn());
const error = ref('');

export function useAuth() {

  const login = async (username, password) => {
    error.value = '';
    try {
      const token = await authService.login(username, password);
      isLoggedIn.value = true;
      console.log("useAuth after login computed " + isLoggedIn.value);
      return token;
    } catch (err) {
      error.value = err.message;
      throw err;
    }
  };

  const logout = () => {
    console.log('useAuth Token supprimé:', Date.now());
    // ✅ Suppression du token - déclenche la réactivité !
    authService.logout();
  }

  return {
    isLoggedIn,
    error,
    login,
    logout
  };
}