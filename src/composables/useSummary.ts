import { ref } from 'vue'
import { getSummaryInfo, type SummaryInfoDto } from '@/api/generated'
import { useNotification } from '@/composables/useNotification'

export function useSummary() {
  const { notifyError } = useNotification()

  const summary = ref<Required<SummaryInfoDto>>({
    spentKcal: 0,
    ingestedKcal: 0,
    sportDuration: 0,
    drinkingBeer: 0,
    aerobic: 0,
    anaerobic: 0,
  })

  const fetchSummary = async (fromDate: string, toDate: string) => {
    try {
      const { data } = await getSummaryInfo({ fromDate, toDate })
      summary.value = {
        spentKcal: data.spentKcal ?? 0,
        ingestedKcal: data.ingestedKcal ?? 0,
        sportDuration: data.sportDuration ?? 0,
        drinkingBeer: data.drinkingBeer ?? 0,
        aerobic: data.aerobic ?? 0,
        anaerobic: data.anaerobic ?? 0,
      }
    } catch (error) {
      notifyError(error)
    }
  }

  return { summary, fetchSummary }
}
