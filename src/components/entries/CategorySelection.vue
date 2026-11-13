<template>
  <div class="category-selection">
    <div class="segmented" role="tablist" aria-label="Catégorie">
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
      :date="date"
      :entries="entries"
      @set-quantity="emit('setQuantity', $event)"
    />
    <EntryForm v-else :date="date" :category="category" @submit="emit('submit', $event)" />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { CreateEntryBody } from '@/api/generated'
import EntryForm from '@/components/entries/EntryForm.vue'
import FoodEntryPicker from '@/components/entries/FoodEntryPicker.vue'
import type { DayEntry, ModelCategory } from '@/types/entries'

const TABS: { category: ModelCategory; label: string }[] = [
  { category: 'food', label: 'Food' },
  { category: 'sport', label: 'Sport' },
  { category: 'free', label: 'Free' },
]

// Saisie des entrées d'un jour. Les écritures remontent au parent : aucun appel API ici.
defineProps<{
  date: string
  entries: DayEntry[]
}>()
const emit = defineEmits<{
  setQuantity: [entry: CreateEntryBody]
  submit: [entry: CreateEntryBody]
}>()

const category = ref<ModelCategory>('food')
</script>

<style scoped>
.category-selection {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
</style>
