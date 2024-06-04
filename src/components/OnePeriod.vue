<template>

<summary-info     :fromDate="fomDate"
                  :toDate="toDate">
</summary-info>

<div v-for="[date, entries] in entryMap" :key="date">

      <one-day    :date="date"
                  :entries="entries"
                  @on-change-day="onChangeDay"
                  @on-display-day="onDisplayDay">
      </one-day>

</div>
</template>

<script setup>
import OneDay from './OneDay.vue';
import SummaryInfo from './SummaryInfo.vue'
import { ref, reactive, defineEmits, defineProps, onUpdated, onMounted } from 'vue'

const fromDate = "2022-01-01";
const toDate = "2022-12-01";


let entriesShouldBeDisplayed = ref(false);
let nbTreatedEntries = ref(0);

let entryMap = reactive(new Map());

const props = defineProps(["initialDate", "numberOfDays"]);


function onChangeDay() {
      console.log('onChangeDay');
}

function onDisplayDay() {
      console.log('onDisplayDay');
}

function loadEntriesByDate(sDate) {
      console.log('loadEntriesByDate ' + sDate);
      entriesShouldBeDisplayed.value = false;
      nbTreatedEntries.value = 0;
      fetch(process.env.VUE_APP_URL + '/entry/' + sDate)
      .then(response => {
            return response.json();
      })
      .then(entries => {
            
            entries.forEach(entry => {
                  getModel(entry, entries.length);
            });
            
            entryMap.set(sDate, entries);
            // TODO : Find another way
            entryMap = new Map([...entryMap.entries()].sort((a, b) => b[0].localeCompare(a[0])));
            console.info('entryMap size ' + entryMap.get(sDate).length + ' for day ' + sDate);
      });
}

function getModel(entry, nbEntries) {
      console.log("entry id " + process.env.VUE_APP_URL + '/model/' + entry.modelId);
      fetch(process.env.VUE_APP_URL + '/model/' + entry.modelId)
      .then(response => response.json())
      .then(model => {
            console.log("title model " + JSON.stringify(model));
            entry.model = model;
            nbTreatedEntries.value++;
            console.log("nb treated entries :" + nbTreatedEntries.value);
            console.log("nb entries :" + nbEntries);
            if (nbTreatedEntries.value === nbEntries) {
                  entriesShouldBeDisplayed.value = true;
                  console.log("entriesShouldBeDisplayed : " + entriesShouldBeDisplayed.value);
            }
      });
}

function initDates() {
      
      let initialDate = props.initialDate;
      let date = null;
      for (let days = 0; days <= props.numberOfDays; days++) {
            date = new Date(initialDate.valueOf());
            date.setDate(date.getDate() + days);
            console.log('init date : ' + date.toISOString().split("T")[0] + " for weeks " + props.initialDate);
            loadEntriesByDate(date.toISOString().split("T")[0]);
      }
}

onMounted(() => {
      console.log('props.initialDate : ' + props.initialDate);
      console.log('props.numberOfDays : ' + props.numberOfDays);
      initDates();
});

</script>