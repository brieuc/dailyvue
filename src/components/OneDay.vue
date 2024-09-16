<template>
<div>
<div id="border">
    <one-day-header @on-click-header-day="selectDay()"
                    :day="day" :date="date"
                    :spent-kcal="spentKcal"
                    :drinking-beer="drinkingBeer"
                    :ingested-kcal="ingestedKcal"
                    :sport-duration="sportDuration"></one-day-header>
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
        <div v-for="entry in entries" :key="entry.id" >
            {{ entry.title }} {{ getQuantity(entry) }}
        </div>  
    </div>
</div>
<slot name="category"></slot>
<slot></slot>

<div v-if="isDisplayingItems">
    <day-entries :date="date" :entries="entries" 
                    :shouldBeDisplayed="shouldBeDisplayed"
                    v-on:on-update-free-entry="onUpdateFreeEntry"
                    @on-update-sport-entry="onUpdateSportEntry"
                    @on-delete-entry="onDeleteEntry">
    </day-entries>
</div>


</div>
</template>

<script setup>
import OneDayHeader from './OneDayHeader.vue';
import ModelFood from './ModelFood.vue';
import ModelSport from './ModelSport.vue';
import ModelFree from './ModelFree.vue';
import ModelSelection from './ModelSelection.vue';
import DayEntries from './DayEntries.vue';

import { defineEmits, defineProps, defineModel, onUpdated, ref, computed, onMounted } from 'vue';

const emit = defineEmits(["onSelectDay", "onLoadEntryByDate"]);
const props = defineProps([ "shouldBeDisplayed", "date", "entries"]);

const selectedDay = ref();
const displayedDay = ref();
const selectedCategory = ref();
const isDisplayingItems = defineModel("isDisplayingItems")
const isEnteringItems = defineModel("isEnteringItems");

const sportDuration = ref();
const ingestedKcal = ref();
const spentKcal = ref();
const drinkingBeer = ref();



const day = computed( () => {
    const days = ["Dimanche", "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"];
    let now = new Date(props.date);
    return days[now.getDay()];
})

onMounted(() => {
    getSummaryInfo();
})

onUpdated(() => {
    //console.log("oneday updated " + this.date + " " + this.enteringItems + " " + this.displayingItems);
    console.log("props oneday updated " + props.date + " " + isEnteringItems.value + " " + isDisplayingItems.value);
    getSummaryInfo();
})

function getSummaryInfo() {
      fetch(process.env.VUE_APP_URL + '/entry/summary-info?fromDate=' + props.date + '&toDate=' + props.date, {
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
            spentKcal.value = summaryInfo.spentKcal;
            ingestedKcal.value = summaryInfo.ingestedKcal;
            sportDuration.value = summaryInfo.sportDuration;
            drinkingBeer.value = summaryInfo.drinkingBeer;
      });
}

function getQuantity(entry) {
    if (entry.quantity > 1)
        return "(" + entry.quantity + ")";
    else
        return "";
}
    
function selectDay() {
    console.log("select day");
    displayedDay.value = null;
    if (isEnteringItems.value) {
        isEnteringItems.value = false;
    }
    else {
        isEnteringItems.value = true
    }
    isDisplayingItems.value = false;
    selectedDay.value = props.date;
    emit("onSelectDay", props.date, isEnteringItems.value, isDisplayingItems.value);
    //this.loadEntriesByDate(this.selectedDay);
}
    
function displayDay() {
    console.log("display day");
    selectedDay.value = null;
    if (isDisplayingItems.value) {
        isDisplayingItems.value = false;
    }
    else {
        isDisplayingItems.value = true;
    }
    isEnteringItems.value = false;
    displayedDay.value = props.date;
    emit("onSelectDay", props.date, isEnteringItems.value, isDisplayingItems.value);
    //this.loadEntriesByDate(this.displayedDay);
}

function onDeleteEntry(entry) {
    console.log("deleting entry : " + JSON.stringify(entry));
    loadEntriesByDate(displayedDay.value);
}

function onAddFreeEntry(freeEntry) {
    selectedCategory.value = null;
    loadEntriesByDate(selectedDay.value);
}

function onUpdateFreeEntry(freeEntry) {
    console.log('OneDay.vue onUpdateFreeEntry : ' + JSON.stringify(freeEntry));
    selectedCategory.value = null;
    loadEntriesByDate(displayedDay.value);
    //displayedDay.value = null;
}

function onAddSportEntry(sportEntry) {
    console.log('OneDay.vue onAddSportEntry: ' + JSON.stringify(sportEntry));
    selectedCategory.value = null;
    loadEntriesByDate(selectedDay.value);
}

function onUpdateSportEntry(sportEntry) {
    console.log('OneDay.vue onUpdateSportEntry: ' + JSON.stringify(sportEntry));
    selectedCategory.value = null;
    loadEntriesByDate(displayedDay.value);
}

function onUpdateFoodEntry(foodEntry) {
    console.log('OneDay.vue onUpdateFoodEntry: ' + JSON.stringify(foodEntry));
    loadEntriesByDate(selectedDay.value);
}

function onSelectModel(categoryName) {
    console.log('OneDay.vue onSelectModel ' + categoryName);
    selectedCategory.value = categoryName;
}

function loadEntriesByDate(sDate) {
    emit("onLoadEntryByDate", sDate);
}

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