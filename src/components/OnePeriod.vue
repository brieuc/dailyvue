<template>

<summary-info     :fromDate="fromDate"
                  :toDate="toDate"
                  :ingestedKcal="ingestedKcal"
                  :spentKcal="spentKcal"
                  :sportDuration="sportDuration">
</summary-info>

<div v-for="[date, entries] in entryMap" :key="date">

      <one-day    :date="date"
                  :entries="entries"
                  :shouldBeDisplayed="entriesShouldBeDisplayed"
                  v-on:onLoadEntry="onLoadEntry">
      </one-day>

</div>
</template>

<script setup>
import OneDay from './OneDay.vue';
import SummaryInfo from './SummaryInfo.vue'
import { ref, reactive, defineEmits, defineProps, onUpdated, onMounted } from 'vue'

let fromDate = ref("");
let toDate = ref("");


let entriesShouldBeDisplayed = ref(false);
let nbTreatedEntries = ref(0);

let ingestedKcal = ref(0);
let spentKcal = ref(0);
let sportDuration = ref(0);

let entryMap = ref(new Map());

const props = defineProps(["initialDate", "numberOfDays"]);

function onLoadEntry(sDate) {
      console.log("onLoadEntry");
      loadEntriesByDate(sDate);
}

function loadEntriesByDate(sDate) {
      console.log('loadEntriesByDate ' + sDate);
      entriesShouldBeDisplayed.value = false;
      nbTreatedEntries.value = 0;
      fetch(process.env.VUE_APP_URL + '/entry/' + sDate, {
		method: 'GET',
		headers: {
			'Authorization' : 'Bearer ' + localStorage.getItem("token"),
		}
	})
      .then(response => {
            return response.json();
      })
      .then(entries => {
            
            entries.forEach(entry => {
                  getModel(entry, entries.length);
            });
            
            entryMap.value.set(sDate, entries);
            // TODO : Find another way
            entryMap.value = new Map([...entryMap.value.entries()].sort((a, b) => b[0].localeCompare(a[0])));
            //entryMap.value = new Map([...entryMap.entries()].sort());
            console.info('entries size ' + entryMap.value.get(sDate).length + ' for day ' + sDate);
            console.info('map size ' + entryMap.value.size + ' for initial day ' + props.initialDate);
      });
}

function getModel(entry, nbEntries) {
      console.log("entry id " + process.env.VUE_APP_URL + '/model/' + entry.modelId);
      fetch(process.env.VUE_APP_URL + '/model/' + entry.modelId, {
		method: 'GET',
		headers: {
			'Authorization' : 'Bearer ' + localStorage.getItem("token"),
		}
	})
      .then(response => response.json())
      .then(model => {
            entry.model = model;
            nbTreatedEntries.value++;
            if (nbTreatedEntries.value === nbEntries) {
                  entriesShouldBeDisplayed.value = true;
            }
      });
}

function initDates() {
      
      let initialDate = props.initialDate;
      let date = null;
      for (let days = 0; days < props.numberOfDays; days++) {
            date = new Date(initialDate.valueOf());
            date.setDate(date.getDate() + days);
            // We don't want to load the day after today
            if (date <= Date.now()) {
                  loadEntriesByDate(date.toISOString().split("T")[0]);
            }
      }
      fromDate.value = initialDate.toISOString().split("T")[0];
      toDate.value = date.toISOString().split("T")[0];
}

function getSummaryInfo() {
      fetch(process.env.VUE_APP_URL + '/entry/summary-info?fromDate=' + fromDate.value + '&toDate=' + toDate.value, {
		method: 'GET',
		headers: {
			'Authorization' : 'Bearer ' + localStorage.getItem("token"),
		}
	})
      .then(response => response.json())
      .then(summaryInfo => {
            console.log('summary info ' + JSON.stringify(summaryInfo));
            spentKcal.value = summaryInfo.spentKcal;
            ingestedKcal.value = summaryInfo.ingestedKcal;
            sportDuration.value = summaryInfo.sportDuration;
      });

}

onMounted(() => {
      initDates();
      getSummaryInfo();
});

</script>