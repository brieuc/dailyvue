<template>
  <div class="period-summary">
    <h2 class="title">
      <span class="eyebrow">Semaine</span>
      <span>{{ shortDate(fromDate) }} – {{ shortDate(toDate) }}</span>
    </h2>
    <div class="stats">
      <div class="stat">
        <span class="stat-label">Sport</span>
        <span class="stat-value">{{ summary.sportDuration }}<small>min</small></span>
      </div>
      <div class="stat">
        <span class="stat-label">Ingérées</span>
        <span class="stat-value">{{ summary.ingestedKcal }}<small>kcal</small></span>
      </div>
      <div class="stat">
        <span class="stat-label">Dépensées</span>
        <span class="stat-value">{{ summary.spentKcal }}<small>kcal</small></span>
      </div>
      <div class="stat">
        <span class="stat-label">Alcalories</span>
        <span class="stat-value">{{ summary.drinkingBeer }}<small>kcal</small></span>
      </div>
      <div class="stat">
        <span class="stat-label">Aérobie</span>
        <span class="stat-value">{{ round(summary.aerobic) }}</span>
      </div>
      <div class="stat">
        <span class="stat-label">Anaérobie</span>
        <span class="stat-value">{{ round(summary.anaerobic) }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { SummaryInfoDto } from '@/api/generated'
import { shortDate } from '@/utils/dates'

defineProps<{
  fromDate: string
  toDate: string
  summary: Required<SummaryInfoDto>
}>()

const round = (value: number) => Math.round(value * 100) / 100
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

.stats {
  grid-template-columns: repeat(3, 1fr);
}
</style>
