<template>
  <div class="picker">
    <input
      v-if="foodModels.length > SEARCH_THRESHOLD"
      v-model="query"
      type="search"
      class="input"
      placeholder="Rechercher un aliment"
      aria-label="Rechercher un aliment"
    >
    <div class="list">
      <FoodModelRow
        v-for="model in visibleModels"
        :key="model.id"
        :model="model"
        :quantity="quantities.get(model.id ?? '') ?? 0"
        @update:quantity="emit('setQuantity', model, $event)"
      />
      <p v-if="!visibleModels.length" class="empty muted">Aucun aliment</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import type { ModelFoodDto } from '@/api/generated'
import FoodModelRow from '@/components/entries/FoodModelRow.vue'
import { useModels } from '@/composables/useModels'

const SEARCH_THRESHOLD = 8

// Quantités par id de modèle. L'enregistrement revient au parent (useEntries.setFoodQuantity).
defineProps<{ quantities: Map<string, number> }>()
const emit = defineEmits<{ setQuantity: [model: ModelFoodDto, quantity: number] }>()

const { foodModels } = useModels()

const query = ref('')

const visibleModels = computed(() => {
  const search = query.value.trim().toLowerCase()
  return search
    ? foodModels.value.filter((model) => model.title?.toLowerCase().includes(search))
    : foodModels.value
})
</script>

<style scoped>
.picker {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.list {
  display: flex;
  flex-direction: column;
  gap: 2px;
  max-height: 55vh;
  overflow-y: auto;
  margin: 0 -0.25rem;
}

.empty {
  padding: 1rem;
  font-size: 0.85rem;
  text-align: center;
}
</style>
