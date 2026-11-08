<template>
  <div>
    <div class="bordered-box">
      <div class="day-header" @click="toggleEntering">
        <span>{{ dayName }}</span> <span>{{ date }}</span>
      </div>

      <div v-if="mode === 'entering'">
        <ModelSelection v-model="selectedCategory" style="height: 35px;" />
        <div v-if="selectedCategory === 'food'">
          <FoodModelList :date="date" :entries="entries" @entries-changed="refresh" />
        </div>
        <div v-if="selectedCategory === 'sport'">
          <SportEntryForm :date="date" @submit="saveEntry" />
        </div>
        <div v-if="selectedCategory === 'free'">
          <FreeEntryForm :date="date" @submit="saveEntry" />
        </div>
      </div>

      <div class="flex" @click="toggleDisplaying">
        <div v-for="entry in entries" :key="entry.id">
          {{ entry.title }} {{ quantityLabel(entry) }}
        </div>
      </div>
    </div>

    <div v-if="mode === 'displaying'">
      <DaySummary :summary="summary" />
      <EntryList :entries="entries" @submit="saveEntry" @delete="deleteEntry" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import type { CreateEntryBody } from '@/api/generated'
import DaySummary from '@/components/days/DaySummary.vue'
import EntryList from '@/components/entries/EntryList.vue'
import FreeEntryForm from '@/components/entries/FreeEntryForm.vue'
import SportEntryForm from '@/components/entries/SportEntryForm.vue'
import FoodModelList from '@/components/models/FoodModelList.vue'
import ModelSelection from '@/components/models/ModelSelection.vue'
import { useEntries } from '@/composables/useEntries'
import { useSummary } from '@/composables/useSummary'
import { isFoodEntry, type DayEntry, type DayMode, type ModelCategory } from '@/types/entries'
import { weekDayName } from '@/utils/dates'

const props = defineProps<{ date: string }>()
const emit = defineEmits<{ entriesChanged: [] }>()
const mode = defineModel<DayMode | null>('mode')

const { entries, fetchEntries, addEntry, editEntry, removeEntry } = useEntries()
const { summary, fetchSummary } = useSummary()

const selectedCategory = ref<ModelCategory | null>(null)
const dayName = computed(() => weekDayName(props.date))

const quantityLabel = (entry: DayEntry) =>
  isFoodEntry(entry) && entry.quantity > 1 ? `(${entry.quantity})` : ''

const loadDaySummary = () => fetchSummary(props.date, props.date)

const toggleEntering = () => {
  mode.value = mode.value === 'entering' ? null : 'entering'
}

const toggleDisplaying = async () => {
  if (mode.value === 'displaying') {
    mode.value = null
    return
  }
  await loadDaySummary()
  mode.value = 'displaying'
}

const refresh = async () => {
  await fetchEntries(props.date)
  emit('entriesChanged')
  if (mode.value === 'displaying') {
    await loadDaySummary()
  }
}

const saveEntry = async (entry: CreateEntryBody) => {
  const saved = entry.id ? await editEntry(entry.id, entry) : await addEntry(entry)
  if (saved) {
    selectedCategory.value = null
    await refresh()
  }
}

const deleteEntry = async (entry: DayEntry) => {
  if (await removeEntry(entry.id)) {
    await refresh()
  }
}

onMounted(() => fetchEntries(props.date))
</script>

<style scoped>
.day-header {
  min-height: 35px;
  align-content: center;
  background-color: rebeccapurple;
  color: white;
}

.flex {
  display: flex;
  justify-content: space-evenly;
  flex-wrap: wrap;
  gap: 0.5rem;
}
</style>
