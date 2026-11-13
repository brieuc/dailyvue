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
        :quantity="quantityOf(model)"
        @add="increment(model)"
        @sub="decrement(model)"
      />
      <p v-if="!visibleModels.length" class="empty muted">Aucun aliment</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import type { CreateEntryBody, ModelFoodDto } from '@/api/generated'
import FoodModelRow from '@/components/entries/FoodModelRow.vue'
import { useModels } from '@/composables/useModels'
import { isFoodEntry, type DayEntry, type FoodEntry } from '@/types/entries'

const props = defineProps<{
  date: string
  entries: DayEntry[]
}>()
const emit = defineEmits<{ setQuantity: [entry: CreateEntryBody] }>()

const SEARCH_THRESHOLD = 8

const { foodModels } = useModels()

const query = ref('')

const visibleModels = computed(() => {
  const search = query.value.trim().toLowerCase()
  return search
    ? foodModels.value.filter((model) => model.title?.toLowerCase().includes(search))
    : foodModels.value
})

const entriesByModelId = computed(
  () =>
    new Map<string, FoodEntry>(
      props.entries.filter(isFoodEntry).map((entry) => [entry.model?.id ?? entry.modelId, entry]),
    ),
)

const quantityOf = (model: ModelFoodDto) =>
  (model.id && entriesByModelId.value.get(model.id)?.quantity) || 0

const setQuantity = (model: ModelFoodDto, modelId: string, quantity: number) => {
  const active = entriesByModelId.value.get(modelId)
  emit(
    'setQuantity',
    active
      ? {
          id: active.id,
          version: active.version,
          title: active.title,
          description: active.description,
          quantity,
          modelId,
          date: active.date,
          type: 'FOOD',
        }
      : {
          quantity,
          modelId,
          date: props.date,
          title: model.title as string,
          description: model.description,
          type: 'FOOD',
        },
  )
}

const increment = (model: ModelFoodDto) => {
  if (!model.id) return
  const quantity = entriesByModelId.value.get(model.id)?.quantity ?? 0
  setQuantity(model, model.id, quantity + 1)
}

const decrement = (model: ModelFoodDto) => {
  if (!model.id) return
  const active = entriesByModelId.value.get(model.id)
  if (active) {
    setQuantity(model, model.id, active.quantity - 1)
  }
}
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
