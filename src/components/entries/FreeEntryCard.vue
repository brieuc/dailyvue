<template>
  <div class="entry-card">
    <div class="entry-head">
      <span class="dot free"></span>
      <div class="entry-titles">
        <h3 class="entry-title">{{ entry.title }}</h3>
        <p v-if="entry.foodType || entry.kcal" class="entry-meta">
          <span v-if="entry.foodType">{{ FOOD_TYPE_LABELS[entry.foodType] }}</span>
          <span v-if="entry.foodType && entry.kcal"> · </span>
          <span v-if="entry.kcal" class="mono">{{ entry.kcal }} kcal</span>
        </p>
      </div>
    </div>
    <p v-if="entry.description" class="entry-desc">{{ entry.description }}</p>
  </div>
</template>

<script setup lang="ts">
import { FOOD_TYPE_LABELS, type FreeEntry } from '@/types/entries'

defineProps<{ entry: FreeEntry }>()
</script>
