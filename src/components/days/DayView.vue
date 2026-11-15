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
        @click="dialog = {}"
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
      <DaySummary v-if="summaryLoaded" :summary="summary" />
      <EntryList
        :entries="entries"
        @edit="dialog = { entry: $event }"
        @delete="deleteEntry"
        @create-model="addFoodModelFromEntry"
      />
    </div>

    <!-- Création (« + ») et modification passent par le même modal. -->
    <ModalDialog v-if="dialog" :title="`${dayName} ${shortDate(date)}`" @close="dialog = null">
      <CategorySelection
        :entry="dialog.entry"
        :food-quantities="foodQuantities"
        @set-food-quantity="setFoodQuantity"
        @submit="submitEntry"
      />
    </ModalDialog>
  </article>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import type { ModelFoodDto } from '@/api/generated'
import DaySummary from '@/components/days/DaySummary.vue'
import CategorySelection from '@/components/entries/CategorySelection.vue'
import EntryList from '@/components/entries/EntryList.vue'
import ModalDialog from '@/components/ModalDialog.vue'
import { useEntries } from '@/composables/useEntries'
import { useModels } from '@/composables/useModels'
import { useSummary } from '@/composables/useSummary'
import {
  entryCategory,
  isFoodEntry,
  type DayEntry,
  type EditableEntry,
  type EntryInput,
} from '@/types/entries'
import { shortDate, weekDayName } from '@/utils/dates'

// PeriodView indexe ses jours par date : `date` ne change pas pendant la vie du composant.
const props = defineProps<{ date: string }>()
const emit = defineEmits<{ entriesChanged: [] }>()
// Détail du jour (résumé et liste). PeriodView n'en garde qu'un d'ouvert par semaine.
const expanded = defineModel<boolean>('expanded', { default: false })

const {
  entries,
  loaded: entriesLoaded,
  foodQuantities,
  fetchEntries,
  saveEntry,
  removeEntry,
  setFoodQuantity: saveFoodQuantity,
} = useEntries(props.date)
const { summary, loaded: summaryLoaded, fetchSummary } = useSummary(props.date, props.date)
const { addFoodModelFromEntry } = useModels()

// Modal de saisie : fermé (null), création ({}) ou modification ({ entry }).
const dialog = ref<{ entry?: EditableEntry } | null>(null)
const dayName = computed(() => weekDayName(props.date))

const quantityLabel = (entry: DayEntry) =>
  isFoodEntry(entry) && entry.quantity > 1 ? `×${entry.quantity}` : ''

const toggleExpanded = () => {
  expanded.value = !expanded.value
}

// Le résumé n'est chargé que pour un jour déplié, et rechargé après chaque écriture.
const afterWrite = <T,>(saved: T) => {
  if (saved) {
    emit('entriesChanged')
    if (expanded.value) fetchSummary()
  }
  return saved
}

// La saisie food enregistre à chaque clic et garde le modal ouvert.
const setFoodQuantity = async (model: ModelFoodDto, quantity: number) =>
  afterWrite(await saveFoodQuantity(model, quantity))

// Un formulaire ne se ferme qu'après un enregistrement réussi : en cas d'échec, la saisie reste.
const submitEntry = async (entry: EntryInput) => {
  if (afterWrite(await saveEntry(entry))) dialog.value = null
}

const deleteEntry = async (entry: DayEntry) => afterWrite(await removeEntry(entry.id))

watch(expanded, (value) => value && fetchSummary(), { immediate: true })

onMounted(fetchEntries)
</script>

<style scoped>
.day {
  overflow: hidden;
  transition: box-shadow 0.18s ease, border-color 0.18s ease;
}

.day:hover {
  border-color: var(--line-strong);
  box-shadow: 0 6px 18px -10px rgba(23, 32, 64, 0.28);
}

.day.expanded {
  border-color: var(--c-accent-line);
  box-shadow: 0 10px 26px -12px rgba(12, 135, 170, 0.45);
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
  border-top: 1px solid var(--c-accent-line);
  background: var(--c-tint);
}

/* Sur le fond teinté, les statistiques passent en blanc comme les cartes d'entrée. */
.details :deep(.stat) {
  background: var(--c-raised);
}
</style>
