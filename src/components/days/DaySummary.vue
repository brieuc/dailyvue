<template>
  <StatGrid class="day-stats" :stats="stats" />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import StatGrid from '@/components/StatGrid.vue'
import type { Summary } from '@/composables/useSummary'

const props = defineProps<{ summary: Summary }>()

const stats = computed(() => [
  { label: 'Sport', value: props.summary.sportDuration, unit: 'min' },
  { label: 'Dépensées', value: props.summary.spentKcal, unit: 'kcal' },
  { label: 'Ingérées', value: props.summary.ingestedKcal, unit: 'kcal' },
  { label: 'Alcalories', value: props.summary.drinkingBeer, unit: 'kcal' },
])
</script>

<style scoped>
.day-stats {
  grid-template-columns: repeat(4, 1fr);
}

@media (max-width: 393px) {
  .day-stats {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
