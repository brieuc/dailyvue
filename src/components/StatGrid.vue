<template>
  <div class="stats">
    <div v-for="stat in stats" :key="stat.label" class="stat">
      <span class="stat-label">{{ stat.label }}</span>
      <span class="stat-value">{{ stat.value }}<small v-if="stat.unit">{{ stat.unit }}</small></span>
    </div>
  </div>
</template>

<script setup lang="ts">
export interface Stat {
  label: string
  value: number
  unit?: string
}

// Le nombre de colonnes se règle dans le style scoped du parent, qui atteint cet élément racine.
defineProps<{ stats: Stat[] }>()
</script>
