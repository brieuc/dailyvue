<template>
  <div class="stats">
    <div class="stat">
      <span class="stat-label">Sport</span>
      <span class="stat-value">{{ summary.sportDuration }}<small>min</small></span>
    </div>
    <div class="stat">
      <span class="stat-label">Dépensées</span>
      <span class="stat-value">{{ summary.spentKcal }}<small>kcal</small></span>
    </div>
    <div class="stat">
      <span class="stat-label">Ingérées</span>
      <span class="stat-value">{{ summary.ingestedKcal }}<small>kcal</small></span>
    </div>
    <div class="stat">
      <span class="stat-label">Alcalories</span>
      <span class="stat-value">{{ summary.drinkingBeer }}<small>kcal</small></span>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { SummaryInfoDto } from '@/api/generated'

defineProps<{ summary: Required<SummaryInfoDto> }>()
</script>

<style scoped>
.stats {
  grid-template-columns: repeat(4, 1fr);
}

@media (max-width: 393px) {
  .stats {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
