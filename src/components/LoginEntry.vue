<template>
  <div class="login-container">
    <h3>Login</h3>
    <form @submit.prevent="handleLogin">
      <table class="login-table">
        <tbody>
          <tr>
            <td class="label">Username:</td>
            <td class="input-cell">
              <input 
                type="text" 
                v-model="credentials.username" 
                required
                class="login-input"
                placeholder="Entrez votre nom d'utilisateur"
              >
            </td>
          </tr>
          <tr>
            <td class="label">Password:</td>
            <td class="input-cell">
              <input 
                type="password" 
                v-model="credentials.password" 
                required
                class="login-input"
                placeholder="Entrez votre mot de passe"
              >
            </td>
          </tr>
        </tbody>
      </table>
      
      <div class="button-container">
        <input 
          type="submit" 
          :disabled="loading" 
          :value="loading ? 'Connexion...' : 'Se connecter'"
          class="login-button"
        >
      </div>
      
      <div v-if="error" class="error-message">{{ error }}</div>
    </form>
  </div>
</template>

<script setup>
import { reactive, defineEmits } from 'vue';
import { useAuth } from '@/composables/useAuth.js';

const emit = defineEmits(['onGeneratedToken']);

const { login, loading, error } = useAuth();

const credentials = reactive({
  username: '',
  password: ''
});

const handleLogin = async () => {
  try {
    const token = await login(credentials.username, credentials.password);
    console.log("LoginEntry handleLogin " + token);
    emit('onGeneratedToken', token);
  } catch (err) {
    console.error('Login failed:', err);
  }
};
</script>

<style scoped>
.login-container {
  max-width: 400px;
  margin: 2rem auto;
  padding: 2rem;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
}

.login-container h3 {
  margin-bottom: 1.5rem;
  color: #333;
  font-size: 1.5rem;
  font-weight: 600;
}

.login-table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0 10px;
  margin-bottom: 1.5rem;
}

.label {
  text-align: right;
  padding-right: 15px;
  font-weight: 500;
  color: #555;
  white-space: nowrap;
  vertical-align: middle;
  width: 30%;
}

.input-cell {
  width: 70%;
}

.login-input {
  width: 100%;
  padding: 12px 16px;
  border: 2px solid #e1e5e9;
  border-radius: 8px;
  font-size: 16px;
  transition: all 0.3s ease;
  background: white;
  box-sizing: border-box;
}

.login-input:focus {
  outline: none;
  border-color: #4B91F7;
  box-shadow: 0 0 0 3px rgba(75, 145, 247, 0.1);
}

.login-input::placeholder {
  color: #aaa;
  font-style: italic;
}

.button-container {
  text-align: center;
  margin-bottom: 1rem;
}

.login-button {
  padding: 12px 24px;
  background: linear-gradient(180deg, #4B91F7 0%, #367AF6 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  min-width: 140px;
}

.login-button:hover:not(:disabled) {
  background: linear-gradient(180deg, #367AF6 0%, #2968E5 100%);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(75, 145, 247, 0.3);
}

.login-button:disabled {
  background: #ccc;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.error-message {
  background: #fee;
  color: #c33;
  padding: 10px;
  border-radius: 6px;
  border: 1px solid #fcc;
  text-align: center;
  font-size: 14px;
}

/* Responsive design */
@media only screen and (max-width: 480px) {
  .login-container {
    margin: 1rem;
    padding: 1.5rem;
  }
  
  .login-table {
    border-spacing: 0 8px;
  }
  
  .label {
    padding-right: 10px;
    font-size: 14px;
  }
  
  .login-input {
    padding: 10px 12px;
    font-size: 16px; /* Évite le zoom sur iOS */
  }
}
</style>