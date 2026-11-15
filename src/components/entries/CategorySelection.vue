<template>
  <div class="category-selection">
    <!-- Une entrée existante garde sa catégorie : pas d'onglets en modification. -->
    <div v-if="!entry" class="segmented" role="tablist" aria-label="Catégorie">
      <button
        v-for="tab in TABS"
        :key="tab.category"
        type="button"
        role="tab"
        :aria-selected="category === tab.category"
        @click="category = tab.category"
      >
        {{ tab.label }}
      </button>
    </div>

    <FoodEntryPicker
      v-if="category === 'food'"
      :quantities="foodQuantities"
      @set-quantity="(model, quantity) => emit('setFoodQuantity', model, quantity)"
    />
    <SportEntryForm v-else-if="category === 'sport'" :entry="sportEntry" @submit="emit('submit', $event)" />
    <FreeEntryForm v-else :entry="freeEntry" @submit="emit('submit', $event)" />
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import type { ModelFoodDto } from '@/api/generated'
import FoodEntryPicker from '@/components/entries/FoodEntryPicker.vue'
import FreeEntryForm from '@/components/entries/FreeEntryForm.vue'
import SportEntryForm from '@/components/entries/SportEntryForm.vue'
import {
  entryCategory,
  isFreeEntry,
  isSportEntry,
  type EditableEntry,
  type EntryInput,
  type ModelCategory,
} from '@/types/entries'

const TABS: { category: ModelCategory; label: string }[] = [
  { category: 'food', label: 'Food' },
  { category: 'sport', label: 'Sport' },
  { category: 'free', label: 'Free' },
]

// Saisie d'une entrée : création (sans `entry`) ou modification. Aucun appel API ici,
// les écritures remontent à DayView.
const props = defineProps<{
  foodQuantities: Map<string, number>
  entry?: EditableEntry
}>()
const emit = defineEmits<{
  setFoodQuantity: [model: ModelFoodDto, quantity: number]
  submit: [entry: EntryInput]
}>()

const category = ref<ModelCategory>(props.entry ? entryCategory(props.entry) : 'food')
const sportEntry = computed(() => (props.entry && isSportEntry(props.entry) ? props.entry : undefined))
const freeEntry = computed(() => (props.entry && isFreeEntry(props.entry) ? props.entry : undefined))
</script>

<style scoped>
.category-selection {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
</style>
