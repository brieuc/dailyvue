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
        <day-entries :date="date" :entries="entries" :shouldBeDisplayed="entriesShouldBeDisplayed"
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
    emits: ["onChangeDay", "onDisplayDay"],
    props: {
        date: String,
        entries: null,
    },
    data() {
        return {
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
        console.log("on mounted oneday");
    },
    methods: {
        /*
        selectDay() {
            this.$emit('onChangeDay', this.date);
        },
        displayDay() {
            this.$emit('onDisplayDay', this.date);
        },
        */
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
        onDisplayDay(date) {
            this.selectedDay = null;
            console.log('onDisplayDay');
            if (date === this.displayedDay) {
                this.displayedDay = null;
                return;
            }
            this.displayedDay = date;
            this.loadEntriesByDate(this.displayedDay);
        },
        onChangeDay(date) {
            this.displayedDay = null;
            console.log('onChangeDay');
            if (date === this.selectedDay) {
                this.selectedDay = null;
                return;
            }
            this.selectedDay = date;
            this.loadEntriesByDate(this.selectedDay);
        },
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