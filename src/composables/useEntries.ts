import { ref } from 'vue'
import {
  createEntry,
  deleteEntry,
  getEntries,
  updateEntry,
  type CreateEntryBody,
  type UpdateEntryBody,
} from '@/api/generated'
import { useNotification } from '@/composables/useNotification'
import type { DayEntry } from '@/types/entries'

export function useEntries() {
  const { notify, notifyError, clear } = useNotification()

  const entries = ref<DayEntry[]>([])
  const loaded = ref(false)

  const fetchEntries = async (date: string) => {
    try {
      const { data } = await getEntries(date)
      entries.value = data as DayEntry[]
      loaded.value = true
    } catch (error) {
      notifyError(error)
    }
  }

  const mutate = async <T>(call: () => Promise<T>, successMessage: string) => {
    clear()
    try {
      const result = await call()
      notify(successMessage)
      return result
    } catch (error) {
      notifyError(error)
      return undefined
    }
  }

  // Le DTO renvoyé porte la nouvelle `version` : la liste reste à jour sans rechargement.
  const storeEntry = (saved: DayEntry) => {
    const exists = entries.value.some((entry) => entry.id === saved.id)
    entries.value = exists
      ? entries.value.map((entry) => (entry.id === saved.id ? saved : entry))
      : [...entries.value, saved]
  }

  const addEntry = async (entry: CreateEntryBody) => {
    const response = await mutate(() => createEntry(entry), 'Entrée créée !')
    const saved = response?.data as DayEntry | undefined
    if (saved) storeEntry(saved)
    return saved
  }

  const editEntry = async (id: string, entry: UpdateEntryBody) => {
    const response = await mutate(() => updateEntry(id, entry), 'Entrée mise à jour !')
    const saved = response?.data as DayEntry | undefined
    if (saved) storeEntry(saved)
    return saved
  }

  const removeEntry = async (id: string) => {
    const response = await mutate(() => deleteEntry(id), 'Entrée supprimée !')
    if (response === undefined) return false
    entries.value = entries.value.filter((entry) => entry.id !== id)
    return true
  }

  return { entries, loaded, fetchEntries, addEntry, editEntry, removeEntry }
}
