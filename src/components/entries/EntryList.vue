<template>
  <ul class="entry-list">
    <li v-for="entry in entries" :key="entry.id" class="entry card">
      <!-- Le parent fournit le formulaire : la liste ne fait qu'afficher. -->
      <slot v-if="isEditableEntry(entry) && entry.id === editingEntryId" name="edit" :entry="entry" />

      <template v-else>
        <SportEntryCard v-if="isSportEntry(entry)" :entry="entry" />
        <FreeEntryCard v-else-if="isFreeEntry(entry)" :entry="entry" />
        <FoodEntryCard v-else-if="isFoodEntry(entry)" :entry="entry" />

        <div class="actions">
          <button
            v-if="isFreeEntry(entry)"
            type="button"
            class="btn btn-ghost btn-sm"
            @click="emit('createModel', entry)"
          >
            Créer un modèle
          </button>
          <button
            v-if="isEditableEntry(entry)"
            type="button"
            class="btn btn-ghost btn-sm"
            @click="emit('edit', entry)"
          >
            Modifier
          </button>
          <button type="button" class="btn btn-ghost btn-danger btn-sm" @click="emit('delete', entry)">
            Supprimer
          </button>
        </div>
      </template>
    </li>
  </ul>
</template>

<script setup lang="ts">
import FoodEntryCard from '@/components/entries/FoodEntryCard.vue'
import FreeEntryCard from '@/components/entries/FreeEntryCard.vue'
import SportEntryCard from '@/components/entries/SportEntryCard.vue'
import {
  isEditableEntry,
  isFoodEntry,
  isFreeEntry,
  isSportEntry,
  type DayEntry,
  type EditableEntry,
  type FreeEntry,
} from '@/types/entries'

defineProps<{
  entries: DayEntry[]
  editingEntryId?: string | null
}>()
const emit = defineEmits<{
  edit: [entry: EditableEntry]
  delete: [entry: DayEntry]
  createModel: [entry: FreeEntry]
}>()
defineSlots<{ edit(props: { entry: EditableEntry }): unknown }>()
</script>

<style scoped>
.entry-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin: 0;
  padding: 0;
  list-style: none;
}

.entry {
  padding: 0.75rem 0.85rem 0.4rem;
  text-align: left;
}

.actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.15rem;
  margin: 0.4rem -0.4rem 0 0;
}
</style>
