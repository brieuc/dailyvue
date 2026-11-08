<template>
  <h4 style="color: blueviolet;">Du {{ fromDate }} au {{ toDate }}</h4>
  <div class="flex-summary">
    <div class="summary-item">Activités sportives {{ summary.sportDuration }} min</div>
    <div class="summary-item">Calories ingérées {{ summary.ingestedKcal }} kcal</div>
    <div class="summary-item">Calories dépensées {{ summary.spentKcal }} kcal</div>
    <div class="summary-item">Alcalories {{ summary.drinkingBeer }} kcal</div>
    <div class="summary-item">Aerobic {{ round(summary.aerobic) }}</div>
    <div class="summary-item">Anaerobic {{ round(summary.anaerobic) }}</div>
  </div>
</template>

<script setup lang="ts">
import type { SummaryInfoDto } from '@/api/generated'

defineProps<{
  fromDate: string
  toDate: string
  summary: Required<SummaryInfoDto>
}>()

const round = (value: number) => Math.round(value * 100) / 100
</script>

<style scoped>
.flex-summary {
  display: flex;
  justify-content: space-evenly;
  flex-wrap: wrap;
  gap: 0.5rem;
  padding-bottom: 0.5rem;
}

.summary-item {
  background-color: rgba(240, 240, 240, 0.3);
  border-radius: 4px;
  padding: 5px 10px;
  margin: 2px;
  border: 1px solid rgba(220, 220, 220, 0.2);
  font-size: 0.8rem;
  text-align: center;
  min-width: 120px;
  color: #666;
}
</style>
