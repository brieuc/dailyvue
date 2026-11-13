<template>
  <div class="entry-card">
    <div class="entry-head">
      <span class="dot sport"></span>
      <div class="entry-titles">
        <h3 class="entry-title">{{ entry.title }}</h3>
        <p v-if="entry.model" class="entry-meta">
          {{ entry.model.title }}<template v-if="entry.model.sport"> · {{ SPORT_LABELS[entry.model.sport] }}</template>
        </p>
      </div>
    </div>
    <p v-if="entry.description" class="entry-desc">{{ entry.description }}</p>
    <div class="stats">
      <div class="stat">
        <span class="stat-label">Durée</span>
        <span class="stat-value">{{ entry.duration ?? '—' }}<small>min</small></span>
      </div>
      <div class="stat">
        <span class="stat-label">Calories</span>
        <span class="stat-value">{{ entry.kcal ?? '—' }}<small>kcal</small></span>
      </div>
      <div class="stat">
        <span class="stat-label">Aérobie</span>
        <span class="stat-value">{{ entry.aerobic ?? '—' }}</span>
      </div>
      <div class="stat">
        <span class="stat-label">Anaérobie</span>
        <span class="stat-value">{{ entry.anaerobic ?? '—' }}</span>
      </div>
    </div>
    <p v-if="entry.benefit" class="entry-meta">Bénéfice : {{ BENEFIT_LABELS[entry.benefit] }}</p>
  </div>
</template>

<script setup lang="ts">
import { BENEFIT_LABELS, SPORT_LABELS, type SportEntry } from '@/types/entries'

defineProps<{ entry: SportEntry }>()
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
