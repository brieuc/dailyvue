<template>
<div id="border">
    <div @click="selectDay()" style="min-height: 30px; background-color:rebeccapurple; color: white;">
        <span>{{ day }}</span> <span>{{ date }}</span>
    </div>
    <div class="flex" @click="displayDay()">
        <div v-for="entry in entries" :key="entry.id" >
            {{ entry.title }} {{ entry.quantity ? "(" + entry.quantity +")":"" }}
        </div>  
    </div>
</div>
<slot name="category"></slot>
<slot></slot>

<div v-if="displayedDay == date">
    <day-entries :date="date" :entries="entries" 
                    :shouldBeDisplayed="shouldBeDisplayed"
                    v-on:on-update-free-entry="onUpdateFreeEntry"
                    @on-update-sport-entry="onUpdateSportEntry"
                    @on-delete-entry="onDeleteEntry">
    </day-entries>
</div>

<div v-if="selectedDay == date">
    <model-selection @on-select-model="onSelectModel"></model-selection>  
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
</template>

<script>
import ModelFood from './ModelFood.vue';
import ModelSport from './ModelSport.vue';
import ModelFree from './ModelFree.vue';
import ModelSelection from './ModelSelection.vue';
import DayEntries from './DayEntries.vue';
export default {
    components: {
        ModelFood,
        ModelFree,
        ModelSport,
        ModelSelection,
        DayEntries
    },
    emits: ["onChangeDay", "onDisplayDay", "onLoadEntry"],
    props: {
        shouldBeDisplayed: null,
        date: String,
        entries: null,
    },
    data() {
        return {
            selectedDay: null,
            displayedDay: null,
            selectedCategory: null
        }
    },
    computed: {
        day() {
            const days = ["Dimanche", "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"];
            let now = new Date(this.date);
            return days[now.getDay()];
        },
    },
    mounted() {
        console.log("on mounted oneday with entries " + this.entries.length);
    },
    methods: {
        
        selectDay() {
            this.displayedDay = null;
            if (this.date === this.selectedDay) {
                    this.selectedDay = null;
                    return;
            }
            this.selectedDay = this.date;
            console.log('onChangeDay ' + this.date + ' ' + this.selectedDay);
            this.loadEntriesByDate(this.selectedDay);
        },
        displayDay() {
            this.selectedDay = null;
            
            if (this.date === this.displayedDay) {
                this.displayedDay = null;
                return;
            }
            this.displayedDay = this.date;
            console.log('onDisplayDay ' + this.date + ' ' + this.displayedDay);
            this.loadEntriesByDate(this.displayedDay);
        },
        onDeleteEntry(entry) {
            console.log('OneDay.vue onDeleteEntry : ' + JSON.stringify(entry.id));
            this.loadEntriesByDate(this.displayedDay);
        },
        onAddFreeEntry(freeEntry) {
            console.log('OneDay.vue onAddFreeEntry : ' + JSON.stringify(freeEntry));
            this.selectedCategory = null;
            this.loadEntriesByDate(this.selectedDay);

        },
        onUpdateFreeEntry(freeEntry) {
            console.log('OneDay.vue onUpdateFreeEntry : ' + JSON.stringify(freeEntry));
            this.selectedCategory = null;
            this.loadEntriesByDate(this.displayedDay);
            this.displayedDay = null;
        },
        onAddSportEntry(sportEntry) {
            console.log('OneDay.vue onAddSportEntry: ' + JSON.stringify(sportEntry));
            this.selectedCategory = null;
            this.loadEntriesByDate(this.selectedDay);
        },
        onUpdateSportEntry(sportEntry) {
            console.log('OneDay.vue onUpdateSportEntry: ' + JSON.stringify(sportEntry));
            this.selectedCategory = null;
            this.loadEntriesByDate(this.displayedDay);
        },
        onUpdateFoodEntry(foodEntry) {
            console.log('OneDay.vue onUpdateFoodEntry: ' + JSON.stringify(foodEntry));
            this.loadEntriesByDate(this.selectedDay);
        },
        onSelectModel(categoryName) {
            console.log('OneDay.vue onSelectModel ' + categoryName);
            this.selectedCategory = categoryName;
        },
        loadEntriesByDate(sDate) {
            console.log("OneDay.vue loadEntriesByDate " + sDate);
            this.$emit("onLoadEntry", sDate);
        }
    }
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