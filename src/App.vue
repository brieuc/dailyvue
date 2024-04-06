<template>
  <ul v-for="[date, entries] in entryMap" :key="date">
    <one-day  :date="date"
              :entries="entries"
              @on-change-day="onChangeDay">
            
      <div v-if="selectedDay == date">
        <!-- works but models in a map -->
        <ul v-for="[, model] in modelMap" :key="model.id">
          <model-entry @on-update-entry="onUpdateEntry"
            :modelId="model.id"
            :label="model.label"
            :description="model.description"
            :kcal="model.kcal"
            :quantity="model.quantity"
            :entryId="model.entryId">
          </model-entry>
        </ul>
      </div>
    </one-day>
  </ul>

</template>

<script>
import ModelEntry from './components/ModelEntry.vue';
import OneDay from './components/OneDay.vue';

export default {
  name: 'App',
  components: {
    ModelEntry,
    OneDay
  },
  data() {
    return {
      dates: [],
      selectedDay: null,
      entryMap: new Map(),
      modelMap: new Map(), 
      selectedEntry: null,
      serverUrl: process.env.VUE_APP_URL,
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
    onUpdateEntry(modelId, entryId, newQuantity) {
      let fetchMethod = '';
      let url = '';
      let bodyFetch = '';
      let entriesForSelectedDay = this.entryMap.get(this.selectedDay);
      let activeEntry = entriesForSelectedDay.get(modelId);
      // If there is no entry for this model Id, we need to POST
      if (activeEntry != null) {
        activeEntry.quantity = newQuantity;
        fetchMethod = 'PUT';
        url = this.serverUrl + '/entry/' + entryId;
        bodyFetch = JSON.stringify({
          entryId: activeEntry.id,
          quantity: newQuantity,
          description: activeEntry.description,
        });
      }
      else {
        fetchMethod = 'POST';
        url = process.env.VUE_APP_URL + '/entry';
        console.log(url);
        bodyFetch = JSON.stringify({
          quantity: newQuantity,
          modelId: modelId,
          date: this.selectedDay
        });
      }
      fetch(url, {
        method: fetchMethod,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: bodyFetch,
      })
      .then(response => {
        if (response.ok)
          return response.json();
      })
      .then(json => {
        let newEntry = json;
        let activeModel = this.modelMap.get(newEntry.modelId);
        activeModel.quantity = newEntry.quantity;

        if (activeModel.quantity === 0) {
          console.log('quantity : ' + activeModel.quantity);
          entriesForSelectedDay.delete(newEntry.modelId)
        }
        else {
          activeModel.entryId = newEntry.id;
          entriesForSelectedDay.set(newEntry.modelId, newEntry);
        }

      });
    },
    onChangeDay(date) {
      console.log('onChangeDay');
      this.selectedDay = date;
      fetch(this.serverUrl + '/entry/' + this.selectedDay)
      .then(response => {
        if(response.ok) {
          return response.json()
        }
      })
      .then(json => {
        this.modelMap.forEach((model, key) => {
          console.log(key);
          model.quantity = 0;
          model.entryId = '';
          model.entry = null;
        });

        json.forEach(entry => {

          var currentModel = this.modelMap.get(entry.modelId);
          var quantity = entry.quantity;
          currentModel.quantity = quantity;
          currentModel.entryId = entry.id;
          }
        );     
      })
    },
    loadEntriesByDate(sDate) {
        fetch(this.serverUrl + '/entry/' + sDate)
        .then(response => {
            return response.json();
        })
        .then(entries => {
          let entryMapForSelectedDay = new Map();
          entries.forEach((entry, index) => {
            if (entry.quantity > 0)
              entryMapForSelectedDay.set(entry.modelId, entry);
          });
          this.entryMap.set(sDate, entryMapForSelectedDay);
          // TODO : Find another way
          this.entryMap = new Map([...this.entryMap.entries()].sort((a, b) => b[0].localeCompare(a[0])));
          //this.entryMap = new Map([...this.entryMap.entries()].sort());
          console.info('entryMap size ' + this.entryMap.size);

        });
    },
    initDates() {
      console.log('inidtes');
      fetch(this.serverUrl + '/entry/firstDate')
      .then(response => response.json())
      .then(entry => {
        console.log('then2');
        console.log('date ' + entry.date);
        
        const today = new Date();
        let minDate = new Date(entry.date); 
        // loop from start date to end date
        console.log(minDate);
        for (
              let date = today;
              minDate <= date; 
              date.setDate(date.getDate() - 1)
            )
        {
          console.log(date.toISOString().split("T")[0]);
          this.loadEntriesByDate(date.toISOString().split("T")[0]);
        }
      })

    },
    getModels() {
      fetch(this.serverUrl + '/model')
      .then(response => {
        if(response.ok) {
          return response.json()
        }
      })
      .then(json => {
        json.forEach(model => {
          this.modelMap.set(model.id, model);
          //var entry = this.entryMapForSelectedDay.get(model.id);
          //console.log(entry.description);
          //this.entryMapForSelectedDay.forEach(
          //  (value, key) => console.log(value.description + ' ' + key))
        });

          //model.quantity = entry.quantity;
          //this.modelMap.set(entry.modelId, entry);
         // Map.from(this.modelMap).forEach(test => console.log(test + ' ' + 1));
          /*
          const entry = this.entryMapForSelectedDay.get(value.id);
          value.quantity = entry.quantity;
          console.log(key + ' ' + entry.quantity);
          */
      })
    }
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
    console.log('serveur ' + this.serverUrl);
    // dates array creation then fill the one-day component
    // which call the entry service for each date.
    // the entryMapForSelectedDay contains the entries for this specific day
    this.initDates();
    // then the getModels should load the models (all of them) and 
    // fill in the models with the number of entries for this day.
    // Amongst the models, not all of them will be used for the selected
    // day.
    this.getModels();
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
