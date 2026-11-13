<template>
  <div class="chips" role="group" :aria-label="label">
    <button
      v-for="option in options"
      :key="option.value"
      type="button"
      class="chip"
      :aria-pressed="selected === option.value"
      @click="toggle(option.value)"
    >
      {{ option.label }}
    </button>
  </div>
</template>

<script setup lang="ts" generic="T extends string">
// Choix unique parmi quelques valeurs. Un second clic désélectionne.
defineProps<{
  label: string
  options: { value: T; label: string }[]
}>()
const selected = defineModel<T | undefined>()

const toggle = (value: T) => {
  selected.value = selected.value === value ? undefined : value
}
</script>

<style scoped>
.chips {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
}

.chip {
  min-height: 32px;
  padding: 0 0.8rem;
  border: 1px solid var(--line-strong);
  border-radius: var(--r-pill);
  background: var(--c-raised);
  color: var(--c-text-soft);
  font-size: 0.8rem;
  transition:
    background 0.16s ease,
    border-color 0.16s ease,
    color 0.16s ease;
}

.chip:hover {
  border-color: var(--c-accent-line);
  color: var(--c-text);
}

.chip[aria-pressed='true'] {
  border-color: var(--c-accent-line);
  background: var(--c-accent-dim);
  color: var(--c-accent);
  font-weight: 600;
}
</style>
