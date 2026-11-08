import { ref } from 'vue'
import { getFirstDate, getRelevantDates } from '@/api/generated'
import { useNotification } from '@/composables/useNotification'

export const PERIOD_DAYS = 7
const INITIALLY_LOADED_PERIODS = 4
const LOAD_ERROR = 'Erreur lors du chargement des données'

export interface Period {
  startDate: string
  loaded: boolean
}

const periods = ref<Period[]>([])
const loaded = ref(false)
// Incrémenté au reset : une réponse arrivée après une déconnexion est ignorée.
let session = 0

export function usePeriods() {
  const { notify } = useNotification()

  const fetchPeriods = async () => {
    if (loaded.value) return
    const currentSession = session
    try {
      const firstDate = (await getFirstDate()).data[0]
      if (!firstDate) return

      const { data: dates } = await getRelevantDates(firstDate, { numberOfDays: PERIOD_DAYS })
      if (currentSession !== session) return

      periods.value = dates.map((startDate, index) => ({
        startDate,
        loaded: index < INITIALLY_LOADED_PERIODS,
      }))
      loaded.value = true
    } catch {
      notify(LOAD_ERROR)
    }
  }

  const loadAllPeriods = () => {
    periods.value.forEach((period) => {
      period.loaded = true
    })
  }

  const resetPeriods = () => {
    session++
    periods.value = []
    loaded.value = false
  }

  return { periods, fetchPeriods, loadAllPeriods, resetPeriods }
}
