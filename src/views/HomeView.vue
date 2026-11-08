<template>
  <div>
    <table style="margin: auto; border: 1px; border-style: dashed;">
      <tbody>
        <tr>
          <td>food models</td><td>{{ foodModels.length }}</td>
          <td>sport models</td><td>{{ sportModels.length }}</td>
          <td>free models</td><td>{{ freeModels.length }}</td>
        </tr>
      </tbody>
    </table>
    <button class="logout-btn" @click="handleLogout">Déconnexion</button>

    <button class="button-10" @click="loadAllPeriods">
      Charger toutes les entrées
    </button>

    <div v-for="period in periods" :key="period.startDate">
      <PeriodView :start-date="period.startDate" :loaded="period.loaded" />
      <p></p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import PeriodView from '@/components/periods/PeriodView.vue'
import { useAuth } from '@/composables/useAuth'
import { useModels } from '@/composables/useModels'
import { useNotification } from '@/composables/useNotification'
import { usePeriods } from '@/composables/usePeriods'

const router = useRouter()
const { logout } = useAuth()
const { clear } = useNotification()
const { foodModels, sportModels, freeModels, fetchModels, resetModels } = useModels()
const { periods, fetchPeriods, loadAllPeriods, resetPeriods } = usePeriods()

onMounted(() => {
  clear()
  fetchModels()
  fetchPeriods()
})

// Seule route protégée : la quitter signifie déconnexion ou session expirée.
onUnmounted(() => {
  resetModels()
  resetPeriods()
})

const handleLogout = () => {
  logout()
  router.push({ name: 'login' })
}
</script>
