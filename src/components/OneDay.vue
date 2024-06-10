<template>
    <div id="border">
        <div @click="selectDay()" style="min-height: 30px; background-color:darkslategray; color: white;">
            <span>{{ day }}</span> <span>{{ date }}</span>
        </div>
        <div v-for="entry in entries" :key="entry.id" @click="displayDay()">
            <section>
                {{ entry.title }} {{ entry.quantity ? "(" + entry.quantity +")":"" }}
            </section>
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
            console.log('App.vue onDeleteEntry : ' + JSON.stringify(entry.id));
            this.loadEntriesByDate(this.displayedDay);
        },
        onAddFreeEntry(freeEntry) {
            console.log('App.vue onAddFreeEntry : ' + JSON.stringify(freeEntry));
            this.selectedCategory = null;
            this.loadEntriesByDate(this.selectedDay);
        },
        onUpdateFreeEntry(freeEntry) {
            console.log('App.vue onUpdateFreeEntry : ' + JSON.stringify(freeEntry));
            this.selectedCategory = null;
            this.loadEntriesByDate(this.displayedDay);
            this.displayedDay = null;
        },
        onAddSportEntry(sportEntry) {
            console.log('onAddSportEntry: ' + JSON.stringify(sportEntry));
            this.selectedCategory = null;
            this.loadEntriesByDate(this.selectedDay);
        },
        onUpdateSportEntry(sportEntry) {
            console.log('App.vue onUpdateSportEntry: ' + JSON.stringify(sportEntry));
            this.selectedCategory = null;
            this.loadEntriesByDate(this.displayedDay);
        },
        onUpdateFoodEntry(foodEntry) {
            console.log('onUpdateFoodEntry: ' + JSON.stringify(foodEntry));
            this.loadEntriesByDate(this.selectedDay);
        },
        onSelectModel(categoryName) {
            console.log('onSelectModel ' + categoryName);
            this.selectedCategory = categoryName;
        },
        loadEntriesByDate(sDate) {
            console.log("loadEntriesByDate " + sDate);
            this.$emit("onLoadEntry", sDate);
        }
    }
}
</script>

<style>
#border {
    border: 1px;
    --border-radius: 5px;
    border-color: black;
    border-style: solid;
    cursor: pointer;
    margin: auto;
    width: 200px;
    --box-shadow: 0 2px 2px rgba(0, 0, 0, 0.26);
    --padding: 1rem;
}

@media only screen and (max-width: 393px) {
  #border {
    border: 1px;
    --border-radius: 5px;
    border-color: black;
    border-style: solid;
    cursor: pointer;
    width: 100%;
    --box-shadow: 0 2px 2px rgba(0, 0, 0, 0.26);
  }
}
</style>