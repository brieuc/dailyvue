<template>
  <div>
    <header class="app-header">
      <div>
        <h1 class="brand">dailymon</h1>
        <p class="models muted">
          <span class="mono">{{ foodModels.length }}</span> food ·
          <span class="mono">{{ sportModels.length }}</span> sport ·
          <span class="mono">{{ freeModels.length }}</span> free
        </p>
      </div>
      <button type="button" class="btn btn-ghost btn-sm" @click="handleLogout">Déconnexion</button>
    </header>

    <main class="periods">
      <PeriodView
        v-for="period in periods"
        :key="period.startDate"
        :start-date="period.startDate"
        :loaded="period.loaded"
      />
    </main>

    <div v-if="hasUnloadedPeriods" class="load-all">
      <button type="button" class="btn btn-secondary" @click="loadAllPeriods">
        Charger toutes les entrées
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted } from 'vue'
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
const { periods, fetchPeriods, loadAllPeriods } = usePeriods()

const hasUnloadedPeriods = computed(() => periods.value.some((period) => !period.loaded))

onMounted(() => {
  clear()
  fetchModels()
  fetchPeriods()
})

// Seule route protégée : la quitter signifie déconnexion ou session expirée.
onUnmounted(resetModels)

const handleLogout = () => {
  logout()
  router.push({ name: 'login' })
}
</script>

<style scoped>
.app-header {
  position: sticky;
  top: 0;
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  margin: 0 -16px 1rem;
  padding: 0.75rem 16px;
  background: rgba(255, 255, 255, 0.78);
  border-bottom: 1px solid var(--line);
  -webkit-backdrop-filter: saturate(160%) blur(14px);
  backdrop-filter: saturate(160%) blur(14px);
}

.brand {
  font-size: 1.25rem;
  font-weight: 300;
  letter-spacing: -0.04em;
  background: var(--gradient);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

.models {
  font-size: 0.75rem;
}

.periods {
  display: flex;
  flex-direction: column;
  gap: 1.75rem;
}

.load-all {
  display: flex;
  justify-content: center;
  margin-top: 1.75rem;
}
</style>
