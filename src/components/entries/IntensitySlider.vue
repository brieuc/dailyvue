<template>
  <div class="field">
    <div class="top">
      <label class="field-label" :for="id">{{ label }}</label>
      <span class="value mono" :class="{ unset: intensity === undefined }">
        {{ intensity === undefined ? '—' : intensity.toFixed(1) }}
      </span>
    </div>
    <input
      :id="id"
      type="range"
      :min="0"
      :max="MAX"
      :step="STEP"
      :value="intensity ?? 0"
      :class="{ unset: intensity === undefined }"
      @input="intensity = Number(($event.target as HTMLInputElement).value)"
    >
  </div>
</template>

<script setup lang="ts">
import { useId } from 'vue'

// De 0 à 5 par pas de 0.1. Tant qu'on n'y touche pas, la valeur reste non renseignée.
const MAX = 5
const STEP = 0.1

defineProps<{ label: string }>()
const intensity = defineModel<number | undefined>()

const id = useId()
</script>

<style scoped>
.top {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
}

.value {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--c-accent);
}

.value.unset {
  color: var(--c-text-muted);
  font-weight: 400;
}

input.unset {
  opacity: 0.45;
}
</style>
