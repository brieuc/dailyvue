<template>
  <ul v-for="date in dates" :key="date">
    <one-day :date="date" @on-change-day="onChangeDay"></one-day>
  </ul>
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
      console.log('modelId' + modelId);
      var fetchMethod = '';
      var url = '';
      var bodyFetch = '';
      var entry = this.entryMap.get(modelId);
      console.log('entry : ' + entry);
      // If there is no entry for this model Id, we need to POST
      if (entry != null) {
        fetchMethod = 'PUT';
        url = 'http://localhost:8080/entry/' + entryId;
        bodyFetch = JSON.stringify({
          entryId: entry.id,
          quantity: newQuantity,
          description: entry.description,
        })
      }
      else {
        fetchMethod = 'POST';
        url = 'http://localhost:8080/entry';
        bodyFetch = JSON.stringify({
          quantity: newQuantity,
          modelId: modelId,
          date: this.selectedDay.toISOString().split("T")[0]
        });
      }
      console.log('new quantity :' + newQuantity);
      fetch(url, {
        method: fetchMethod,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: bodyFetch,
      });
      this.updateEntry(modelId, fetchMethod);

    },
    updateEntry(modelId, fetchMethod) {

    },
    onChangeDay(date) {
      console.log('onChangeDay');
      this.entryMap.clear();
      this.selectedDay = date;
      fetch('http://localhost:8080/entry/' + this.selectedDay.toISOString().split("T")[0])
      .then(response => {
        if(response.ok) {
          return response.json()
        }
      })
      .then(json => {
        this.modelMap.forEach((model, key) => {
          console.log(key);
          model.quantity = 0;
          model.entryId = 0;
        });

        json.forEach(entry => {
          this.entryMap.set(entry.modelId, entry);
          console.log('add to entryMap : ' + entry.modelId + ' ' + entry.description);
          var currentModel = this.modelMap.get(entry.modelId);
          console.log(typeof entry.quantity);
          var quantity = entry.quantity;
          currentModel.quantity = quantity;
          console.log(typeof currentModel.quantity);
          currentModel.entryId = entry.id;
          currentModel.entry = entry;
          }
        );     
      })
    },
    initDates() {
      const today = new Date();
      const endDate = new Date().setDate(today.getDate() - 10);
      // loop from start date to end date
      for (
            let date = today; 
            date > endDate; 
            date.setDate(date.getDate() - 1)
          )
      {
        this.dates.push(new Date(date));
      }
    },
    getModels() {
      fetch('http://localhost:8080/model')
      .then(response => {
        if(response.ok) {
          return response.json()
        }
      })
      .then(json => {
        console.log(json)
        console.log('getModel size ' + this.entryMap.size);
        json.forEach(model => {
          this.modelMap.set(model.id, model);
          //var entry = this.entryMap.get(model.id);
          //console.log(entry.description);
          //this.entryMap.forEach(
          //  (value, key) => console.log(value.description + ' ' + key))
        });
        console.log('modelMap size ' + this.modelMap.size);

          //model.quantity = entry.quantity;
          //this.modelMap.set(entry.modelId, entry);
         // Map.from(this.modelMap).forEach(test => console.log(test + ' ' + 1));
          /*
          const entry = this.entryMap.get(value.id);
          value.quantity = entry.quantity;
          console.log(key + ' ' + entry.quantity);
          */
      })
    }
  },
  mounted() {
    // dates array creation then fill the one-day component
    // which call the entry service for each date.
    // the entryMap contains the entries for this specific day
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
