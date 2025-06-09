<template>

<summary-info     :fromDate="fromDate"
                  :toDate="toDate"
                  :ingestedKcal="ingestedKcal"
                  :spentKcal="spentKcal"
                  :sportDuration="sportDuration"
                  :aerobic="aerobic"
                  :anaerobic="anaerobic"
                  :drinking-beer="drinkingBeer">
</summary-info>

<div v-if="!shouldLoadEntries">
      <button class="button-10" @click="loadThenDisplayEntries()">Charger les données</button>
</div>
<div v-else>
      <div v-for="[date, oneDayItem] in entryMap" :key="date">
            <one-day    :date="oneDayItem.date"
                        :entries="oneDayItem.entries"
                        :shouldBeDisplayed="entriesShouldBeDisplayed"
                        v-on:on-load-entry-by-date="onLoadEntryByDate"
                        @on-select-day="onSelectDay"
                        v-model:isEnteringItems="oneDayItem.isEnteringItems"
                        v-model:isDisplayingItems="oneDayItem.isDisplayingItems">
            </one-day>
      </div>
</div>

</template>

<script setup>
import OneDay from './OneDay.vue';
import SummaryInfo from './SummaryInfo.vue'
import { ref, reactive, defineEmits, defineProps, onUpdated, onMounted, isReactive } from 'vue'
import { createOneDayItem } from '@/oneday';
import { useFetchOneDayItem } from '@/entries';

const fromDate = ref("");
const toDate = ref("");


const entriesShouldBeDisplayed = ref(true);

const ingestedKcal = ref(0.0);
const spentKcal = ref(0.0);
const sportDuration = ref(0.0);
const drinkingBeer = ref(0.0);
const anaerobic = ref(0.0);
const aerobic = ref(0.0);

const shouldLoadEntries = ref();

const entryMap = ref(new Map());
const lastSelectedDate = ref();

const props = defineProps(["initialDate", "numberOfDays", "hasLoadedEntries"]);

// Load the hidden period
function loadThenDisplayEntries() {
      shouldLoadEntries.value = true;
      loadPeriodEntries();
}

// Called after an update from OneDay to load the new value
function onLoadEntryByDate(sDate) {
      const formerOneDayItem = entryMap.value.get(sDate);
      let isEnteringItems = false;
      let isDisplayingItems = false;
      if (isReactive(formerOneDayItem)) {
            isEnteringItems = formerOneDayItem.isEnteringItems;
            isDisplayingItems = formerOneDayItem.isDisplayingItems;
      }
      const { oneDayItem } = useFetchOneDayItem(sDate);
      oneDayItem.isDisplayingItems = isDisplayingItems;
      oneDayItem.isEnteringItems = isEnteringItems;

      entryMap.value.set(sDate, oneDayItem);
}

function onSelectDay(sDate, isEnteringItems, isDisplayingItems) {

      const oneDayItem = entryMap.value.get(sDate);
      console.log("onePeriod oneDayItem.isDisplayingItems ", oneDayItem.isDisplayingItems, isDisplayingItems);
      console.log("onePeriod oneDayItem.isEnteringItems", oneDayItem.isEnteringItems, isEnteringItems);
      
      if (lastSelectedDate.value != null && lastSelectedDate.value != sDate) {
            const lastSelectedItem = entryMap.value.get(lastSelectedDate.value);
            lastSelectedItem.isDisplayingItems = false;
            lastSelectedItem.isEnteringItems = false;
      }

      //No need to update oneDayItem because of the defineModel
      //value has already been changed in the OneDay.
      //const oneDayItem = entryMap.value.get(sDate);
      //oneDayItem.isDisplayingItems = isDisplayingItems;
      //oneDayItem.isEnteringItems = isEnteringItems;
      lastSelectedDate.value = sDate;      
}


function loadPeriodEntries() {     
      let initialDate = props.initialDate;
      let date = null;
      for (let days = 0; days < props.numberOfDays; days++) {
            date = new Date(initialDate.valueOf());
            date.setDate(date.getDate() + days);
            if (shouldLoadEntries.value) {
                  if (date <= Date.now()) {
                        const sDate = date.toISOString().split("T")[0];

                        // Keep the entering and displaying boolean even after reloading
                        // means we keep the food selection opened after clicking. otherwise, we 
                        // reset to false and hide the food selection which is really annoying.
                        const formerOneDayItem = entryMap.value.get(sDate);
                        let isEnteringItems = false;
                        let isDisplayingItems = false;
                        if (isReactive(formerOneDayItem)) {
                              isEnteringItems = formerOneDayItem.isEnteringItems;
                              isDisplayingItems = formerOneDayItem.isDisplayingItems;
                        }
                        //loadEntriesByDate(date.toISOString().split("T")[0]);
                        const { oneDayItem } = useFetchOneDayItem(sDate);
                        oneDayItem.isDisplayingItems = isDisplayingItems;
                        oneDayItem.isEnteringItems = isEnteringItems;
                        entryMap.value.set(sDate, oneDayItem);
                        console.log("oneDayItem " + JSON.stringify(oneDayItem));
                        // TODO : Find another way
                        entryMap.value = new Map([...entryMap.value.entries()].sort((a, b) => b[0].localeCompare(a[0])));
                        //entryMap.value = new Map([...entryMap.entries()].sort());
                  }
            }
      }
      fromDate.value = initialDate.toISOString().split("T")[0];
      toDate.value = date.toISOString().split("T")[0];

      console.log("fromDate " + fromDate.value + " " + "toDate " + toDate.value);
      //fromDate.value = "2024-07-12";
      //toDate.value = "2024-07-26";
}

function getSummaryInfo() {
      fetch(process.env.VUE_APP_URL + '/entry/summary-info?fromDate=' + fromDate.value + '&toDate=' + toDate.value, {
		method: 'GET',
		headers: {
			'Authorization' : 'Bearer ' + localStorage.getItem("token"),
		}
	})
      .then(response => {
            console.log(response.status);
            if (response.ok) {
                  return response.json();
            }
      })
      .then(summaryInfo => {
            console.log("summaryInfo " + summaryInfo);
            spentKcal.value = summaryInfo.spentKcal;
            ingestedKcal.value = summaryInfo.ingestedKcal;
            sportDuration.value = summaryInfo.sportDuration;
            drinkingBeer.value = summaryInfo.drinkingBeer;
            anaerobic.value = summaryInfo.anaerobic;
            aerobic.value = summaryInfo.aerobic;
      })
      .catch(error => {
        console.log("summaryInfo " + error);
      });
}

onMounted(() => {
      shouldLoadEntries.value = props.hasLoadedEntries;
      loadPeriodEntries();
      getSummaryInfo();
});


onUpdated(() => {
      if (shouldLoadEntries.value != true && shouldLoadEntries.value != props.hasLoadedEntries) {
            shouldLoadEntries.value = true;
            loadPeriodEntries();
      }
});

</script>

<style>
/* CSS */
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
</style>