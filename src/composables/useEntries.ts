import { computed, ref } from 'vue'
import {
  createEntry,
  deleteEntry,
  getEntries,
  updateEntry,
  type CreateEntryBody,
  type ModelFoodDto,
} from '@/api/generated'
import { LOAD_ERROR, useNotification } from '@/composables/useNotification'
import { isFoodEntry, type DayEntry, type EntryInput, type FoodEntry } from '@/types/entries'

/** Entrées d'un jour. Le composant appelant est indexé par sa date, qui ne change donc pas. */
export function useEntries(date: string) {
  const { run } = useNotification()

  const entries = ref<DayEntry[]>([])
  const loaded = ref(false)

  const fetchEntries = async () => {
    const response = await run(() => getEntries(date), { error: LOAD_ERROR })
    if (!response) return
    entries.value = response.data as DayEntry[]
    loaded.value = true
  }

  // Le DTO renvoyé porte la nouvelle `version` : la liste reste à jour sans rechargement.
  const storeEntry = (saved: DayEntry) => {
    const exists = entries.value.some((entry) => entry.id === saved.id)
    entries.value = exists
      ? entries.value.map((entry) => (entry.id === saved.id ? saved : entry))
      : [...entries.value, saved]
  }

  /** Sans id, crée l'entrée ; avec id, la met à jour. */
  const saveEntry = async (input: EntryInput) => {
    const body = { ...input, date } as CreateEntryBody
    const id = input.id
    const response = id
      ? await run(() => updateEntry(id, body), { success: 'Entrée mise à jour !' })
      : await run(() => createEntry(body), { success: 'Entrée créée !' })
    const saved = response?.data as DayEntry | undefined
    if (saved) storeEntry(saved)
    return saved
  }

  const removeEntry = async (id: string) => {
    const response = await run(() => deleteEntry(id), { success: 'Entrée supprimée !' })
    if (!response) return false
    entries.value = entries.value.filter((entry) => entry.id !== id)
    return true
  }

  // Une entrée food par modèle : sa quantité se règle au lieu d'en créer une autre.
  const foodEntriesByModel = computed(
    () =>
      new Map<string, FoodEntry>(
        entries.value.filter(isFoodEntry).map((entry) => [entry.model?.id ?? entry.modelId, entry]),
      ),
  )

  const foodQuantities = computed(
    () => new Map([...foodEntriesByModel.value].map(([modelId, entry]) => [modelId, entry.quantity])),
  )

  const setFoodQuantity = (model: ModelFoodDto, quantity: number) => {
    if (!model.id) return Promise.resolve(undefined)
    const active = foodEntriesByModel.value.get(model.id)
    const source = active ?? model
    return saveEntry({
      ...(active && { id: active.id, version: active.version }),
      title: source.title ?? '',
      description: source.description,
      quantity,
      modelId: model.id,
      type: 'FOOD',
    })
  }

  return {
    entries,
    loaded,
    foodQuantities,
    fetchEntries,
    saveEntry,
    removeEntry,
    setFoodQuantity,
  }
}
