<template>
  <div style="background-color: azure;">
    <div v-for="entry in entries" :key="entry.id" class="div-entry-center">
      <div v-if="isSportEntry(entry)">
        <SportEntryForm
          v-if="editingEntryId === entry.id"
          :date="entry.date"
          :entry="entry"
          @submit="emit('submit', $event)"
        />
        <div v-else>
          <div>{{ entry.title }}</div>
          <div class="formatted">{{ entry.description }}</div>
          <table class="center">
            <tbody>
              <tr><td>Modèle</td>
                <td v-if="entry.model"><b>{{ entry.model.title }}</b></td>
              </tr>
              <tr><td>Sport</td>
                <td v-if="entry.model">{{ entry.model.sport }}</td>
              </tr>
              <tr><td>Duration</td><td>{{ entry.duration }}</td></tr>
              <tr><td>Calories</td><td>{{ entry.kcal }}</td></tr>
              <tr><td>Aerobic</td><td>{{ entry.aerobic }}</td></tr>
              <tr><td>Anaerobic</td><td>{{ entry.anaerobic }}</td></tr>
              <tr><td>Benefit</td><td>{{ entry.benefit }}</td></tr>
            </tbody>
          </table>
        </div>
      </div>

      <div v-if="isFreeEntry(entry)">
        <FreeEntryForm
          v-if="editingEntryId === entry.id"
          :date="entry.date"
          :entry="entry"
          @submit="emit('submit', $event)"
        />
        <div v-else>
          <div>{{ entry.title }}</div>
          <div>{{ entry.description }}</div>
          <div v-if="entry.foodType">{{ entry.foodType }}</div>
          <div v-if="entry.kcal">{{ entry.kcal }}</div>
        </div>
      </div>

      <div v-if="isFoodEntry(entry)">
        <div>{{ entry.title }}</div>
        <div v-if="entry.model">
          <div>Calories {{ entry.quantity * (entry.model.kcal ?? 0) }}</div>
        </div>
      </div>

      <template v-if="editingEntryId !== entry.id">
        <button v-if="!isFoodEntry(entry)" @click="editingEntryId = entry.id">Edit</button>
        &nbsp;
        <button @click="emit('delete', entry)">Delete</button>
        &nbsp;
        <button v-if="isFreeEntry(entry)" @click="addFoodModelFromEntry(entry)">Create Model</button>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import type { CreateEntryBody } from '@/api/generated'
import FreeEntryForm from '@/components/entries/FreeEntryForm.vue'
import SportEntryForm from '@/components/entries/SportEntryForm.vue'
import { useModels } from '@/composables/useModels'
import { isFoodEntry, isFreeEntry, isSportEntry, type DayEntry } from '@/types/entries'

const props = defineProps<{ entries: DayEntry[] }>()
const emit = defineEmits<{
  submit: [entry: CreateEntryBody]
  delete: [entry: DayEntry]
}>()

const { addFoodModelFromEntry } = useModels()

const editingEntryId = ref<string | null>(null)

// Après un enregistrement réussi, la liste est rechargée et le formulaire se ferme.
watch(
  () => props.entries,
  () => {
    editingEntryId.value = null
  },
)
</script>

<style scoped>
.formatted {
  white-space: pre-wrap;
}

.center {
  margin: auto;
}

.div-entry-center {
  border: 1px solid black;
  margin: auto;
  width: 400px;
}

@media only screen and (max-width: 393px) {
  .div-entry-center {
    width: 100%;
    text-align: center;
  }
}
</style>
