import { ref } from 'vue'
import { getSummaryInfo, type SummaryInfoDto } from '@/api/generated'
import { LOAD_ERROR, useNotification } from '@/composables/useNotification'

export type Summary = Required<SummaryInfoDto>

/** Résumé d'un intervalle de jours, fixé à la création comme pour useEntries. */
export function useSummary(fromDate: string, toDate: string) {
  const { run } = useNotification()

  const summary = ref<Summary>({
    spentKcal: 0,
    ingestedKcal: 0,
    sportDuration: 0,
    drinkingBeer: 0,
    aerobic: 0,
    anaerobic: 0,
  })
  const loaded = ref(false)

  const fetchSummary = async () => {
    const response = await run(() => getSummaryInfo({ fromDate, toDate }), { error: LOAD_ERROR })
    if (!response) return
    const { data } = response
    summary.value = {
      spentKcal: data.spentKcal ?? 0,
      ingestedKcal: data.ingestedKcal ?? 0,
      sportDuration: data.sportDuration ?? 0,
      drinkingBeer: data.drinkingBeer ?? 0,
      aerobic: data.aerobic ?? 0,
      anaerobic: data.anaerobic ?? 0,
    }
    loaded.value = true
  }

  return { summary, loaded, fetchSummary }
}
