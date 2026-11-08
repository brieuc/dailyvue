<template>
  <div style="padding-top: 10px; padding-bottom: 10px; border: 1px black solid">
    <div v-for="model in foodModels" :key="model.id" style="padding-left: 10px;">
      <FoodModelRow :model="model" @add="increment(model)" @sub="decrement(model)" />
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ModelFoodDto } from '@/api/generated'
import FoodModelRow from '@/components/models/FoodModelRow.vue'
import { useEntries } from '@/composables/useEntries'
import { useModels } from '@/composables/useModels'
import { isFoodEntry, type DayEntry, type FoodEntry } from '@/types/entries'

const props = defineProps<{
  date: string
  entries: DayEntry[]
}>()
const emit = defineEmits<{ entriesChanged: [] }>()

const { foodModels } = useModels()
const { addEntry, editEntry } = useEntries()

// Initialisée une seule fois puis tenue à jour avec les réponses de l'API : un rechargement
// encore en cours ne doit pas réintroduire une ancienne `version` de l'entrée.
const entriesByModelId = new Map<string, FoodEntry>(
  props.entries.filter(isFoodEntry).map((entry) => [entry.model?.id ?? entry.modelId, entry]),
)

const saveQuantity = async (model: ModelFoodDto, modelId: string, quantity: number) => {
  const active = entriesByModelId.get(modelId)
  const saved = active
    ? await editEntry(active.id, {
        id: active.id,
        version: active.version,
        title: active.title,
        description: active.description,
        quantity,
        modelId,
        date: active.date,
        type: 'FOOD',
      })
    : await addEntry({
        quantity,
        modelId,
        date: props.date,
        title: model.title as string,
        description: model.description,
        type: 'FOOD',
      })

  if (saved) {
    entriesByModelId.set(modelId, saved as FoodEntry)
    emit('entriesChanged')
  }
}

const increment = (model: ModelFoodDto) => {
  if (!model.id) return
  const quantity = entriesByModelId.get(model.id)?.quantity ?? 0
  saveQuantity(model, model.id, quantity + 1)
}

const decrement = (model: ModelFoodDto) => {
  if (!model.id) return
  const active = entriesByModelId.get(model.id)
  if (active) {
    saveQuantity(model, model.id, active.quantity - 1)
  }
}
</script>
