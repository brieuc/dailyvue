<template>
  <div class="entry-card">
    <div class="entry-head">
      <span class="dot food"></span>
      <div class="entry-titles">
        <h3 class="entry-title">{{ entry.title }}</h3>
        <p v-if="entry.model" class="entry-meta mono">
          {{ entry.quantity }} × {{ entry.model.kcal ?? 0 }} kcal
        </p>
      </div>
      <span v-if="entry.model" class="total mono">
        {{ entry.quantity * (entry.model.kcal ?? 0) }}<small>kcal</small>
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { FoodEntry } from '@/types/entries'

defineProps<{ entry: FoodEntry }>()
</script>

<style scoped>
.total {
  flex: none;
  margin-left: auto;
  font-size: 0.85rem;
  font-weight: 500;
  color: var(--c-text-soft);
}

.total small {
  margin-left: 0.15rem;
  font-size: 0.68rem;
  color: var(--c-text-muted);
}
</style>
