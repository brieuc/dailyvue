<template>
<div v-for="[date, entries] in entryMap" :key="date">
  <one-day  :date="date"
            :entries="entries"
            @on-change-day="onChangeDay"
            @on-display-day="onDisplayDay">
          
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

  </one-day>
  <p></p>
</div>
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
      entriesShouldBeDisplayed: false,
      nbTreatedEntries: 0,
      selectedCategory: null,
      selectedDay: null,
      displayedDay: null,
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
      
      //let entries = this.entryMap.get(this.displayedDay);
      //entries.push(freeEntry);

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
    loadEntriesByDate(sDate) {
        console.log(sDate);
        this.entriesShouldBeDisplayed = false;
        this.nbTreatedEntries = 0;
        fetch(process.env.VUE_APP_URL + '/entry/' + sDate)
        .then(response => {
            return response.json();
        })
        .then(entries => {
          entries.forEach(entry => {
            this.getModel(entry, entries.length);
          });
          this.entryMap.set(sDate, entries);
          // TODO : Find another way
          this.entryMap = new Map([...this.entryMap.entries()].sort((a, b) => b[0].localeCompare(a[0])));
          console.info('entryMap size ' + this.entryMap.size);
        });
    },
    getModel(entry, nbEntries) {
      console.log("entry id " + process.env.VUE_APP_URL + '/model/' + entry.modelId);
      fetch(process.env.VUE_APP_URL + '/model/' + entry.modelId)
      .then(response => response.json())
      .then(model => {
            console.log("title model " + JSON.stringify(model));
            entry.model = model;
            this.nbTreatedEntries++;
            console.log("nb treated entries :" + this.nbTreatedEntries);
            console.log("nb entries :" + nbEntries);
            if (this.nbTreatedEntries === nbEntries) {
              this.entriesShouldBeDisplayed = true;
              console.log("entriesShouldBeDisplayed : " + this.entriesShouldBeDisplayed);
            }
      });
    },
    initDates() {
      fetch(process.env.VUE_APP_URL+ '/entry/firstDate')
      .then(response => response.json())
      .then(entry => {
        const today = new Date();
        let minDate = new Date(entry.date); 
        // loop from start date to end date
        console.log("today . " + today);
        console.log("minDate . " + minDate);
        for (
              let date = today;
              minDate <= date; 
              date.setDate(date.getDate() - 1)
            )
        {
          console.log("load");
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
  border: 1px;
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  width: 200px;
  max-width: 400px;
  margin: auto;
}

@media only screen and (max-width: 393px) {
  #app {
    border: 1px;
    width: 100%;
    text-align: center;
  }
}
</style>
