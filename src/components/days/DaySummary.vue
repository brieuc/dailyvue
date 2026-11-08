<template>
  <div class="flex-summary-day">
    <div>⛹️‍♂️ {{ summary.sportDuration }} min</div>
    <div>🏋🏻‍♂️{{ summary.spentKcal }}</div>
    <div>🍕 {{ summary.ingestedKcal }}</div>
    <div>🍺 {{ summary.drinkingBeer }}</div>
  </div>
</template>

<script setup lang="ts">
import type { SummaryInfoDto } from '@/api/generated'

defineProps<{ summary: Required<SummaryInfoDto> }>()
</script>

<style scoped>
.flex-summary-day {
  display: flex;
  justify-content: space-evenly;
  flex-wrap: wrap;
  gap: 0.1rem;
  height: fit-content;
  background-color: rebeccapurple;
  color: beige;
  font-size: 1rem;
}
</style>
