<template>
  <section class="period">
    <PeriodSummary :from-date="startDate" :to-date="endDate" :summary="summary" />

    <div v-if="!showDays" class="load">
      <button type="button" class="btn btn-secondary btn-sm" @click="daysRequested = true">
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
        @entries-changed="loadSummary"
      />
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import DayView from '@/components/days/DayView.vue'
import PeriodSummary from '@/components/periods/PeriodSummary.vue'
import { useSummary } from '@/composables/useSummary'
import { addDays, elapsedDaysDescending, PERIOD_DAYS } from '@/utils/dates'

const props = defineProps<{
  startDate: string
  loaded: boolean
}>()

const { summary, fetchSummary } = useSummary()

const daysRequested = ref(false)
// Un seul jour déplié à la fois dans la période.
const expandedDay = ref<string | null>(null)

const showDays = computed(() => props.loaded || daysRequested.value)
const endDate = computed(() => addDays(props.startDate, PERIOD_DAYS - 1))
const days = computed(() => elapsedDaysDescending(props.startDate, PERIOD_DAYS))

const loadSummary = () => fetchSummary(props.startDate, endDate.value)

onMounted(loadSummary)
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
