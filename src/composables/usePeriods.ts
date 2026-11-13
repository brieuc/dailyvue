import { ref } from 'vue'
import { getFirstDate, getRelevantDates } from '@/api/generated'
import { useNotification } from '@/composables/useNotification'
import { PERIOD_DAYS } from '@/utils/dates'

const INITIALLY_LOADED_PERIODS = 4
const LOAD_ERROR = 'Erreur lors du chargement des données'

export interface Period {
  startDate: string
  loaded: boolean
}

export function usePeriods() {
  const { notify } = useNotification()

  const periods = ref<Period[]>([])

  const fetchPeriods = async () => {
    try {
      const firstDate = (await getFirstDate()).data[0]
      if (!firstDate) return

      const { data: dates } = await getRelevantDates(firstDate, { numberOfDays: PERIOD_DAYS })

      periods.value = dates.map((startDate, index) => ({
        startDate,
        loaded: index < INITIALLY_LOADED_PERIODS,
      }))
    } catch {
      notify(LOAD_ERROR, 'error')
    }
  }

  const loadAllPeriods = () => {
    periods.value.forEach((period) => {
      period.loaded = true
    })
  }

  return { periods, fetchPeriods, loadAllPeriods }
}
