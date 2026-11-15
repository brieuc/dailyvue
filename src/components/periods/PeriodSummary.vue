<template>
  <div class="period-summary">
    <h2 class="title">
      <span class="eyebrow">Semaine</span>
      <span>{{ shortDate(fromDate) }} – {{ shortDate(toDate) }}</span>
    </h2>
    <StatGrid class="period-stats" :stats="stats" />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import StatGrid from '@/components/StatGrid.vue'
import type { Summary } from '@/composables/useSummary'
import { shortDate } from '@/utils/dates'

const props = defineProps<{
  fromDate: string
  toDate: string
  summary: Summary
}>()

const round = (value: number) => Math.round(value * 100) / 100

const stats = computed(() => [
  { label: 'Sport', value: props.summary.sportDuration, unit: 'min' },
  { label: 'Ingérées', value: props.summary.ingestedKcal, unit: 'kcal' },
  { label: 'Dépensées', value: props.summary.spentKcal, unit: 'kcal' },
  { label: 'Alcalories', value: props.summary.drinkingBeer, unit: 'kcal' },
  { label: 'Aérobie', value: round(props.summary.aerobic) },
  { label: 'Anaérobie', value: round(props.summary.anaerobic) },
])
</script>

<style scoped>
.period-summary {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
}

.title {
  display: flex;
  align-items: baseline;
  gap: 0.6rem;
  font-size: 1.05rem;
}

.period-stats {
  grid-template-columns: repeat(3, 1fr);
}
</style>
