<template>
  <PeriodSummary :from-date="startDate" :to-date="endDate" :summary="summary" />

  <div v-if="!showDays">
    <button class="button-10" @click="daysRequested = true">Charger les données</button>
  </div>

  <div v-else>
    <div v-for="day in days" :key="day">
      <DayView
        :date="day"
        :mode="openDay?.date === day ? openDay.mode : null"
        @update:mode="(mode) => setOpenDay(day, mode)"
        @entries-changed="loadSummary"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import DayView from '@/components/days/DayView.vue'
import PeriodSummary from '@/components/periods/PeriodSummary.vue'
import { PERIOD_DAYS } from '@/composables/usePeriods'
import { useSummary } from '@/composables/useSummary'
import type { DayMode } from '@/types/entries'
import { addDays, elapsedDaysDescending } from '@/utils/dates'

const props = defineProps<{
  startDate: string
  loaded: boolean
}>()

const { summary, fetchSummary } = useSummary()

const daysRequested = ref(false)
// Un seul jour ouvert à la fois dans la période.
const openDay = ref<{ date: string; mode: DayMode } | null>(null)

const showDays = computed(() => props.loaded || daysRequested.value)
const endDate = computed(() => addDays(props.startDate, PERIOD_DAYS - 1))
const days = computed(() => elapsedDaysDescending(props.startDate, PERIOD_DAYS))

const setOpenDay = (date: string, mode: DayMode | null | undefined) => {
  openDay.value = mode ? { date, mode } : null
}

const loadSummary = () => fetchSummary(props.startDate, endDate.value)

onMounted(loadSummary)
</script>
