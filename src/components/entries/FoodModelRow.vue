<template>
  <div class="row" :class="{ active: quantity > 0 }">
    <div class="info">
      <span class="title">{{ model.title }}</span>
      <span v-if="model.kcal != null" class="kcal mono">{{ model.kcal }} kcal</span>
    </div>
    <div class="stepper">
      <button
        type="button"
        class="btn btn-secondary btn-icon"
        aria-label="Retirer"
        :disabled="quantity === 0"
        @click="emit('sub')"
      >
        −
      </button>
      <span class="quantity mono" aria-live="polite">{{ quantity }}</span>
      <button type="button" class="btn btn-secondary btn-icon" aria-label="Ajouter" @click="emit('add')">
        +
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ModelFoodDto } from '@/api/generated'

defineProps<{
  model: ModelFoodDto
  quantity: number
}>()
const emit = defineEmits<{ add: []; sub: [] }>()
</script>

<style scoped>
.row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  padding: 0.5rem 0.25rem 0.5rem 0.75rem;
  border-radius: var(--r-sm);
}

.row.active {
  background: rgba(217, 130, 43, 0.08);
}

.info {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.title {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 0.92rem;
}

.kcal {
  font-size: 0.72rem;
  color: var(--c-text-muted);
}

.stepper {
  display: flex;
  flex: none;
  align-items: center;
  gap: 0.25rem;
}

.stepper .btn {
  width: 32px;
  min-height: 32px;
  font-size: 1rem;
}

.quantity {
  min-width: 1.75rem;
  text-align: center;
  font-weight: 600;
}

.row:not(.active) .quantity {
  color: var(--c-text-muted);
  font-weight: 400;
}
</style>
