<template>
  <article class="day card" :class="{ expanded }">
    <div class="head">
      <button type="button" class="toggle" :aria-expanded="expanded" @click="toggleExpanded">
        <span class="name">{{ dayName }}</span>
        <span class="date muted">{{ shortDate(date) }}</span>
        <span class="chevron" aria-hidden="true"></span>
      </button>
      <!-- Tant que les entrées ne sont pas chargées, « + » créerait un doublon. -->
      <button
        v-if="entriesLoaded"
        type="button"
        class="add btn btn-primary btn-icon"
        aria-label="Ajouter une entrée"
        @click="creating = true"
      >
        +
      </button>
    </div>

    <ul v-if="entries.length" class="chips" @click="toggleExpanded">
      <li v-for="entry in entries" :key="entry.id" class="chip">
        <span class="dot" :class="entryCategory(entry)"></span>
        <span class="chip-title">{{ entry.title }}</span>
        <span v-if="quantityLabel(entry)" class="qty mono">{{ quantityLabel(entry) }}</span>
      </li>
    </ul>
    <p v-else-if="entriesLoaded" class="empty muted">Aucune entrée</p>

    <div v-if="expanded" class="details">
      <DaySummary :summary="summary" />
      <EntryList
        :entries="entries"
        :editing-entry-id="editingEntryId"
        @edit="editingEntryId = $event.id"
        @delete="deleteEntry"
        @create-model="addFoodModelFromEntry"
      >
        <template #edit="{ entry }">
          <EntryForm :date="entry.date" :entry="entry" @submit="submitEditedEntry" />
          <button type="button" class="btn btn-ghost btn-block" @click="editingEntryId = null">
            Annuler
          </button>
        </template>
      </EntryList>
    </div>

    <ModalDialog v-if="creating" :title="`${dayName} ${shortDate(date)}`" @close="creating = false">
      <CategorySelection
        :date="date"
        :entries="entries"
        @set-quantity="persistEntry"
        @submit="submitNewEntry"
      />
    </ModalDialog>
  </article>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import type { CreateEntryBody } from '@/api/generated'
import DaySummary from '@/components/days/DaySummary.vue'
import CategorySelection from '@/components/entries/CategorySelection.vue'
import EntryForm from '@/components/entries/EntryForm.vue'
import EntryList from '@/components/entries/EntryList.vue'
import ModalDialog from '@/components/ModalDialog.vue'
import { useEntries } from '@/composables/useEntries'
import { useModels } from '@/composables/useModels'
import { useSummary } from '@/composables/useSummary'
import { entryCategory, isFoodEntry, type DayEntry } from '@/types/entries'
import { shortDate, weekDayName } from '@/utils/dates'

const props = defineProps<{ date: string }>()
const emit = defineEmits<{ entriesChanged: [] }>()
// Détail du jour (résumé et liste). PeriodView n'en garde qu'un d'ouvert par semaine.
const expanded = defineModel<boolean>('expanded', { default: false })

const {
  entries,
  loaded: entriesLoaded,
  fetchEntries,
  addEntry,
  editEntry,
  removeEntry,
} = useEntries()
const { summary, fetchSummary } = useSummary()
const { addFoodModelFromEntry } = useModels()

const creating = ref(false)
const editingEntryId = ref<string | null>(null)
const dayName = computed(() => weekDayName(props.date))

const quantityLabel = (entry: DayEntry) =>
  isFoodEntry(entry) && entry.quantity > 1 ? `×${entry.quantity}` : ''

const loadDaySummary = () => fetchSummary(props.date, props.date)

const toggleExpanded = async () => {
  if (expanded.value) {
    expanded.value = false
    return
  }
  await loadDaySummary()
  expanded.value = true
}

const onEntriesChanged = async () => {
  emit('entriesChanged')
  if (expanded.value) {
    await loadDaySummary()
  }
}

const persistEntry = async (entry: CreateEntryBody) => {
  const saved = entry.id ? await editEntry(entry.id, entry) : await addEntry(entry)
  if (saved) {
    await onEntriesChanged()
  }
  return saved
}

// Un formulaire ne se ferme qu'après un enregistrement réussi : en cas d'échec, la saisie reste.
// La saisie food passe directement par persistEntry et garde le modal ouvert.
const submitNewEntry = async (entry: CreateEntryBody) => {
  if (await persistEntry(entry)) {
    creating.value = false
  }
}

const submitEditedEntry = async (entry: CreateEntryBody) => {
  if (await persistEntry(entry)) {
    editingEntryId.value = null
  }
}

const deleteEntry = async (entry: DayEntry) => {
  if (await removeEntry(entry.id)) {
    await onEntriesChanged()
  }
}

// Refermer le détail abandonne une modification en cours.
watch(expanded, (value) => {
  if (!value) {
    editingEntryId.value = null
  }
})

onMounted(() => fetchEntries(props.date))
</script>

<style scoped>
.day {
  overflow: hidden;
  transition: box-shadow 0.18s ease, border-color 0.18s ease;
}

.day:hover,
.day.expanded {
  border-color: var(--line-strong);
  box-shadow: 0 6px 18px -10px rgba(23, 32, 64, 0.28);
}

.head {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.6rem 0.5rem 0;
}

.toggle {
  display: flex;
  flex: 1;
  align-items: baseline;
  gap: 0.5rem;
  min-width: 0;
  min-height: 40px;
  padding: 0.25rem 0.85rem;
  border: none;
  background: none;
  text-align: left;
}

.name {
  font-weight: 600;
  letter-spacing: -0.012em;
}

.date {
  font-size: 0.8rem;
}

.chevron {
  width: 7px;
  height: 7px;
  margin-left: auto;
  align-self: center;
  border-right: 1.5px solid var(--c-text-muted);
  border-bottom: 1.5px solid var(--c-text-muted);
  transform: rotate(45deg);
  transition: transform 0.18s ease;
}

.expanded .chevron {
  transform: rotate(-135deg);
}

.add {
  flex: none;
  width: 32px;
  min-height: 32px;
}

.chips {
  display: flex;
  flex-wrap: wrap;
  gap: 0.35rem;
  margin: 0;
  padding: 0 0.85rem 0.75rem;
  list-style: none;
  cursor: pointer;
}

.chip {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  max-width: 100%;
  padding: 0.2rem 0.6rem;
  border-radius: var(--r-pill);
  background: var(--c-sunken);
  font-size: 0.78rem;
  color: var(--c-text-soft);
}

.chip-title {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.qty {
  font-size: 0.7rem;
  color: var(--c-text-muted);
}

.empty {
  padding: 0 0.85rem 0.75rem;
  font-size: 0.78rem;
}

.details {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  padding: 0.75rem;
  border-top: 1px solid var(--line);
  background: var(--c-bg);
}
</style>
