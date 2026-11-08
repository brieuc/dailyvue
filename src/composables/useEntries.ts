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
  let lastRequest = 0

  const fetchEntries = async (date: string) => {
    const request = ++lastRequest
    try {
      const { data } = await getEntries(date)
      // Seule la réponse la plus récente compte si plusieurs rechargements se croisent.
      if (request === lastRequest) {
        entries.value = data as DayEntry[]
      }
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

  const addEntry = async (entry: CreateEntryBody) => {
    const response = await mutate(() => createEntry(entry), 'Entrée créée !')
    return response?.data as DayEntry | undefined
  }

  const editEntry = async (id: string, entry: UpdateEntryBody) => {
    const response = await mutate(() => updateEntry(id, entry), 'Entrée mise à jour !')
    return response?.data as DayEntry | undefined
  }

  const removeEntry = async (id: string) => {
    const response = await mutate(() => deleteEntry(id), 'Entrée supprimée !')
    return response !== undefined
  }

  return { entries, fetchEntries, addEntry, editEntry, removeEntry }
}
