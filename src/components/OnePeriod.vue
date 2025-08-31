<template>
  <summary-info 
    :fromDate="fromDate"
    :toDate="toDate"
    :ingestedKcal="summaryData.ingestedKcal"
    :spentKcal="summaryData.spentKcal"
    :sportDuration="summaryData.sportDuration"
    :aerobic="summaryData.aerobic"
    :anaerobic="summaryData.anaerobic"
    :drinking-beer="summaryData.drinkingBeer">
  </summary-info>

  <div v-if="!shouldLoadEntries">
    <button class="button-10" @click="loadThenDisplayEntries()" :disabled="loading">
      {{ loading ? 'Chargement...' : 'Charger les données' }}
    </button>
  </div>
  
  <div v-else>
    <div v-for="[date, oneDayItem] in entryMap" :key="date">
      <one-day    
        :date="oneDayItem.date"
        :entries="oneDayItem.entries"
        :shouldBeDisplayed="entriesShouldBeDisplayed"
        @on-load-entry-by-date="onLoadEntryByDate"
        @on-select-day="onSelectDay"
        v-model:isEnteringItems="oneDayItem.isEnteringItems"
        v-model:isDisplayingItems="oneDayItem.isDisplayingItems">
      </one-day>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUpdated, isReactive, defineProps } from 'vue';
import OneDay from './OneDay.vue';
import SummaryInfo from './SummaryInfo.vue';
import { createOneDayItem } from '@/oneday';
import { useEntries } from '@/composables/useEntries.js';
import { useDailyStore } from '@/dailyStore';

const props = defineProps(['initialDate', 'numberOfDays', 'hasLoadedEntries']);

const { getEntriesWithModels, getSummary, loading } = useEntries();
const store = useDailyStore();

// Data
const shouldLoadEntries = ref(props.hasLoadedEntries);
const entriesShouldBeDisplayed = ref(true);
const entryMap = ref(new Map());
const lastSelectedDate = ref();

// Summary data
const summaryData = ref({
  ingestedKcal: 0,
  spentKcal: 0,
  sportDuration: 0,
  drinkingBeer: 0,
  anaerobic: 0,
  aerobic: 0
});

// Computed dates
const fromDate = computed(() => {
  const fromDate = new Date(props.initialDate.valueOf());
  return fromDate.toISOString().split('T')[0];
});

const toDate = computed(() => {
  const endDate = new Date(props.initialDate.valueOf());
  endDate.setDate(endDate.getDate() + props.numberOfDays - 1);
  return endDate.toISOString().split('T')[0];
});

// Methods
const loadThenDisplayEntries = async () => {
  shouldLoadEntries.value = true;
  await loadPeriodEntries();
};

const onLoadEntryByDate = async (sDate) => {
  const formerOneDayItem = entryMap.value.get(sDate);
  let isEnteringItems = false;
  let isDisplayingItems = false;
  
  if (isReactive(formerOneDayItem)) {
    isEnteringItems = formerOneDayItem.isEnteringItems;
    isDisplayingItems = formerOneDayItem.isDisplayingItems;
  }
  
  try {
    const entries = await getEntriesWithModels(sDate);
    const oneDayItem = createOneDayItem(entries, sDate, isEnteringItems, isDisplayingItems);
    entryMap.value.set(sDate, oneDayItem);
  } catch (error) {
    console.error("Erreur lors du rechargement:", error);
  }
};

const onSelectDay = (sDate, isEnteringItems, isDisplayingItems) => {
  if (lastSelectedDate.value != null && lastSelectedDate.value != sDate) {
    const lastSelectedItem = entryMap.value.get(lastSelectedDate.value);
    if (lastSelectedItem) {
      lastSelectedItem.isDisplayingItems = false;
      lastSelectedItem.isEnteringItems = false;
    }
  }
  lastSelectedDate.value = sDate;
};

// src/components/OnePeriod.vue - Version ultra-simple
const loadPeriodEntries = () => {
  if (!shouldLoadEntries.value) return;
  
  const initialDate = props.initialDate;
  const dates = [];
  
  // Préparer toutes les dates
  for (let days = 0; days < props.numberOfDays; days++) {
    const date = new Date(initialDate.valueOf());
    date.setDate(date.getDate() + days);
    
    if (date <= new Date()) {
      dates.push(date.toISOString().split("T")[0]);
    }
  }
  
  // ✅ Créer une Promise pour chaque date et les traiter au fur et à mesure
  dates.forEach(sDate => {
    // Créer le placeholder
    const oneDayItem = createOneDayItem([], sDate, false, false);
    oneDayItem.loading = true;
    entryMap.value.set(sDate, oneDayItem);
    
    // ✅ Lancer la Promise et traiter la réponse quand elle arrive
    getEntriesWithModels(sDate)
      .then(entries => {
        // Conserver les états UI existants
        const existingItem = entryMap.value.get(sDate);
        const updatedItem = createOneDayItem(
          entries, 
          sDate, 
          existingItem?.isEnteringItems || false,
          existingItem?.isDisplayingItems || false
        );
        updatedItem.loading = false;
        
        // ✅ Mettre à jour le DOM dès que cette date est prête
        entryMap.value.set(sDate, updatedItem);
      })
      .catch(error => {
        console.error(`Erreur pour ${sDate}:`, error);
        const existingItem = entryMap.value.get(sDate);
        if (existingItem) {
          existingItem.loading = false;
          existingItem.error = error.message;
        }
      });
  });
};

const loadSummaryInfo = async () => {
  try {
    const summary = await getSummary(fromDate.value, toDate.value);
    if (summary) {
      summaryData.value = { ...summary };
    }
  } catch (error) {
    console.error("Erreur lors du chargement du résumé:", error);
  }
};

// Lifecycle
onMounted(async () => {
  shouldLoadEntries.value = props.hasLoadedEntries;
  
  //if (shouldLoadEntries.value) {
    await loadPeriodEntries();
  //}
  
  await loadSummaryInfo();
});

onUpdated(() => {
  if (!shouldLoadEntries.value && props.hasLoadedEntries) {
    shouldLoadEntries.value = true;
    loadPeriodEntries();
  }
});
</script>

<style>
.button-10 {
  margin: auto;
  display: flex;
  justify-content: space-evenly;
  padding: 6px 14px;
  font-family: -apple-system, BlinkMacSystemFont, 'Roboto', sans-serif;
  border-radius: 6px;
  border: none;
  color: #fff;
  background: linear-gradient(180deg, #4B91F7 0%, #367AF6 100%);
  background-origin: border-box;
  box-shadow: 0px 0.5px 1.5px rgba(54, 122, 246, 0.25), inset 0px 0.8px 0px -0.25px rgba(255, 255, 255, 0.2);
  user-select: none;
  -webkit-user-select: none;
  touch-action: manipulation;
}

.button-10:focus {
  box-shadow: inset 0px 0.8px 0px -0.25px rgba(255, 255, 255, 0.2), 0px 0.5px 1.5px rgba(54, 122, 246, 0.25), 0px 0px 0px 3.5px rgba(58, 108, 217, 0.5);
  outline: 0;
}

.button-10:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>