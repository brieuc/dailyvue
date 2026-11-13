<template>
  <div class="login">
    <h1 class="brand">dailymon</h1>
    <form class="login-card card" @submit.prevent="handleLogin">
      <label class="field">
        <span class="field-label">Utilisateur</span>
        <input
          v-model="credentials.username"
          type="text"
          class="input"
          autocomplete="username"
          autocapitalize="none"
          required
        >
      </label>
      <label class="field">
        <span class="field-label">Mot de passe</span>
        <input
          v-model="credentials.password"
          type="password"
          class="input"
          autocomplete="current-password"
          required
        >
      </label>

      <p v-if="error" class="error" role="alert">{{ error }}</p>

      <button type="submit" class="btn btn-primary btn-block" :disabled="loading">
        {{ loading ? 'Connexion…' : 'Se connecter' }}
      </button>
    </form>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuth } from '@/composables/useAuth'

const { doLogin } = useAuth()
const route = useRoute()
const router = useRouter()

const loading = ref(false)
const error = ref('')

const credentials = reactive({
  username: '',
  password: '',
})

const handleLogin = async () => {
  error.value = ''
  loading.value = true
  try {
    if (await doLogin(credentials)) {
      const redirect = route.query.redirect
      router.push(typeof redirect === 'string' ? redirect : '/')
    } else {
      error.value = 'Identifiants refusés'
    }
  } catch {
    error.value = 'Identifiants refusés'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
  padding-top: 18vh;
}

.brand {
  font-size: 2rem;
  font-weight: 300;
  letter-spacing: -0.04em;
  background: var(--gradient);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

.login-card {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  width: 100%;
  max-width: 360px;
  padding: 1.5rem;
  border-radius: var(--r-lg);
  box-shadow: var(--lift-strong);
}

.error {
  color: var(--c-negative);
  font-size: 0.82rem;
}
</style>
