<template>
  <section class="period">
    <PeriodSummary :from-date="startDate" :to-date="endDate" :summary="summary" />

    <div v-if="!loaded" class="load">
      <button type="button" class="btn btn-secondary btn-sm" @click="loaded = true">
        Charger les données
      </button>
    </div>

    <div v-else class="days">
      <DayView
        v-for="day in days"
        :key="day"
        :date="day"
        :expanded="expandedDay === day"
        @update:expanded="(expanded) => (expandedDay = expanded ? day : null)"
        @entries-changed="fetchSummary"
      />
    </div>
  </section>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import DayView from '@/components/days/DayView.vue'
import PeriodSummary from '@/components/periods/PeriodSummary.vue'
import { useSummary } from '@/composables/useSummary'
import { addDays, elapsedDaysDescending, PERIOD_DAYS } from '@/utils/dates'

// HomeView indexe ses périodes par date de début : `startDate` ne change pas.
const props = defineProps<{ startDate: string }>()
// Jours affichés. L'état vit dans usePeriods, HomeView le lie par v-model.
const loaded = defineModel<boolean>('loaded', { required: true })

const endDate = addDays(props.startDate, PERIOD_DAYS - 1)
const days = elapsedDaysDescending(props.startDate, PERIOD_DAYS)

const { summary, fetchSummary } = useSummary(props.startDate, endDate)

// Un seul jour déplié à la fois dans la période.
const expandedDay = ref<string | null>(null)

onMounted(fetchSummary)
</script>

<style scoped>
.period {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.days {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.load {
  display: flex;
  justify-content: center;
}
</style>
