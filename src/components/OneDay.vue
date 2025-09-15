<template>
  <div>
    <div id="border">
      <div @click="selectDay()" style="min-height: 35px; align-content: center; background-color:rebeccapurple; color: white;">
        <span>{{ day }}</span> <span>{{ date }}</span>
      </div>
      
      <div v-if="isEnteringItems">
        <model-selection style="height: 35px;" @on-select-model="onSelectModel"></model-selection>  
        <div v-if="selectedCategory === 'food'">
          <model-food @on-update-food-entry="onUpdateFoodEntry" :date="selectedDay"></model-food>
        </div>
        <div v-if="selectedCategory === 'sport'">
          <model-sport :date="selectedDay" @on-add-sport-entry="onAddSportEntry"></model-sport>
        </div>
        <div v-if="selectedCategory === 'free'">
          <model-free :date="selectedDay" @on-add-free-entry="onAddFreeEntry"></model-free>
        </div>
      </div>
      
      <div class="flex" @click="displayDay()">
        <div v-for="entry in entries" :key="entry.id">
          {{ entry.title }} {{ getQuantity(entry) }}
        </div>  
      </div>
    </div>

    <div v-if="isDisplayingItems">
      <one-day-summary    
        :date="date"
        :spent-kcal="summaryData.spentKcal"
        :drinking-beer="summaryData.drinkingBeer"
        :ingested-kcal="summaryData.ingestedKcal"
        :sport-duration="summaryData.sportDuration">
      </one-day-summary>
      
      <day-entries 
        :date="date" 
        :entries="entries" 
        :shouldBeDisplayed="shouldBeDisplayed"
        @on-add-free-entry="onAddFreeEntry"
        @on-update-free-entry="onUpdateFreeEntry"
        @on-add-sport-entry="onAddSportEntry"
        @on-update-sport-entry="onUpdateSportEntry"
        @on-delete-entry="onDeleteEntry">
      </day-entries>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, defineModel, defineProps, defineEmits } from 'vue';
import OneDaySummary from './OneDaySummary.vue';
import ModelFood from './ModelFood.vue';
import ModelSport from './ModelSport.vue';
import ModelFree from './ModelFree.vue';
import ModelSelection from './ModelSelection.vue';
import DayEntries from './DayEntries.vue';
import { useEntries } from '@/composables/useEntries.js';
import { logger } from '@/utils/logger';

const emit = defineEmits(['onSelectDay', 'onLoadEntryByDate']);
const props = defineProps(['shouldBeDisplayed', 'date', 'entries']);

const { getSummary } = useEntries();

// Reactive data
const selectedDay = ref();
const displayedDay = ref();
const selectedCategory = ref();
const isDisplayingItems = defineModel('isDisplayingItems');
const isEnteringItems = defineModel('isEnteringItems');

const summaryData = ref({
  spentKcal: 0,
  ingestedKcal: 0,
  sportDuration: 0,
  drinkingBeer: 0
});

// Computed
const day = computed(() => {
  const days = ["Dimanche", "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"];
  const date = new Date(props.date);
  return days[date.getDay()];
});

// Methods
const getSummaryInfo = async () => {
  try {
    const summary = await getSummary(props.date, props.date);
    if (summary) {
      summaryData.value = {
        spentKcal: summary.spentKcal || 0,
        ingestedKcal: summary.ingestedKcal || 0,
        sportDuration: summary.sportDuration || 0,
        drinkingBeer: summary.drinkingBeer || 0
      };
    }
  } catch (error) {
    logger.error("Erreur lors du chargement du résumé:");
  }
};

const getQuantity = (entry) => {
  if (entry.quantity && entry.quantity > 1) {
    return `(${entry.quantity})`;
  }
  return "";
};
    
const selectDay = () => {
  displayedDay.value = null;
  
  if (isEnteringItems.value) {
    isEnteringItems.value = false;
  } else {
    isEnteringItems.value = true;
  }
  
  isDisplayingItems.value = false;
  selectedDay.value = props.date;
  emit("onSelectDay", props.date, isEnteringItems.value, isDisplayingItems.value);
};
    
const displayDay = async () => {
  await getSummaryInfo();
  
  selectedDay.value = null;
  
  if (isDisplayingItems.value) {
    isDisplayingItems.value = false;
  } else {
    isDisplayingItems.value = true;
  }
  
  isEnteringItems.value = false;
  displayedDay.value = props.date;
  emit("onSelectDay", props.date, isEnteringItems.value, isDisplayingItems.value);
};

const onDeleteEntry = (entry) => {
  loadEntriesByDate(displayedDay.value);
};

const onAddFreeEntry = (freeEntry) => {
  selectedCategory.value = null;
  loadEntriesByDate(selectedDay.value);
};

const onUpdateFreeEntry = (freeEntry) => {
  selectedCategory.value = null;
  loadEntriesByDate(displayedDay.value);
};

const onAddSportEntry = (sportEntry) => {
  selectedCategory.value = null;
  loadEntriesByDate(selectedDay.value);
};

const onUpdateSportEntry = (sportEntry) => {
  selectedCategory.value = null;
  loadEntriesByDate(displayedDay.value);
};

const onUpdateFoodEntry = (foodEntry) => {
  logger.log("onUpdateFoodEntry");
  loadEntriesByDate(selectedDay.value);
};

const onSelectModel = (categoryName) => {
  selectedCategory.value = categoryName;
};

const loadEntriesByDate = (sDate) => {
  logger.log("loadEntriesByDate");
  emit("onLoadEntryByDate", sDate);
};
</script>

<style>
.flex {
  display: flex;
  border: 1px;
  border-color: black;
  justify-content: space-evenly;
  flex-wrap: wrap;
  gap: 0.5rem;
}

#border {
  border: 1px;
  --border-radius: 5px;
  border-color: black;
  border-style: solid;
  cursor: pointer;
  --margin: auto;
  width: 400px;
  --box-shadow: 0 2px 2px rgba(0, 0, 0, 0.26);
  --padding: 1rem;
}

@media only screen and (max-width: 393px) {
  #border {
    width: 100%;
    --box-shadow: 0 2px 2px rgba(0, 0, 0, 0.26);
  }
}
</style>