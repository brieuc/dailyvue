<template>
  <h3>Login</h3>
  <form @submit.prevent="handleLogin">
    <table class="center">
      <tbody>
        <tr>
          <td>Username</td>
          <td><input type="text" v-model="credentials.username" required></td>
        </tr>
        <tr>
          <td>Password</td>
          <td><input type="password" v-model="credentials.password" required></td>
        </tr>
      </tbody>
    </table>
    <input type="submit" :disabled="loading" :value="loading ? 'Connexion...' : 'Login'">
    <div v-if="error" class="error">{{ error }}</div>
  </form>
</template>

<script setup>
import { ref, reactive, defineEmits } from 'vue';
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
    console.log("token " + token);
    emit('onGeneratedToken', token);
  } catch (err) {
    console.error('Login failed:', err);
  }
};
</script>