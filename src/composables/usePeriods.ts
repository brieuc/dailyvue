import { ref } from 'vue'
import { getFirstDate, getRelevantDates } from '@/api/generated'
import { LOAD_ERROR, useNotification } from '@/composables/useNotification'
import { PERIOD_DAYS } from '@/utils/dates'

const INITIALLY_LOADED_PERIODS = 4

export interface Period {
  startDate: string
  loaded: boolean
}

export function usePeriods() {
  const { run } = useNotification()

  const periods = ref<Period[]>([])

  const fetchPeriods = async () => {
    const dates = await run(
      async () => {
        const firstDate = (await getFirstDate()).data[0]
        if (!firstDate) return []
        return (await getRelevantDates(firstDate, { numberOfDays: PERIOD_DAYS })).data
      },
      { error: LOAD_ERROR },
    )
    if (!dates) return
    periods.value = dates.map((startDate, index) => ({
      startDate,
      loaded: index < INITIALLY_LOADED_PERIODS,
    }))
  }

  const loadAllPeriods = () => {
    periods.value.forEach((period) => {
      period.loaded = true
    })
  }

  return { periods, fetchPeriods, loadAllPeriods }
}
