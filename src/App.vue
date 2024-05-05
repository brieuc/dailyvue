<template>
  <ul v-for="[date, entries] in entryMap" :key="date">
    <one-day  :date="date"
              :entries="entries"
              @on-change-day="onChangeDay">
            
      <div v-if="selectedDay == date">
        <div>
          <day-entries :date="date" :entries="entries"></day-entries>
        </div>
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

    </one-day>
  </ul>
</template>

<script>
import ModelFood from './components/ModelFood.vue';
import ModelSport from './components/ModelSport.vue';
import ModelFree from './components/ModelFree.vue';
import ModelSelection from './components/ModelSelection.vue';
import OneDay from './components/OneDay.vue';
import DayEntries from './components/DayEntries.vue';

export default {
  name: 'App',
  components: {
    ModelFood,
    ModelFree,
    ModelSport,
    ModelSelection,
    OneDay,
    DayEntries,
  },
  data() {
    return {
      refreshOneDay: false,
      selectedCategory: null,
      selectedDay: null,
      entryMap: new Map(),
      modelMap: new Map(), 
      selectedEntry: null,
      model: [
        /*
        {
          id: 'a9671a7a-7206-42a3-a5b2-99c67abdcdec',
          label: 'Branche Cailler',
          description: '',
          kcal: 160
        }*/
      ]
    }
  },
  methods: {
    onAddFreeEntry(freeEntry) {
      console.log('onAddFreeEntry : ' + JSON.stringify(freeEntry));
      this.selectedCategory = null;
      this.loadEntriesByDate(this.selectedDay);
    },
    onAddSportEntry(sportEntry) {
      console.log('onAddSportEntry: ' + JSON.stringify(sportEntry));
      this.selectedCategory = null;
      this.loadEntriesByDate(this.selectedDay);
    },
    onUpdateFoodEntry(foodEntry) {
      console.log('onUpdateFoodEntry: ' + JSON.stringify(foodEntry));
      this.loadEntriesByDate(this.selectedDay);
    },
    onSelectModel(categoryName) {
      console.log('onSelectModel ' + categoryName);
      this.selectedCategory = categoryName;
    },

    onChangeDay(date) {
      console.log('onChangeDay');
      if (date === this.selectedDay) {
        this.selectedDay = null;
        return;
      }
      this.selectedDay = date;
      this.loadEntriesByDate(this.selectedDay);
    },
    loadEntriesByDate(sDate) {
        fetch(process.env.VUE_APP_URL + '/entry/' + sDate)
        .then(response => {
            return response.json();
        })
        .then(entries => {
          this.entryMap.set(sDate, entries);
          // TODO : Find another way
          this.entryMap = new Map([...this.entryMap.entries()].sort((a, b) => b[0].localeCompare(a[0])));
          console.info('entryMap size ' + this.entryMap.size);
        });
    },
    initDates() {
      fetch(process.env.VUE_APP_URL+ '/entry/firstDate')
      .then(response => response.json())
      .then(entry => {
        const today = new Date();
        let minDate = new Date(entry.date); 
        // loop from start date to end date
        for (
              let date = today;
              minDate <= date; 
              date.setDate(date.getDate() - 1)
            )
        {
          this.loadEntriesByDate(date.toISOString().split("T")[0]);
        }
      })

    },
    /*, Remonté au dessus directement en utilisant le then juste après.
    async getMinDate() {
      let minDate = 0;
      const response = await fetch(this.serverUrl + '/entry/firstDate');
      const data = await response.json();
      console.log('data ' + data);
      return data;
      },
      */
  },
  mounted() {
    // dates array creation then fill the one-day component
    // which call the entry service for each date.
    // the entryMapForSelectedDay contains the entries for this specific day
    this.initDates();
  }
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}
</style>
